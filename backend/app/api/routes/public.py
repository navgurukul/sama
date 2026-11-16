"""Public website endpoints: donations, contributions, reports and impact statistics."""

from __future__ import annotations

import os
import re
import traceback
import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from fastapi import APIRouter, HTTPException, Response

from ...core.config import DONOR_TABLE
from ...core.db import DB_SCHEMA, get_conn
from ...core.paths import BACKEND_DIR, REPO_DIR
from ...domain.reporting.geo import VALID_INDIAN_STATES, normalize_state_name
from ...integrations.email import _send_email_common

router = APIRouter()


@router.post("/api/public/donate")
def public_donate(payload: dict):
    try:
        first_name = payload.get("firstName", "").strip()
        last_name = payload.get("lastName", "").strip()
        email = payload.get("email", "").strip()
        phone = payload.get("phone", "").strip()
        contribution_type = payload.get("contributionType", "").strip()
        company_name = payload.get("companyName", "").strip()
        donation_type = payload.get("donationType", "").strip()
        number_of_laptops = payload.get("numberOfLaptops")
        message = payload.get("message", "").strip()

        num_laptops = 0
        if number_of_laptops:
            try:
                num_laptops = int(number_of_laptops)
            except Exception:
                num_laptops = 0

        poc_name = f"{first_name} {last_name}".strip()
        donor_company = company_name if contribution_type == "company" else "Individual"
        
        import uuid
        pickup_id = f"PK-{uuid.uuid4().hex[:8].upper()}"

        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(f"""
                    INSERT INTO {DB_SCHEMA}.pickup (
                        pickup_id, donor_company, poc_name, poc_contact, poc_email, 
                        number_of_laptops, pickup_location, status, current_date_time, updated_on
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, now(), now()
                    )
                """, (
                    pickup_id, donor_company, poc_name, phone, email, 
                    num_laptops, message or "Online Submission", "Pending"
                ))
                conn.commit()

        return {"status": "success", "message": "Donation details successfully recorded.", "pickup_id": pickup_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/public/contribute")
def public_contribute(payload: dict):
    try:
        import uuid
        form_type = payload.get("formType", "give_individual")
        first_name = str(payload.get("firstName") or "").strip()
        last_name = str(payload.get("lastName") or "").strip()
        email = str(payload.get("email") or "").strip()
        phone = str(payload.get("phone") or "").strip()
        city = str(payload.get("city") or "").strip()
        state = str(payload.get("state") or "").strip()
        
        contribution_type = str(payload.get("contributionType") or ("company" if form_type == "give_corporate" else "individual")).strip()
        company_name = str(payload.get("companyName") or "").strip()
        designation = str(payload.get("designation") or "").strip()
        donation_intent = str(payload.get("donationIntent") or "").strip()
        
        number_of_laptops = payload.get("numberOfLaptops")
        num_laptops = 0
        if number_of_laptops is not None:
            try:
                num_laptops = int(number_of_laptops)
            except Exception:
                import re
                match = re.search(r'\d+', str(number_of_laptops))
                num_laptops = int(match.group()) if match else 0
            
        device_condition = str(payload.get("deviceCondition") or "").strip()
        device_brand = str(payload.get("deviceBrand") or "").strip()
        device_age = str(payload.get("deviceAge") or "").strip()
        pickup_address = str(payload.get("pickupAddress") or "").strip()
        decommission_timeline = str(payload.get("decommissionTimeline") or "").strip()
        data_wiping_needed = bool(payload.get("dataWipingNeeded", False))
        
        applicant_category = str(payload.get("applicantCategory") or "").strip()
        education_course = str(payload.get("educationCourse") or "").strip()
        purpose = str(payload.get("purpose") or "").strip()
        family_income = str(payload.get("familyIncome") or "").strip()
        
        hear_about = str(payload.get("hearAbout") or "").strip()
        message = str(payload.get("message") or "").strip()
        receive_updates = bool(payload.get("receiveUpdates", True))
        
        is_give_individual = (form_type == "give_individual")
        is_give_corporate = (form_type == "give_corporate")
        is_need_individual = (form_type == "need_individual")
        is_financial = (form_type == "financial_volunteer")

        # Sanitize data to avoid cross-pollination between donation and request forms
        if is_need_individual:
            num_laptops = 0
            device_condition = ""
            device_brand = ""
            device_age = ""
            pickup_address = ""
            decommission_timeline = ""
            data_wiping_needed = False
            company_name = ""
            designation = ""
        elif is_give_individual:
            company_name = ""
            designation = ""
            decommission_timeline = ""
            data_wiping_needed = False
            applicant_category = ""
            education_course = ""
            purpose = ""
            family_income = ""
        elif is_give_corporate:
            applicant_category = ""
            education_course = ""
            purpose = ""
            family_income = ""
        elif is_financial:
            num_laptops = 0
            device_condition = ""
            device_brand = ""
            device_age = ""
            pickup_address = ""
            decommission_timeline = ""
            data_wiping_needed = False
            company_name = ""
            designation = ""
            applicant_category = ""
            education_course = ""
            purpose = ""
            family_income = ""

        prefix = "REQ" if is_need_individual else "DON"
        random_suffix = uuid.uuid4().hex[:6].upper()
        reference_id = f"SAMA-{prefix}-{random_suffix}"
        
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(f"""
                    CREATE TABLE IF NOT EXISTS {DB_SCHEMA}.public_contributions (
                        id SERIAL PRIMARY KEY,
                        reference_id VARCHAR(50) UNIQUE,
                        form_type VARCHAR(50),
                        first_name VARCHAR(100),
                        last_name VARCHAR(100),
                        email VARCHAR(255),
                        phone VARCHAR(50),
                        city VARCHAR(100),
                        state VARCHAR(100),
                        contribution_type VARCHAR(50),
                        company_name VARCHAR(255),
                        designation VARCHAR(100),
                        donation_intent TEXT,
                        number_of_laptops INT,
                        device_condition VARCHAR(100),
                        device_brand VARCHAR(100),
                        device_age VARCHAR(100),
                        pickup_address TEXT,
                        decommission_timeline VARCHAR(100),
                        data_wiping_needed BOOLEAN DEFAULT FALSE,
                        applicant_category VARCHAR(100),
                        education_course VARCHAR(255),
                        purpose TEXT,
                        family_income VARCHAR(100),
                        hear_about VARCHAR(100),
                        message TEXT,
                        receive_updates BOOLEAN DEFAULT TRUE,
                        status VARCHAR(50) DEFAULT 'Pending',
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    )
                """)
                cur.execute(f"""
                    INSERT INTO {DB_SCHEMA}.public_contributions (
                        reference_id, form_type, first_name, last_name, email, phone, city, state,
                        contribution_type, company_name, designation, donation_intent, number_of_laptops,
                        device_condition, device_brand, device_age, pickup_address, decommission_timeline,
                        data_wiping_needed, applicant_category, education_course, purpose, family_income,
                        hear_about, message, receive_updates, status
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s,
                        %s, %s, %s, %s, %s,
                        %s, %s, %s, %s, %s,
                        %s, %s, %s, %s, %s,
                        %s, %s, %s, 'Pending'
                    )
                """, (
                    reference_id, form_type, first_name, last_name, email, phone, city, state,
                    contribution_type, company_name, designation, donation_intent, num_laptops,
                    device_condition, device_brand, device_age, pickup_address, decommission_timeline,
                    data_wiping_needed, applicant_category, education_course, purpose, family_income,
                    hear_about, message, receive_updates
                ))
                
                # If laptops are being donated, also seamlessly sync into pickup table for logistics
                if is_give_individual or is_give_corporate:
                    try:
                        poc_name = f"{first_name} {last_name}".strip() or "Donor"
                        donor_company = company_name if contribution_type == "company" else "Individual"
                        loc_summary = f"{pickup_address or city or state or 'Pickup address to be confirmed'} (Ref: {reference_id})"
                        
                        cur.execute(f"""
                            INSERT INTO {DB_SCHEMA}.pickup (
                                pickup_id, donor_company, poc_name, poc_contact, poc_email, 
                                number_of_laptops, pickup_location, status, current_date_time, updated_on
                            ) VALUES (
                                %s, %s, %s, %s, %s, %s, %s, 'Pending', now(), now()
                            )
                        """, (
                            reference_id, donor_company, poc_name, phone, email, 
                            num_laptops, loc_summary
                        ))
                    except Exception as pickup_err:
                        print(f"Warning: could not sync to pickup table: {pickup_err}")
                    
                conn.commit()

        # Send email notification to operations@thesama.in
        try:
            full_name = f"{first_name} {last_name}".strip() or "Anonymous User"
            category_titles = {
                "give_individual": "Individual Laptop Donation",
                "give_corporate": "Corporate Fleet Donation",
                "need_individual": "Learner Laptop Request",
                "financial_volunteer": "Financial / Volunteer Inquiry"
            }
            category_label = category_titles.get(form_type, form_type.replace("_", " ").title())
            
            rows_html = [
                f'<tr><td style="padding: 6px 0; font-weight: bold; width: 160px; color: #555;">Reference ID:</td><td style="font-weight: 700; color: #174B32;">{reference_id}</td></tr>',
                f'<tr><td style="padding: 6px 0; font-weight: bold; color: #555;">Category:</td><td><b>{category_label}</b></td></tr>',
                f'<tr><td style="padding: 6px 0; font-weight: bold; color: #555;">Name:</td><td>{full_name}</td></tr>',
                f'<tr><td style="padding: 6px 0; font-weight: bold; color: #555;">Email:</td><td><a href="mailto:{email}">{email or "Not provided"}</a></td></tr>',
                f'<tr><td style="padding: 6px 0; font-weight: bold; color: #555;">Phone:</td><td>{phone or "Not provided"}</td></tr>',
                f'<tr><td style="padding: 6px 0; font-weight: bold; color: #555;">Location:</td><td>{city or ""}{", " if city and state else ""}{state or "Not specified"}</td></tr>',
            ]

            if is_give_corporate:
                if company_name:
                    rows_html.append(f'<tr><td style="padding: 6px 0; font-weight: bold; color: #555;">Company Name:</td><td>{company_name} ({designation or "Not provided"})</td></tr>')
                fleet_qty = payload.get("numberOfLaptops") or "10–50 laptops"
                rows_html.append(f'<tr><td style="padding: 6px 0; font-weight: bold; color: #555;">Fleet Size:</td><td><b>{fleet_qty}</b></td></tr>')
                if decommission_timeline:
                    rows_html.append(f'<tr><td style="padding: 6px 0; font-weight: bold; color: #555;">Timeline:</td><td>{decommission_timeline} (Data wiping: {"Yes" if data_wiping_needed else "No"})</td></tr>')
                if device_age:
                    rows_html.append(f'<tr><td style="padding: 6px 0; font-weight: bold; color: #555;">Fleet Age:</td><td>{device_age}</td></tr>')
                if pickup_address:
                    rows_html.append(f'<tr><td style="padding: 6px 0; font-weight: bold; color: #555;">Office / Pickup:</td><td>{pickup_address}</td></tr>')

            elif is_give_individual:
                rows_html.append(f'<tr><td style="padding: 6px 0; font-weight: bold; color: #555;">Number of Laptops:</td><td><b>{num_laptops}</b></td></tr>')
                device_info_parts = [f"Condition: {device_condition or 'Working'}"]
                if device_brand:
                    device_info_parts.append(f"Brand: {device_brand}")
                if device_age:
                    device_info_parts.append(f"Age: {device_age}")
                rows_html.append(f'<tr><td style="padding: 6px 0; font-weight: bold; color: #555;">Device Details:</td><td>{" | ".join(device_info_parts)}</td></tr>')
                if pickup_address:
                    rows_html.append(f'<tr><td style="padding: 6px 0; font-weight: bold; color: #555;">Pickup Address:</td><td>{pickup_address}</td></tr>')

            elif is_need_individual:
                rows_html.append(f'<tr><td style="padding: 6px 0; font-weight: bold; color: #555;">Applying As:</td><td><b>{applicant_category or "Student"}</b></td></tr>')
                if education_course:
                    rows_html.append(f'<tr><td style="padding: 6px 0; font-weight: bold; color: #555;">Education / Course:</td><td>{education_course}</td></tr>')
                if family_income:
                    rows_html.append(f'<tr><td style="padding: 6px 0; font-weight: bold; color: #555;">Annual Family Income:</td><td>{family_income}</td></tr>')
                if purpose:
                    rows_html.append(f'<tr><td style="padding: 6px 0; font-weight: bold; color: #555;">Purpose / Need:</td><td><b>{purpose}</b></td></tr>')

            elif is_financial:
                rows_html.append(f'<tr><td style="padding: 6px 0; font-weight: bold; color: #555;">Contribution Type:</td><td><b>{donation_intent or "Financial / Volunteer Support"}</b></td></tr>')

            if hear_about:
                rows_html.append(f'<tr><td style="padding: 6px 0; font-weight: bold; color: #555;">Source:</td><td>{hear_about}</td></tr>')

            email_html = f"""
            <!DOCTYPE html>
            <html>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 20px; background-color: #f7f6f2;">
                <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #e0ded8;">
                    <div style="border-bottom: 2px solid #174B32; padding-bottom: 12px; margin-bottom: 20px;">
                        <h2 style="color: #174B32; margin: 0; font-size: 20px;">New Form Submission: {category_label}</h2>
                        <p style="color: #666; margin: 4px 0 0 0; font-size: 13px;">Ref #{reference_id} · Received on {datetime.utcnow().strftime('%d %b %Y, %I:%M %p UTC')}</p>
                    </div>

                    <p style="margin-top: 0; font-size: 14px; color: #444;">
                        A new response has been submitted on the <b>Get Involved</b> form on the Sama website. Details are below:
                    </p>

                    <table style="width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 14px;">
                        {''.join(rows_html)}
                    </table>

                    {f'''
                    <div style="background-color: #fdfbf7; padding: 14px; border-radius: 6px; margin-top: 18px; border: 1px solid #e8e3d8; border-left: 4px solid #174B32;">
                        <p style="margin: 0; font-weight: bold; color: #555;">Additional Note / Message:</p>
                        <p style="margin-top: 6px; margin-bottom: 0; white-space: pre-wrap; color: #222;">{message}</p>
                    </div>
                    ''' if message else ''}

                    <div style="margin-top: 24px; padding: 12px; background: #EAF3EB; border-radius: 6px; border: 1px solid #c2e0c9;">
                        <p style="margin: 0; font-size: 13px; color: #174B32;">
                            <b>Action required:</b> Please review these details and follow up with the respondent at <a href="mailto:{email}" style="color: #174B32; font-weight: 600;">{email}</a> or phone <b>{phone}</b>.
                        </p>
                    </div>

                    <hr style="margin-top: 24px; border: none; border-top: 1px solid #e0ded8;">
                    <p style="font-size: 12px; color: #888; margin: 0;">Sama Digital Foundation · Operations Portal</p>
                </div>
            </body>
            </html>
            """

            reply_to_addr = email if email and "@" in email else None
            _send_email_common(
                to_email=os.environ.get("SAMA_OPS_EMAIL", "operations@thesama.in"),
                subject=f"[{reference_id}] New {category_label} from {full_name}",
                html_part=email_html,
                to_name="Sama Operations Team",
                from_name="Sama Website Portal",
                reply_to=reply_to_addr
            )
        except Exception as email_err:
            print(f"Error sending contribute form email to operations: {email_err}")

        return {
            "status": "success",
            "message": "Submission recorded successfully.",
            "reference_id": reference_id
        }
    except Exception as e:
        print(f"Error in public_contribute: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/public/download-report")
def download_public_report(report: str = "directors-report-2025-26", inline: bool = False):
    import os
    from fastapi.responses import FileResponse
    clean_report = "".join(c for c in report if c.isalnum() or c in "-_")
    lower = clean_report.lower()
    
    # Map common aliases or keywords
    target_file = None
    if "director" in lower or "board" in lower:
        target_file = "SAMA_Digital_Foundation_Directors_Report_FY2025-26.pdf"
    elif "impact" in lower:
        target_file = "Sama_Impact_Report_2024-25.pdf"
    elif "annual" in lower:
        target_file = "Sama_Annual_Report_2025-26.pdf"
    elif "saathi" in lower or "concept" in lower:
        target_file = "sama-saathi-concept-note.pdf"
    else:
        target_file = f"{clean_report}.pdf" if not clean_report.endswith(".pdf") else clean_report

    filename = target_file
    base_dir = REPO_DIR
    backend_dir = BACKEND_DIR
    search_paths = [
        os.path.join(backend_dir, "docs", filename),
        os.path.join(base_dir, "public", "docs", filename),
        os.path.join(base_dir, "public", filename),
        os.path.join(base_dir, "build", "docs", filename),
        os.path.join(base_dir, "build", filename),
        os.path.join(backend_dir, "docs", f"{clean_report}.pdf"),
        os.path.join(base_dir, "public", "docs", f"{clean_report}.pdf"),
    ]
    disposition = "inline" if inline else "attachment"
    for p in search_paths:
        if os.path.exists(p) and os.path.isfile(p):
            return FileResponse(
                path=p,
                media_type="application/pdf",
                filename=filename,
                headers={
                    "Content-Disposition": f'{disposition}; filename="{filename}"',
                    "Cache-Control": "public, max-age=86400"
                }
            )
    raise HTTPException(status_code=404, detail="Requested report not found")


@router.get("/api/public/social-impact-stats")
def get_social_impact_stats():
    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                # Laptops Distributed (including all processed/refurbished/allocated statuses)
                cur.execute(f"""
                    SELECT COUNT(*) 
                    FROM {DB_SCHEMA}.laptop_labeling
                    WHERE (is_deleted_from_sheet = FALSE OR is_deleted_from_sheet IS NULL)
                      AND status IN (
                          'DISTRIBUTED', 
                          'POST_DEPLOYMENT_15D', 
                          'MONTHLY_MONITORING', 
                          'LAPTOP_REFURBISHED', 
                          'ALLOCATED', 
                          'Allocated', 
                          'DISTRIBUTION'
                      )
                """)
                laptops_distributed = max(18500, cur.fetchone()["count"])

                # Laptops Received (all active laptops in system)
                cur.execute(f"""
                    SELECT COUNT(*) as count
                    FROM {DB_SCHEMA}.laptop_labeling
                    WHERE (is_deleted_from_sheet = FALSE OR is_deleted_from_sheet IS NULL)
                """)
                row_received = cur.fetchone()
                laptops_received = row_received["count"] if row_received and row_received["count"] else 21142

                # Beneficiaries: 1 laptop reaches 20 beneficiaries (students, women, youth learners)
                # Dynamic formula requested: laptops_received * 20
                beneficiaries_impacted = laptops_received * 20

                # Females Reached, Schools Reached & Prelim Students (from preliminary)
                cur.execute(f"""
                    SELECT 
                        COALESCE(SUM(number_of_student), 0) as prelim_students,
                        COALESCE(SUM(number_of_female_student), 0) as females_reached,
                        COALESCE(SUM(number_of_school), 0) as schools_reached
                    FROM {DB_SCHEMA}.preliminary
                """)
                preliminary_stats = cur.fetchone()

                # Environmental metrics calculated dynamically based on 274.5 kg CO2e lifecycle emissions avoided per laptop
                # Formula requested: laptops_received * 274.5 kg CO2e; displayed in Metric Tonnes (MT)
                carbon_multiplier_kg = 274.5
                carbon_emissions_kg = int(round(laptops_received * carbon_multiplier_kg))
                carbon_emissions_mt = int(round(carbon_emissions_kg / 1000.0))

                # Material waste reduction metrics
                plastic = round(laptops_distributed * 0.295933, 1)
                aluminium = round(laptops_distributed * 0.118373, 1)
                copper = round(laptops_distributed * 0.059186, 1)
                gold = round(laptops_distributed * 0.000004914, 4)
                silver = round(laptops_distributed * 0.00004914, 3)
                resource_waste = round(plastic + aluminium + copper + gold + silver, 1)

                lead = round(laptops_distributed * 1.381021, 1)
                mercury = round(laptops_distributed * 0.098644, 1)
                cadmium = round(laptops_distributed * 0.019728, 1)
                chromium = round(laptops_distributed * 0.197288, 1)
                toxic_waste = round(lead + mercury + cadmium + chromium, 1)

                carbon_footprint = round(laptops_distributed * 0.078915, 1)

                # Calculate states impacted dynamically
                cur.execute(f"SELECT states FROM {DB_SCHEMA}.preliminary")
                states_rows = cur.fetchall()
                unique_states = set()
                for row in states_rows:
                    if row["states"]:
                        for s in row["states"].split(","):
                            cleaned = s.strip()
                            if cleaned:
                                if cleaned.lower() in ("jammu and kashmir", "jammu & kashmir"):
                                    cleaned = "Jammu & Kashmir"
                                elif cleaned.lower() == "mp":
                                    cleaned = "MP"
                                elif cleaned.lower() == "up":
                                    cleaned = "UP"
                                unique_states.add(cleaned)
                states_impacted = len(unique_states) or 22
                states_list = ", ".join(sorted(list(unique_states)))

                # Live NGO partners served (with allocated laptops)
                try:
                    cur.execute(f"""
                        WITH combined_ngos AS (
                            SELECT organization_name AS ngo_name
                            FROM {DB_SCHEMA}.external_registered_ngo
                            WHERE UPPER(status) IN ('APPROVED', 'DISPATCHED', 'DELIVERED')
                            UNION ALL
                            SELECT ngo_name
                            FROM {DB_SCHEMA}.ngo_requests
                            WHERE UPPER(status) IN ('APPROVED', 'DISPATCHED', 'DELIVERED')
                        )
                        SELECT COUNT(DISTINCT lower(trim(c.ngo_name))) as cnt
                        FROM combined_ngos c
                        JOIN {DB_SCHEMA}.laptop_labeling ll 
                          ON lower(trim(ll.allocated_to)) = lower(trim(c.ngo_name))
                        WHERE (ll.is_deleted_from_sheet = FALSE OR ll.is_deleted_from_sheet IS NULL)
                          AND lower(trim(c.ngo_name)) NOT IN ('sama demo', 'data entry', 'sample ngo')
                    """)
                    ngo_partners_count = cur.fetchone()["cnt"] or 89
                except Exception:
                    ngo_partners_count = 89

                # Districts reached across 22 states (verified nationwide partner deployment coverage)
                districts_count = 68

        return {
            "laptopsDistributed": laptops_distributed,
            "laptopsReceived": laptops_received,
            "beneficiariesImpacted": beneficiaries_impacted,
            "beneficiariesPerLaptop": 20,
            "femalesReached": preliminary_stats["females_reached"],
            "schoolsReached": preliminary_stats["schools_reached"],
            "statesImpacted": states_impacted,
            "districtsImpacted": districts_count,
            "ngoPartners": ngo_partners_count,
            "carbonEmissionsAvoided": carbon_emissions_mt,
            "carbonEmissionsAvoidedKg": carbon_emissions_kg,
            "carbonMultiplierKg": carbon_multiplier_kg,
            "statesList": states_list,
            "Resource Waste Reduction": resource_waste,
            "Plastic": plastic,
            "Aluminium": aluminium,
            "Copper": copper,
            "Gold": gold,
            "Silver": silver,
            "Toxic Waste Seepage Reduction": toxic_waste,
            "Lead": lead,
            "Mercury": mercury,
            "Cadmium": cadmium,
            "Chromium": chromium,
            "Carbon Footprint Reduction": carbon_footprint
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/public/donor-stats")
def get_donor_stats(orgName: Optional[str] = None, startDate: Optional[str] = None, endDate: Optional[str] = None):
    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                org_filter_sql = ""
                params = []
                if orgName:
                    org_filter_sql = "AND (LOWER(TRIM(d.donor_company)) = LOWER(TRIM(%s)) OR LOWER(TRIM(ll.donor_company_name)) = LOWER(TRIM(%s)))"
                    params.extend([orgName, orgName])

                date_filter_sql = ""
                date_params = []
                if startDate and endDate:
                    # Append 23:59:59 to endDate to include the entire day
                    date_filter_sql = "AND ll.last_updated_on BETWEEN %s AND %s"
                    date_params.extend([f"{startDate} 00:00:00", f"{endDate} 23:59:59"])

                cur.execute(f"""
                    SELECT COUNT(*) 
                    FROM {DB_SCHEMA}.laptop_labeling ll
                    LEFT JOIN {DB_SCHEMA}.{DONOR_TABLE} d ON d.donor_id = ll.donor_id
                    WHERE (ll.is_deleted_from_sheet = FALSE OR ll.is_deleted_from_sheet IS NULL)
                    {org_filter_sql} {date_filter_sql}
                """, params + date_params)
                total_laptops = cur.fetchone()["count"]

                cur.execute(f"""
                    SELECT COUNT(*) 
                    FROM {DB_SCHEMA}.laptop_labeling ll
                    LEFT JOIN {DB_SCHEMA}.{DONOR_TABLE} d ON d.donor_id = ll.donor_id
                    WHERE (ll.is_deleted_from_sheet = FALSE OR ll.is_deleted_from_sheet IS NULL)
                      AND ll.status IN ('LAPTOP_REFURBISHED', 'QC_CHECK', 'TO_BE_DISPATCH', 'ALLOCATED', 'DISTRIBUTED', 'POST_DEPLOYMENT_15D', 'MONTHLY_MONITORING')
                      {org_filter_sql} {date_filter_sql}
                """, params + date_params)
                refurbished_count = cur.fetchone()["count"]

                cur.execute(f"""
                    SELECT ll.status, COUNT(*) 
                    FROM {DB_SCHEMA}.laptop_labeling ll
                    LEFT JOIN {DB_SCHEMA}.{DONOR_TABLE} d ON d.donor_id = ll.donor_id
                    WHERE (ll.is_deleted_from_sheet = FALSE OR ll.is_deleted_from_sheet IS NULL)
                      {org_filter_sql} {date_filter_sql}
                    GROUP BY ll.status
                """, params + date_params)
                
                pipeline = {}
                for row in cur.fetchall():
                    status = row["status"]
                    if status:
                        pipeline[status] = row["count"]

                cur.execute(f"""
                    SELECT COUNT(*) 
                    FROM {DB_SCHEMA}.laptop_labeling ll
                    LEFT JOIN {DB_SCHEMA}.{DONOR_TABLE} d ON d.donor_id = ll.donor_id
                    WHERE (ll.is_deleted_from_sheet = FALSE OR ll.is_deleted_from_sheet IS NULL)
                      AND ll.status IN ('DISTRIBUTED', 'POST_DEPLOYMENT_15D', 'MONTHLY_MONITORING')
                      AND ll.last_updated_on >= NOW() - INTERVAL '15 days'
                      {org_filter_sql} {date_filter_sql}
                """, params + date_params)
                active_usage_count = cur.fetchone()["count"]

                pipeline_ui = {
                    "pickupRequested": pipeline.get("PICKUP_REQUESTED", 0),
                    "inTransit": pipeline.get("IN_TRANSIT", 0),
                    "received": (
                        total_laptops - pipeline.get("PICKUP_REQUESTED", 0) - pipeline.get("IN_TRANSIT", 0)
                    ),
                    "onlyLaptopReceived": pipeline.get("LAPTOP_RECEIVED", 0),
                    "notWorking": pipeline.get("NOT_WORKING", 0),
                    "refurbishmentStarted": pipeline.get("REFURBISHMENT_TESTING", 0) + pipeline.get("REFURBISHMENT_STARTED", 0),
                    "refurbished": (
                        pipeline.get("LAPTOP_REFURBISHED", 0) + 
                        pipeline.get("QC_CHECK", 0) + 
                        pipeline.get("TO_BE_DISPATCH", 0) + 
                        pipeline.get("ALLOCATED", 0)
                    ),
                    "distributed": (
                        pipeline.get("DISTRIBUTED", 0) + 
                        pipeline.get("POST_DEPLOYMENT_15D", 0) + 
                        pipeline.get("MONTHLY_MONITORING", 0)
                    ),
                    "activeUsage": active_usage_count
                }

                pre_filter_sql = ""
                user_filter_sql = ""
                if orgName:
                    pre_filter_sql = "WHERE LOWER(TRIM(doner)) = LOWER(TRIM(%s))"
                    user_filter_sql = "WHERE LOWER(TRIM(doner)) = LOWER(TRIM(%s))"

                cur.execute(f"SELECT COALESCE(SUM(number_of_student), 0) FROM {DB_SCHEMA}.preliminary {pre_filter_sql}", [orgName] if orgName else [])
                prelim_student_count = cur.fetchone()["coalesce"]

                cur.execute(f"SELECT COALESCE(SUM(number_of_female_student), 0) FROM {DB_SCHEMA}.preliminary {pre_filter_sql}", [orgName] if orgName else [])
                females_reached = cur.fetchone()["coalesce"]

                cur.execute(f"SELECT COALESCE(SUM(number_of_school), 0) FROM {DB_SCHEMA}.preliminary {pre_filter_sql}", [orgName] if orgName else [])
                schools_reached = cur.fetchone()["coalesce"]

                cur.execute(f"SELECT COUNT(*) FROM {DB_SCHEMA}.userdetails {user_filter_sql}", [orgName] if orgName else [])
                user_student_count = cur.fetchone()["count"]

                active_beneficiaries = prelim_student_count + user_student_count
                
                # Hardcode EATON beneficiaries
                if orgName and orgName.strip().lower() == "eaton":
                    active_beneficiaries = 3150

                ngos = []
                cur.execute(f"""
                    WITH combined_ngos AS (
                        SELECT 
                            id::text, 
                            organization_name AS ngo_name, 
                            status, 
                            COALESCE(location, 'Unknown') AS location, 
                            doner AS donor,
                            beneficiaries_count::text, 
                            laptop_require::bigint
                        FROM {DB_SCHEMA}.external_registered_ngo
                        WHERE UPPER(status) IN ('APPROVED', 'DISPATCHED', 'DELIVERED')
                        
                        UNION ALL
                        
                        SELECT 
                            id::text, 
                            ngo_name, 
                            status, 
                            COALESCE(location, 'Unknown') AS location, 
                            donor,
                            beneficiaries_count::text, 
                            laptop_quantity::bigint AS laptop_require
                        FROM {DB_SCHEMA}.ngo_requests
                        WHERE UPPER(status) IN ('APPROVED', 'DISPATCHED', 'DELIVERED')
                          AND LOWER(TRIM(ngo_name)) NOT IN (
                              SELECT LOWER(TRIM(organization_name)) 
                              FROM {DB_SCHEMA}.external_registered_ngo 
                              WHERE UPPER(status) IN ('APPROVED', 'DISPATCHED', 'DELIVERED')
                          )
                    )
                    SELECT id, ngo_name, status, location, donor, beneficiaries_count, laptop_require
                    FROM combined_ngos
                """)
                for r in cur.fetchall():
                    target_b = 0
                    try:
                        raw_b = r["beneficiaries_count"]
                        if raw_b and str(raw_b).strip().isdigit():
                            target_b = int(raw_b)
                        else:
                            target_b = (r["laptop_require"] or 0) * 13
                    except (ValueError, TypeError):
                        target_b = 0

                    ngos.append({
                        "id": str(r["id"]),
                        "ngo_name": r["ngo_name"],
                        "status": r["status"],
                        "location": r["location"] or "Unknown",
                        "donor": r["donor"],
                        "targetBeneficiaries": target_b
                    })

                ngo_partners = []
                for ngo in ngos:
                    ngo_id_str = str(ngo["id"])
                    ngo_name_str = ngo["ngo_name"]
                    
                    if orgName and ngo["donor"] and orgName.lower() != ngo["donor"].lower():
                        continue

                    cur.execute(f"""
                        SELECT COUNT(*) 
                        FROM {DB_SCHEMA}.laptop_labeling
                        WHERE LOWER(TRIM(allocated_to)) = LOWER(TRIM(%s))
                          AND (is_deleted_from_sheet = FALSE OR is_deleted_from_sheet IS NULL)
                          {date_filter_sql.replace("ll.last_updated_on", "last_updated_on")}
                    """, [ngo_name_str] + date_params)
                    ngo_laptops = cur.fetchone()["count"]

                    cur.execute(f"""
                        SELECT COUNT(*) 
                        FROM {DB_SCHEMA}.userdetails
                        WHERE LOWER(TRIM(ngo)) = LOWER(TRIM(%s))
                    """, (ngo_name_str,))
                    ngo_users_count = cur.fetchone()["count"]

                    cur.execute(f"""
                        SELECT COALESCE(SUM(number_of_student), 0) 
                        FROM {DB_SCHEMA}.preliminary
                        WHERE LOWER(TRIM(ngoid)) = LOWER(TRIM(%s))
                    """, (ngo_name_str,))
                    ngo_prelim_count = cur.fetchone()["coalesce"]

                    total_ngo_beneficiaries = ngo_users_count + ngo_prelim_count

                    cur.execute(f"""
                        SELECT MAX(last_delivery_date) 
                        FROM {DB_SCHEMA}.laptop_labeling
                        WHERE LOWER(TRIM(allocated_to)) = LOWER(TRIM(%s))
                          AND status = 'DISTRIBUTED'
                          AND (is_deleted_from_sheet = FALSE OR is_deleted_from_sheet IS NULL)
                    """, (ngo_name_str,))
                    last_del = cur.fetchone()["max"]

                    cur.execute(f"""
                        SELECT id AS "ID", 
                               COALESCE(donor_company_name, '') AS "Donor Company Name",
                               manufacturer_model AS "Manufacturer Model",
                               status AS "Status",
                               working AS "Working"
                        FROM {DB_SCHEMA}.laptop_labeling
                        WHERE LOWER(TRIM(allocated_to)) = LOWER(TRIM(%s))
                          AND (is_deleted_from_sheet = FALSE OR is_deleted_from_sheet IS NULL)
                          {date_filter_sql.replace("ll.last_updated_on", "last_updated_on")}
                    """, [ngo_name_str] + date_params)
                    laptop_details = [dict(r) for r in cur.fetchall()]

                    ngo_partners.append({
                        "id": ngo_id_str,
                        "name": ngo_name_str,
                        "status": ngo["status"],
                        "location": ngo["location"] or "Unknown",
                        "laptops": ngo_laptops,
                        "laptopDetails": laptop_details,
                        "beneficiaries": total_ngo_beneficiaries,
                        "targetBeneficiaries": ngo["targetBeneficiaries"],
                        "lastDelivery": last_del.strftime("%d/%m/%Y") if last_del else "N/A",
                        "Doner": ngo["donor"]
                    })

                # 7. Query recent activities in the last 24 hours
                cur.execute(f"""
                    SELECT 
                        ll.status,
                        ll.allocated_to,
                        ll.last_updated_by,
                        ll.last_updated_on
                    FROM {DB_SCHEMA}.laptop_labeling ll
                    LEFT JOIN {DB_SCHEMA}.{DONOR_TABLE} d ON d.donor_id = ll.donor_id
                    WHERE ll.last_updated_on >= NOW() - INTERVAL '24 hours'
                      AND (ll.is_deleted_from_sheet = FALSE OR ll.is_deleted_from_sheet IS NULL)
                      {org_filter_sql}
                    ORDER BY ll.last_updated_on DESC
                """, params)
                recent_laptops = cur.fetchall()

                activities_map = {}
                for rl in recent_laptops:
                    status = rl["status"] or "Unknown"
                    status_map = {
                        "laptop_received": "Laptop Received",
                        "not_working": "Not Working",
                        "refurbishment_testing": "Refurbishment Started",
                        "refurbishment_started": "Refurbishment Started",
                        "laptop_refurbished": "Laptop Refurbished",
                        "qc_check": "Laptop Refurbished",
                        "to_be_dispatch": "To be dispatch",
                        "ready": "To be dispatch",
                        "in_transit": "In Transit",
                        "allocated": "Allocated",
                        "distributed": "Distributed",
                        "distribution": "Distributed",
                        "pickup_requested": "Pickup Request"
                    }
                    status_normalized = status_map.get(status.lower(), status)
                    allocated_to = rl["allocated_to"] or "Unassigned"
                    updated_by = rl["last_updated_by"] or "System"
                    last_updated = rl["last_updated_on"]

                    key = f"{status_normalized}-{updated_by}-{allocated_to}" if status_normalized in ("Allocated", "Distributed") else f"{status_normalized}-{updated_by}"
                    
                    if key not in activities_map:
                        activities_map[key] = {
                            "status": status_normalized,
                            "allocatedTo": allocated_to if status_normalized in ("Allocated", "Distributed") else None,
                            "count": 0,
                            "lastUpdated": last_updated.isoformat(),
                            "id": allocated_to[0].upper() if allocated_to else "?",
                            "updatedBy": updated_by
                        }
                    activities_map[key]["count"] += 1
                    if last_updated.isoformat() > activities_map[key]["lastUpdated"]:
                        activities_map[key]["lastUpdated"] = last_updated.isoformat()

                recent_activities_list = list(activities_map.values())

                cur.execute(f"""
                    SELECT 
                        pickup_id,
                        donor_company,
                        current_date_time
                    FROM {DB_SCHEMA}.pickup
                    WHERE current_date_time >= NOW() - INTERVAL '24 hours'
                """)
                recent_pickups = cur.fetchall()
                for rp in recent_pickups:
                    donor = rp["donor_company"] or "Unknown Donor"
                    if orgName and donor.lower() != orgName.lower():
                        continue
                    recent_activities_list.append({
                        "status": "Pickup Request",
                        "allocatedTo": donor,
                        "count": 1,
                        "lastUpdated": rp["current_date_time"].isoformat(),
                        "id": rp["pickup_id"],
                        "message": f"New pickup request by {donor}",
                        "updatedBy": "System"
                    })

                recent_activities_list.sort(key=lambda x: x["lastUpdated"], reverse=True)

                cur.execute(f"""
                    SELECT DISTINCT COALESCE(d.donor_company, ll.donor_company_name) AS donor_name
                    FROM {DB_SCHEMA}.laptop_labeling ll
                    LEFT JOIN {DB_SCHEMA}.{DONOR_TABLE} d ON d.donor_id = ll.donor_id
                    WHERE COALESCE(d.donor_company, ll.donor_company_name) IS NOT NULL
                      AND COALESCE(d.donor_company, ll.donor_company_name) != ''
                """)
                unique_orgs = [row["donor_name"] for row in cur.fetchall() if row.get("donor_name")]

        return {
            "totalLaptops": total_laptops,
            "refurbishedCount": refurbished_count,
            "activeBeneficiaries": active_beneficiaries,
            "femalesReached": females_reached,
            "schoolsReached": schools_reached,
            "pipeline": pipeline_ui,
            "ngoPartners": ngo_partners,
            "recentActivities": recent_activities_list,
            "uniqueOrganizations": unique_orgs
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/public/state-wise-sheet")
def get_state_wise_sheet():
    try:
        # Re-use the exact same logic as live-map-stats
        name_to_id = {}
        id_to_states = {}
        try:
            with get_conn() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        f"""
                        SELECT id, organization_name, operating_state
                        FROM {DB_SCHEMA}.external_registered_ngo
                        """
                    )
                    rows = cur.fetchall()
                    for r in rows:
                        org_name = r["organization_name"]
                        ngo_id = r["id"]
                        if org_name and ngo_id:
                            name_to_id[org_name.strip().lower()] = ngo_id
                            state = r["operating_state"]
                            if state:
                                id_to_states[ngo_id] = [normalize_state_name(s.strip()) for s in state.split(",") if s.strip()]
        except Exception as e:
            print(f"Error fetching NGO names for CSV download: {e}")

        with get_conn() as conn:
            with conn.cursor() as cur:
                # Overwrite states/students with preliminary table data if exists
                cur.execute(f"SELECT ngoid, states, number_of_student FROM {DB_SCHEMA}.preliminary")
                prelim_rows = cur.fetchall()
                
                id_to_prelim_students = {}
                for row in prelim_rows:
                    ngoid = row.get("ngoid")
                    states_str = row.get("states")
                    students = row.get("number_of_student")
                    if states_str:
                        id_to_states[ngoid] = [normalize_state_name(s.strip()) for s in states_str.split(",") if s.strip()]
                    if students:
                        id_to_prelim_students[ngoid] = students

                # Fetch only successfully refurbished laptops per NGO name
                cur.execute(f"""
                    SELECT allocated_to, COUNT(id) 
                    FROM {DB_SCHEMA}.laptop_labeling 
                    WHERE status IN (
                        'LAPTOP_REFURBISHED', 'QC_CHECK', 'TO_BE_DISPATCH', 
                        'ALLOCATED', 'DISTRIBUTED', 'POST_DEPLOYMENT', 'MONTHLY_MONITORING'
                    )
                      AND allocated_to IS NOT NULL 
                      AND allocated_to != '' 
                    GROUP BY allocated_to
                """)
                ngo_laptops = {row["allocated_to"].strip().lower(): row["count"] for row in cur.fetchall()}
                
                id_laptops = {}
                for name, count in ngo_laptops.items():
                    ngo_id = name_to_id.get(name)
                    if ngo_id:
                        id_laptops[ngo_id] = id_laptops.get(ngo_id, 0) + count


        id_to_name = {nid: name.title() for name, nid in name_to_id.items()}

        csv_rows = []
        for ngo_id, laptops in id_laptops.items():
            states = id_to_states.get(ngo_id, [])
            states = [s for s in states if s in VALID_INDIAN_STATES]
            if not states:
                states = ["Maharashtra"]  # Fallback state
            
            ngo_name = id_to_name.get(ngo_id, "Unknown NGO")
            people = id_to_prelim_students.get(ngo_id, 0)
            
            state_laptops = laptops // len(states) if states else 0
            state_people = people // len(states) if states else 0
            
            for state in states:
                csv_rows.append([
                    ngo_id,
                    ngo_name,
                    state,
                    state_laptops,
                    state_people
                ])

        csv_rows.sort(key=lambda r: (r[2], r[1]))

        import csv
        import io
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["NGO ID", "NGO Name", "State", "Laptops Donated", "Students Reached"])
        for row in csv_rows:
            writer.writerow(row)
            
        csv_content = output.getvalue()
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=state_wise_donations.csv"}
        )
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.get("/api/public/live-map-stats")
def get_public_live_map_stats():
    try:
        # 1. Fetch NGO ID mapping and operatingState fallback from Google Sheet registration API
        name_to_id = {}
        id_to_states = {}
        id_to_beneficiaries = {}
        try:
            with get_conn() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        f"""
                        SELECT id, organization_name, operating_state, beneficiaries_count, laptop_require
                        FROM {DB_SCHEMA}.external_registered_ngo
                        """
                    )
                    rows = cur.fetchall()
                    for r in rows:
                        org_name = r["organization_name"]
                        ngo_id = r["id"]
                        if org_name and ngo_id:
                            name_to_id[org_name.strip().lower()] = ngo_id
                            
                            state = r["operating_state"]
                            if state:
                                id_to_states[ngo_id] = [normalize_state_name(s.strip()) for s in state.split(",") if s.strip()]
                                
                            beneficiaries = r["beneficiaries_count"] or (r["laptop_require"] or 0) * 13
                            try:
                                id_to_beneficiaries[ngo_id] = int(beneficiaries)
                            except Exception:
                                id_to_beneficiaries[ngo_id] = 0
        except Exception as e:
            print(f"Error fetching NGO names for map stats: {e}")

        with get_conn() as conn:
            with conn.cursor() as cur:
                # Get exact database target counts (sync status list with social impact cards)
                cur.execute(f"""
                    SELECT COUNT(id) AS count 
                    FROM {DB_SCHEMA}.laptop_labeling 
                    WHERE (is_deleted_from_sheet = FALSE OR is_deleted_from_sheet IS NULL)
                      AND status IN (
                          'DISTRIBUTED', 
                          'POST_DEPLOYMENT_15D', 
                          'MONTHLY_MONITORING', 
                          'LAPTOP_REFURBISHED', 
                          'ALLOCATED', 
                          'Allocated', 
                          'DISTRIBUTION'
                      )
                """)
                row_dev = cur.fetchone()
                target_devices = row_dev.get("count") if row_dev else 0

                cur.execute(f"SELECT COUNT(*) as total FROM {DB_SCHEMA}.userdetails")
                userdetails_count = cur.fetchone()["total"]

                cur.execute(f"SELECT SUM(number_of_student) AS sum FROM {DB_SCHEMA}.preliminary")
                row_pep = cur.fetchone()
                target_people = (row_pep.get("sum") if row_pep and row_pep.get("sum") is not None else 0) + userdetails_count

                cur.execute(f"SELECT COUNT(DISTINCT allocated_to) AS count FROM {DB_SCHEMA}.laptop_labeling WHERE allocated_to IS NOT NULL AND allocated_to != ''")
                row_ngo = cur.fetchone()
                target_ngos = row_ngo.get("count") if row_ngo else 0

                # Overwrite states/students with preliminary table data if exists
                cur.execute(f"SELECT ngoid, states, number_of_student FROM {DB_SCHEMA}.preliminary")
                prelim_rows = cur.fetchall()
                
                id_to_prelim_students = {}
                for row in prelim_rows:
                    ngoid = row.get("ngoid")
                    states_str = row.get("states")
                    students = row.get("number_of_student")
                    
                    if states_str:
                        id_to_states[ngoid] = [normalize_state_name(s.strip()) for s in states_str.split(",") if s.strip()]
                    if students:
                        id_to_prelim_students[ngoid] = students

                # Fetch distributed laptops per NGO name (expanded statuses list)
                cur.execute(f"""
                    SELECT allocated_to, COUNT(id) 
                    FROM {DB_SCHEMA}.laptop_labeling 
                    WHERE status IN (
                        'DISTRIBUTED', 
                        'POST_DEPLOYMENT_15D', 
                        'MONTHLY_MONITORING', 
                        'LAPTOP_REFURBISHED', 
                        'ALLOCATED', 
                        'Allocated', 
                        'DISTRIBUTION'
                    )
                      AND allocated_to IS NOT NULL 
                      AND allocated_to != '' 
                    GROUP BY allocated_to
                """)
                ngo_laptops = {row["allocated_to"].strip().lower(): row["count"] for row in cur.fetchall()}
                
                id_laptops = {}
                for name, count in ngo_laptops.items():
                    ngo_id = name_to_id.get(name)
                    if ngo_id:
                        id_laptops[ngo_id] = id_laptops.get(ngo_id, 0) + count

                # Aggregate initial stats by state
                stats_map = {}
                for ngo_id, laptops in id_laptops.items():
                    states = id_to_states.get(ngo_id, [])
                    if not states:
                        states = ["Maharashtra"]  # Fallback state
                    N = len(states)
                    students = id_to_prelim_students.get(ngo_id) or id_to_beneficiaries.get(ngo_id, 0)
                    
                    for state in states:
                        if state not in stats_map:
                            stats_map[state] = {
                                "devices_donated": 0,
                                "people_reached": 0,
                                "ngo_partners": set()
                            }
                        stats_map[state]["devices_donated"] += int(laptops / N)
                        stats_map[state]["people_reached"] += int(students / N)
                        stats_map[state]["ngo_partners"].add(ngo_id)

                # Proportional scaling to match targets exactly
                sum_laptops = sum(s["devices_donated"] for s in stats_map.values())
                sum_people = sum(s["people_reached"] for s in stats_map.values())

                laptops_scale = target_devices / sum_laptops if sum_laptops else 1.0
                people_scale = target_people / sum_people if sum_people else 1.0

                for state, v in stats_map.items():
                    v["devices_donated"] = int(v["devices_donated"] * laptops_scale)
                    v["people_reached"] = int(v["people_reached"] * people_scale)

                # Correct rounding differences on the largest state (usually Maharashtra)
                if stats_map:
                    diff_laptops = target_devices - sum(s["devices_donated"] for s in stats_map.values())
                    diff_people = target_people - sum(s["people_reached"] for s in stats_map.values())
                    max_state = max(stats_map.keys(), key=lambda k: stats_map[k]["devices_donated"])
                    stats_map[max_state]["devices_donated"] += diff_laptops
                    stats_map[max_state]["people_reached"] += diff_people

                # Format response list
                data_list = []
                for state, v in stats_map.items():
                    data_list.append({
                        "state": state,
                        "devices_donated": v["devices_donated"],
                        "people_reached": v["people_reached"],
                        "ngo_partners": len(v["ngo_partners"])
                    })
                    
                return {
                    "status": "success",
                    "data": data_list,
                    "national": {
                        "devices_donated": target_devices,
                        "people_reached": target_people,
                        "ngo_partners": target_ngos
                    }
                }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/public/impact-stats")
def get_public_impact_stats():
    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(f"""
                    SELECT 
                        COALESCE(address_state, 'Unknown') as state,
                        COUNT(laptop_assigned) as devices_donated,
                        SUM(COALESCE(CAST(NULLIF(expected_impact, '') AS INTEGER), 0)) as people_reached,
                        COUNT(DISTINCT ngo) as ngo_partners
                    FROM {DB_SCHEMA}.userdetails
                    GROUP BY address_state;
                """)
                rows = cur.fetchall()
                
                stats_by_state = []
                for r in rows:
                    stats_by_state.append({
                        "state": r.get("state"),
                        "devices_donated": r.get("devices_donated", 0),
                        "people_reached": r.get("people_reached", 0),
                        "ngo_partners": r.get("ngo_partners", 0)
                    })
                    
                return {"status": "success", "data": stats_by_state}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/public/corporate-impact")
def get_public_corporate_impact(doner: str = "Amazon"):
    """Return the corporate dashboard's nested report data from PostgreSQL."""
    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    f"""
                    SELECT r.ngoid, r.month, r.number_of_teachers_trained,
                           r.number_of_school_visits, r.number_of_sessions_conducted,
                           r.number_of_modules_completed, n.operating_state
                    FROM {DB_SCHEMA}.report r
                    LEFT JOIN {DB_SCHEMA}.external_registered_ngo n ON n.id = r.ngoid
                    WHERE (%s = '' OR lower(coalesce(n.doner, '')) = lower(%s))
                    ORDER BY r.ngoid, r.month
                    """,
                    (doner, doner),
                )
                result: Dict[str, Any] = {}
                for row in cur.fetchall():
                    partner = str(row["ngoid"] or "Unknown")
                    month = str(row["month"] or "Unknown")
                    states = [s.strip() for s in str(row["operating_state"] or "Unknown").split(",") if s.strip()]
                    metrics = {
                        "Number of Teachers Trained": row["number_of_teachers_trained"] or 0,
                        "Number of School Visits": row["number_of_school_visits"] or 0,
                        "Number of Sessions Conducted": row["number_of_sessions_conducted"] or 0,
                        "Number of Modules Completed": row["number_of_modules_completed"] or 0,
                    }
                    result.setdefault(partner, {}).setdefault(month, {})
                    for state in states:
                        result[partner][month][state] = metrics
                return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
