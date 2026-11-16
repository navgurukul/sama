"""Legacy Apps Script-style dispatch endpoints: /exec, /ngo-exec and /user-exec."""

from __future__ import annotations

import asyncio
import json
import os
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Request
from starlette.concurrency import run_in_threadpool

from ..common.payload import _type_from_request
from ..core.db import DB_SCHEMA, get_conn
from ..core.security import (
    Principal,
    authorize,
    client_ip,
    is_own_ngo,
    principal_from_request,
    redaction_applies,
    verify_webhook_secret,
)
from ..domain.identity.service import (
    _handle_user_post_type,
    _query_user_login_data,
    _query_user_registration,
)
from ..domain.inquiries import _save_public_inquiry
from ..domain.laptops.commands import _handle_post_type
from ..domain.laptops.queries import (
    _query_audit,
    _query_donor_companies,
    _query_laptops,
    _query_pickups,
    _query_preliminary,
    _query_users,
)
from ..domain.laptops.stages import (
    _query_failed_gate_queue,
    _query_issue_logs,
    _query_laptop_stage_runs,
    _query_laptop_stage_snapshot,
    _query_stage_gate_logs,
    _query_stage_map,
    _query_stage_run_responses,
    _query_stage_template,
)
from ..domain.ngos.operations import _query_ngo_operation, _save_ngo_operation
from ..domain.ngos.request_ids import find_request_id, load_display_ids
from ..domain.notifications.afe import (
    send_afe_approval_email,
    send_afe_delivery_email,
    send_afe_dispatch_email,
    send_afe_serial_number_sheet_email,
)
from ..integrations.storage import _get_s3_client, _get_s3_settings, _presign_s3_url_if_needed

router = APIRouter()


async def _json_object(request: Request) -> Dict[str, Any]:
    """Read the JSON body; anything that is not a JSON object becomes {}."""
    try:
        payload = await request.json()
    except Exception:
        return {}
    return payload if isinstance(payload, dict) else {}


def _authorize_beneficiary_edit(request: Request, type_name: str, payload: Dict[str, Any]) -> None:
    """Check editUser/userdetails against both the stored and the submitted NGO.

    Checking the stored row stops an NGO from taking over another NGO's
    beneficiary by sending its own NGO id.
    """
    owners = {payload.get("ngo") or payload.get("Ngo")}
    principal = principal_from_request(request)
    row_id = payload.get("id") or payload.get("ID")
    if principal is not None and not principal.is_staff and row_id is not None:
        try:
            with get_conn() as conn:
                row = conn.execute(
                    f"SELECT ngo FROM {DB_SCHEMA}.userdetails WHERE id::text = %s",
                    (str(row_id),),
                ).fetchone()
            if row:
                owners.add(row["ngo"])
        except Exception as exc:
            print(f"Beneficiary owner lookup failed for {row_id}: {exc}")
    owners = {o for o in owners if o}
    if not owners:
        authorize(request, type_name)
    for owner in owners:
        authorize(request, type_name, owner_ngo_id=owner)


MIGRATED_TYPES = {
    "getLaptopData",
    "getUserData",
    "getpre",
    "pickupget",
    "pickup",
    "audit",
    "UpdateLaptopComment",
    "updatepickupstatus",
    "assign",
    "laptopLabeling",
    "bulkupload",
    "userdetails",
    "editUser",
    "deleteUser",
    "startStageRun",
    "submitChecklistResponses",
    "evaluateStageRun",
    "completeStageRun",
    "createIssueLog",
    "resolveIssueLog",
    "email-webhook",
    "publicInquiry",
}


# Personal details in the NGO registration list. Staff and donors see them for
# every NGO, an NGO user sees its own, and everyone else gets them blank.
REGISTRATION_CONTACT_FIELDS = ("primaryContactName", "contactNumber", "email", "registrationNumber")
REGISTRATION_FULL_ACCESS_ROLES = frozenset({"admin", "ops", "doner", "afe_approver"})


def _is_own_registration(principal: Optional[Principal], row: Dict[str, Any]) -> bool:
    if principal is None:
        return False
    return (
        is_own_ngo(principal, row.get("Id"))
        or is_own_ngo(principal, row.get("displayId"))
        or str(row.get("email") or "").strip().lower() == principal.email
    )


def _scope_registration_list(request: Request, data_json: Dict[str, Any]) -> Dict[str, Any]:
    principal = principal_from_request(request)
    if principal is not None and principal.has_any_role(REGISTRATION_FULL_ACCESS_ROLES):
        return data_json
    rows = data_json.get("data") or []
    hidden = [
        i for i, row in enumerate(rows)
        if isinstance(row, dict)
        and not _is_own_registration(principal, row)
        and any(row.get(f) for f in REGISTRATION_CONTACT_FIELDS)
    ]
    if not redaction_applies(request, "read:registration", principal, len(hidden)):
        return data_json
    for i in hidden:
        rows[i] = {**rows[i], **{f: "" for f in REGISTRATION_CONTACT_FIELDS if f in rows[i]}}
    return data_json


def _fill_contact_details_from_registration(payload: Dict[str, Any], organization_id: Any) -> None:
    """Copy an existing NGO's contact details into an additional request.

    The public form no longer sees other NGOs' contact details, so it submits
    them blank; the server fills them from the NGO's own record instead.
    """
    missing = [f for f in REGISTRATION_CONTACT_FIELDS if not str(payload.get(f) or "").strip()]
    if not missing:
        return
    try:
        rows = _load_registration_list(str(organization_id)).get("data") or []
    except Exception as exc:
        print(f"Could not load registration {organization_id} to fill contact details: {exc}")
        return
    match = next(
        (r for r in rows if str(organization_id) in (str(r.get("Id", "")), str(r.get("displayId", "")))),
        None,
    )
    if match:
        for f in missing:
            payload[f] = match.get(f) or ""


def _load_registration_list(org_filter: Optional[str]) -> Dict[str, Any]:
    """NGO registrations and pending requests, as the dashboard and registration form list them."""
    stored_ids = load_display_ids()
    data_json = {"status": "success", "data": []}
    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                query = f"""
                    SELECT id, organization_name, registration_number, primary_contact_name, contact_number,
                           email, operating_state, location, years_operating, focus_area, works_with_women,
                           infrastructure, beneficiary_selection, beneficiaries_count, age_group, primary_use,
                           expected_outcome, laptop_tracking, jobs_created, previous_projects, sufficient_staff,
                           impact_report, status, ngo_type, laptop_require, doner, request_type, ngo_requests,
                           tentative_refurb_completion
                    FROM {DB_SCHEMA}.external_registered_ngo
                    ORDER BY id ASC
                """
                try:
                    cur.execute(query)
                except Exception:
                    conn.rollback()
                    fallback_query = f"""
                        SELECT id, organization_name, registration_number, primary_contact_name, contact_number,
                               email, operating_state, location, years_operating, focus_area, works_with_women,
                               infrastructure, beneficiary_selection, beneficiaries_count, age_group, primary_use,
                               expected_outcome, laptop_tracking, jobs_created, previous_projects, sufficient_staff,
                               impact_report, status, ngo_type, laptop_require, doner, request_type, ngo_requests
                        FROM {DB_SCHEMA}.external_registered_ngo
                        ORDER BY id ASC
                    """
                    cur.execute(fallback_query)
                rows = cur.fetchall()
                data_list = []
                for r in rows:
                    data_list.append({
                        "Id": r["id"],
                        "organizationName": r["organization_name"] or "",
                        "registrationNumber": r["registration_number"] or "",
                        "primaryContactName": r["primary_contact_name"] or "",
                        "contactNumber": r["contact_number"] or "",
                        "email": r["email"] or "",
                        "operatingState": r["operating_state"] or "",
                        "location": r["location"],
                        "yearsOperating": r["years_operating"],
                        "focusArea": r["focus_area"],
                        "worksWithWomen": r["works_with_women"],
                        "infrastructure": r["infrastructure"],
                        "beneficiarySelection": r["beneficiary_selection"],
                        "beneficiariesCount": r["beneficiaries_count"],
                        "ageGroup": r["age_group"],
                        "primaryUse": r["primary_use"],
                        "expectedOutcome": r["expected_outcome"] or r["primary_use"] or "",
                        "laptopTracking": r["laptop_tracking"],
                        "jobsCreated": r["jobs_created"],
                        "previousProjects": r["previous_projects"],
                        "sufficientStaff": r["sufficient_staff"],
                        "impactReport": r["impact_report"],
                        "Status": r["status"],
                        "Ngo Type": r["ngo_type"],
                        "Laptop require": r["laptop_require"],
                        "Doner": r["doner"],
                        "requestType": r["request_type"],
                        "tentative_refurb_completion": str(r["tentative_refurb_completion"]) if r.get("tentative_refurb_completion") else None,
                        "NGORequests": json.loads(r["ngo_requests"]) if r["ngo_requests"] else ""
                    })
                data_json["data"] = data_list
    except Exception as db_e:
        print(f"Error loading registrations from DB: {db_e}")
        raise HTTPException(status_code=500, detail="Database query error")

    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    f"""
                    SELECT id, ngo_name, laptop_quantity, location, use_case, contact_name, email, status, tentative_refurb_completion, donor,
                           partner_type, date_received, attached_email_link, approver_name, approved_quantity,
                           dispatch_location, expected_delivery_days, dispatch_date, delivery_date, last_impact_report_date,
                           operating_state, years_operating, focus_area, infrastructure, beneficiaries_count, age_group, expected_outcome, laptop_tracking
                    FROM {DB_SCHEMA}.ngo_requests
                    ORDER BY id ASC
                    """
                )
                draft_rows = cur.fetchall()
                # Fallback numbering when stored IDs are unavailable: highest registered
                # SAM number, then one per request in id order.
                max_serial = 0
                for x in data_json.get("data", []):
                    id_str = str(x.get("Id", ""))
                    if id_str.startswith("SAM-"):
                        try:
                            max_serial = max(max_serial, int(id_str.split("-")[-1]))
                        except ValueError:
                            pass
                current_serial = max_serial

                draft_list = []
                for r in draft_rows:
                    status_val = r["status"]
                    ngo_name = r["ngo_name"]
                    qty_requested = r["laptop_quantity"]
                    location_val = r["location"]
                    use_case_val = r["use_case"]
                    contact_name_val = r["contact_name"]
                    email_val = r["email"]
                    db_id = r["id"]

                    current_serial += 1
                    display_id = (stored_ids or {}).get(db_id) or f"SAM-{current_serial}"

                    draft_list.append({
                        "Id": display_id,
                        "displayId": display_id,
                        "db_id": db_id,
                        "organizationName": ngo_name,
                        "Laptop require": qty_requested,
                        "location": location_val,
                        "primaryUse": use_case_val,
                        "expectedOutcome": r["expected_outcome"] or use_case_val or "",
                        "primaryContactName": contact_name_val,
                        "email": email_val,
                        "Status": status_val.capitalize() if status_val == "draft" else status_val,
                        "registrationNumber": r.get("registration_number") or "",
                        "contactNumber": r.get("contact_number") or "",
                        "operatingState": r["operating_state"] or "",
                        "yearsOperating": r["years_operating"] or "",
                        "focusArea": r["focus_area"] or "",
                        "worksWithWomen": r.get("works_with_women") or "",
                        "infrastructure": r["infrastructure"] or "",
                        "beneficiarySelection": r.get("beneficiary_selection") or "",
                        "beneficiariesCount": r["beneficiaries_count"] or "",
                        "ageGroup": r["age_group"] or "",
                        "Doner": r["donor"] or "",
                        "Ngo Type": "",
                        "tentative_refurb_completion": str(r["tentative_refurb_completion"]) if r["tentative_refurb_completion"] else None,
                        "partner_type": r["partner_type"] or "External Partner",
                        "date_received": str(r["date_received"]) if r["date_received"] else None,
                        "attached_email_link": r["attached_email_link"] or "",
                        "approver_name": r["approver_name"] or "",
                        "approved_quantity": r["approved_quantity"] or 0,
                        "dispatch_location": r["dispatch_location"] or "",
                        "expected_delivery_days": r["expected_delivery_days"] or 0,
                        "dispatch_date": str(r["dispatch_date"]) if r["dispatch_date"] else None,
                        "delivery_date": str(r["delivery_date"]) if r["delivery_date"] else None,
                        "last_impact_report_date": str(r["last_impact_report_date"]) if r["last_impact_report_date"] else None,
                    })

                draft_list.reverse()
                all_data = draft_list + data_json.get("data", [])

                if org_filter:
                    data_json["data"] = [x for x in all_data if str(x.get("Id", "")) == org_filter or str(x.get("displayId", "")) == org_filter]
                else:
                    data_json["data"] = all_data
    except Exception as e:
        print(f"Error merging ngo_requests drafts: {e}")
    return data_json


@router.get("/ngo-exec")
def ngo_exec_get(request: Request) -> Any:
    params = dict(request.query_params)
    org_filter = params.get("orgName")
    type_name = params.get("type")
    authorize(
        request,
        f"read:{type_name}",
        owner_ngo_id=params.get("userId") if type_name == "MultipleDocsGet" else None,
    )

    if type_name in {
        "manageStatus", "Monthly", "Yearly", "GetMonthlyReport", "GetYearlyReport",
        "GetMou", "getMonthlyStatusUpdate"
    }:
        return _query_ngo_operation(type_name, params)

    if type_name in ("donorQuestion", "question", "monthlyquestion", "yearlyQuestion", "donorID"):
        try:
            with get_conn() as conn:
                with conn.cursor() as cur:
                    if type_name == "donorID":
                        cur.execute(f"SELECT donor_id, questions_list_id, donner FROM {DB_SCHEMA}.ngo_data_doner")
                        rows = cur.fetchall()
                        data = []
                        for r in rows:
                            data.append({
                                "Donor id": r["donor_id"],
                                "Questions List ID": r["questions_list_id"],
                                "Donner": r["donner"]
                            })
                        return {"status": "success", "data": data}
                    elif type_name in ("donorQuestion", "question"):
                        cur.execute(f"SELECT questions_id, questions, options, type, name FROM {DB_SCHEMA}.ngo_data_questions ORDER BY cast(questions_id as float)")
                        rows = cur.fetchall()
                        data = []
                        for r in rows:
                            opts = None
                            if r["options"]:
                                opts = [opt.strip() for opt in str(r["options"]).split(";") if opt.strip()]
                            data.append({
                                "id": r["questions_id"],
                                "question": r["questions"],
                                "options": opts,
                                "type": r["type"],
                                "name": r["name"]
                            })
                        return {"status": "success", "data": data}
                    elif type_name == "monthlyquestion":
                        cur.execute(f"SELECT ngoid, question, type FROM {DB_SCHEMA}.ngo_data_monthlyquestion")
                        rows = cur.fetchall()
                        return {"status": "success", "data": rows}
                    elif type_name == "yearlyQuestion":
                        cur.execute(f"SELECT ngoid, question, type FROM {DB_SCHEMA}.ngo_data_yearlyquestion")
                        rows = cur.fetchall()
                        return {"status": "success", "data": rows}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    if params.get("type") == "laptopinfo":
        ngo_id = (params.get("id") or "").strip()
        if not ngo_id:
            raise HTTPException(status_code=400, detail="id is required")

        try:
            with get_conn() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        f"""
                        SELECT organization_name
                        FROM {DB_SCHEMA}.external_registered_ngo
                        WHERE lower(id) = lower(%s)
                        LIMIT 1
                        """,
                        (ngo_id,),
                    )
                    ngo = cur.fetchone()
                    ngo_name = ngo["organization_name"] if ngo else ""

                    cur.execute(
                        f"""
                        SELECT
                            l.id,
                            l.date_committed,
                            l.donor_company_name,
                            l.ram,
                            l.rom,
                            l.manufacturer_model,
                            l.processor,
                            l.condition_status,
                            l.inventory_location,
                            l.status,
                            l.battery_capacity,
                            l.allocated_to,
                            l.assigned_to,
                            l.last_updated_on,
                            l.major_issues,
                            l.minor_issues,
                            l.comment_for_issues,
                            l.batch
                        FROM {DB_SCHEMA}.laptop_labeling l
                                                WHERE trim(coalesce(l.allocated_to, '')) <> ''
                                                    AND lower(l.allocated_to) IN (lower(%s), lower(%s))
                        ORDER BY l.id
                        """,
                                (ngo_id, ngo_name),
                    )
                    rows = cur.fetchall()

            def split_issues(value: Optional[str]) -> List[str]:
                if not value:
                    return []
                return [item.strip() for item in str(value).split(",") if item.strip()]

            laptops = []
            for row in rows:
                laptops.append({
                    "ID": row["id"],
                    "Date": row["date_committed"].isoformat() if row["date_committed"] else "",
                    "Donor Company Name": row["donor_company_name"] or "",
                    "RAM": row["ram"] or "",
                    "ROM": row["rom"] or "",
                    "Manufacturer Model": row["manufacturer_model"] or "",
                    "Processor": row["processor"] or "",
                    "Condition Status": row["condition_status"] or "",
                    "Inventory Location": row["inventory_location"] or "",
                    "Status": row["status"] or "",
                    "Battery Capacity": row["battery_capacity"],
                    "Date of laptop Assignment": row["last_updated_on"].isoformat() if row["last_updated_on"] else "",
                    "MajorIssue": split_issues(row["major_issues"]),
                    "MinorIssue": split_issues(row["minor_issues"]),
                    "Comment for the Issues": row["comment_for_issues"] or "",
                    "Batch": row["batch"] or "",
                })

            return {"status": "success", "laptops": laptops}
        except Exception as db_e:
            print(f"Error loading NGO laptops from DB: {db_e}")
            raise HTTPException(status_code=500, detail="Database query error")

    if params.get("type") == "MultipleDocsGet":
        user_id = (params.get("userId") or "").strip()
        if not user_id:
            raise HTTPException(status_code=400, detail="userId is required")

        try:
            with get_conn() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        f"""
                        SELECT user_id, ngo_name, n_12a_registration, status, discription,
                               n_80g_certification, status_2, discription_2,
                               certificate_of_incorporation_coi, status_3, discription_3,
                               fcra_approval, status_4, discription_4,
                               financial_report_fy_2021_22, status_5, col_17,
                               financial_report_fy_2022_23, status_6, discription_5,
                               financial_report_fy_2023_24, status_7, discription_6,
                               subfolderid
                        FROM {DB_SCHEMA}.ngo_data_ngo_uploaded_docs
                        WHERE lower(user_id) = lower(%s)
                        LIMIT 1
                        """,
                        (user_id,),
                    )
                    row = cur.fetchone()

            if not row:
                stored_documents = _query_ngo_operation("MultipleDocsGet", {"userId": user_id})
                if stored_documents:
                    return {"isDataAvailable": True, "User-Id": user_id, **stored_documents}
                return {"isDataAvailable": False, "User-Id": user_id}

            def document(link: Optional[str], status: Optional[str], description: Optional[str]) -> Dict[str, Any]:
                return {
                    "link": _presign_s3_url_if_needed(link) or "",
                    "status": status or "",
                    "description": description or "",
                }

            return {
                "isDataAvailable": True,
                "User-Id": row["user_id"],
                "NGO Name": row["ngo_name"] or "",
                "subfolderId": row["subfolderid"] or "",
                "12A Registration": document(row["n_12a_registration"], row["status"], row["discription"]),
                "80G Certification": document(row["n_80g_certification"], row["status_2"], row["discription_2"]),
                "Certificate of Incorporation (COI)": document(row["certificate_of_incorporation_coi"], row["status_3"], row["discription_3"]),
                "FCRA Approval": document(row["fcra_approval"], row["status_4"], row["discription_4"]),
                "Financial Report FY 2021-22": document(row["financial_report_fy_2021_22"], row["status_5"], row["col_17"]),
                "Financial Report FY 2022-23": document(row["financial_report_fy_2022_23"], row["status_6"], row["discription_5"]),
                "Financial Report FY 2023-24": document(row["financial_report_fy_2023_24"], row["status_7"], row["discription_6"]),
            }
        except Exception as db_e:
            print(f"Error loading NGO documents from DB: {db_e}")
            raise HTTPException(status_code=500, detail="Database query error")
    
    if params.get("type") == "registration":
        return _scope_registration_list(request, _load_registration_list(org_filter))
    raise HTTPException(
        status_code=501,
        detail=f"NGO operation '{params.get('type') or 'unknown'}' is not implemented in the database backend",
    )


 
@router.post("/ngo-exec")
async def ngo_exec_post(request: Request) -> Any:
    payload = await _json_object(request)
    return await run_in_threadpool(_ngo_exec_post, request, payload)


def _ngo_exec_post(request: Request, payload: Dict[str, Any]) -> Any:
    type_name = _type_from_request(request, payload)
    authorize(request, type_name, owner_ngo_id=payload.get("ngoId") or payload.get("userId"))
    if type_name == "NGO" and payload.get("id"):
        # Without an id this is a public registration; with one it changes an existing request.
        authorize(request, "NGO:update")

    # Intercept new NGO requirements submissions from the web form
    ngo_id = payload.get("id")
    if type_name == "NGO" and not ngo_id:
        org_name = (payload.get("organizationName") or "").strip()
        request_type = payload.get("requestType")
        organization_id = payload.get("organizationId")
        if request_type == "subsequent" and organization_id:
            org_name = f"{org_name}||{organization_id}"
            _fill_contact_details_from_registration(payload, organization_id)
            
        qty = payload.get("orgLaptopRequire")
        try:
            qty_int = int(qty) if qty is not None else 1
        except Exception:
            qty_int = 1
            
        loc_list = payload.get("location")
        if isinstance(loc_list, list):
            rural_urban = ", ".join(loc_list)
        else:
            rural_urban = str(loc_list or "").strip()
            
        op_state = (payload.get("operatingState") or "").strip()
        
        if op_state and rural_urban:
            location = f"{op_state} ({rural_urban})"
        elif op_state:
            location = op_state
        elif rural_urban:
            location = rural_urban
        else:
            location = ""
            
        use_case = payload.get("primaryUse")
        if isinstance(use_case, list):
            use_case = ", ".join(use_case)
        else:
            use_case = str(use_case or "").strip()
            
        contact_name_val = str(payload.get("primaryContactName") or "").strip()
        contact_num_val = str(payload.get("contactNumber") or "").strip()
        contact_name = f"{contact_name_val} | {contact_num_val}" if contact_num_val else contact_name_val
        
        email = str(payload.get("email") or "").strip()
        partner_type = "AFE Partner"
        
        years_operating = str(payload.get("yearsOperating") or "").strip()
        focus_area = str(payload.get("focusArea") or "").strip()
        infrastructure = str(payload.get("infrastructure") or "").strip()
        beneficiaries_count = str(payload.get("beneficiariesCount") or payload.get("numberOfBeneficiaries") or "").strip()
        age_group = str(payload.get("ageGroup") or "").strip()
        expected_outcome = str(payload.get("expectedOutcome") or "").strip()
        laptop_tracking = str(payload.get("laptopTracking") or "").strip()
        
        import base64, uuid, io
        from datetime import datetime
        
        attached_email_link = ""
        base64_file = str(payload.get("file") or "").strip()
        file_name = str(payload.get("fileName") or "impact_report.pdf").strip()
        mime_type = str(payload.get("mimeType") or "application/pdf").strip()
        
        if base64_file:
            try:
                raw_data = base64.b64decode(base64_file)
                settings = _get_s3_settings()
                client = _get_s3_client()
                
                _, ext = os.path.splitext(file_name)
                key = f"{settings['prefix']}ngo_impact_reports/{datetime.utcnow().strftime('%Y%m%d')}/{uuid.uuid4().hex}{ext.lower()}"
                
                extra_args = {}
                if mime_type:
                    extra_args["ContentType"] = mime_type
                    
                client.upload_fileobj(io.BytesIO(raw_data), settings["bucket"], key, ExtraArgs=extra_args or None)
                
                region = os.getenv("AWS_REGION") or os.getenv("AWS_DEFAULT_REGION", "ap-south-1")
                bucket = settings["bucket"]
                attached_email_link = f"https://{bucket}.s3.{region}.amazonaws.com/{key}"
            except Exception as e:
                print(f"Error uploading NGO impact report to S3: {e}")
        
        registration_number = str(payload.get("registrationNumber") or "").strip()
        works_with_women = str(payload.get("worksWithWomen") or "").strip()
        b_sel = payload.get("beneficiarySelection")
        if isinstance(b_sel, list):
            beneficiary_selection = ", ".join(b_sel)
        else:
            beneficiary_selection = str(b_sel or "").strip()
        
        with get_conn() as conn:
            with conn.cursor() as cur:
                try:
                    cur.execute(
                        f"""
                        INSERT INTO {DB_SCHEMA}.ngo_requests
                        (ngo_name, laptop_quantity, location, use_case, contact_name, email, status, partner_type, date_received,
                         operating_state, years_operating, focus_area, infrastructure, beneficiaries_count, age_group, expected_outcome, laptop_tracking, attached_email_link,
                         registration_number, contact_number, works_with_women, beneficiary_selection)
                        VALUES (%s, %s, %s, %s, %s, %s, 'draft', %s, CURRENT_DATE, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        RETURNING id
                        """,
                        (org_name, qty_int, location, use_case, contact_name, email, partner_type, op_state, years_operating, focus_area, infrastructure, beneficiaries_count, age_group, expected_outcome, laptop_tracking, attached_email_link,
                         registration_number, contact_num_val, works_with_women, beneficiary_selection)
                    )
                except Exception:
                    conn.rollback()
                    cur.execute(
                        f"""
                        INSERT INTO {DB_SCHEMA}.ngo_requests
                        (ngo_name, laptop_quantity, location, use_case, contact_name, email, status, partner_type, date_received,
                         operating_state, years_operating, focus_area, infrastructure, beneficiaries_count, age_group, expected_outcome, laptop_tracking, attached_email_link)
                        VALUES (%s, %s, %s, %s, %s, %s, 'draft', %s, CURRENT_DATE, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        RETURNING id
                        """,
                        (org_name, qty_int, location, use_case, contact_name, email, partner_type, op_state, years_operating, focus_area, infrastructure, beneficiaries_count, age_group, expected_outcome, laptop_tracking, attached_email_link)
                    )
                new_id = cur.fetchone()["id"]
                conn.commit()
                
        # No confirmation email is sent here; the NGO is notified on approval.
                
        return {
            "status": "success",
            "type": type_name,
            "id": f"DRAFT-{new_id}",
            "organizationName": org_name,
            "message": "Web requirements submitted successfully"
        }


    def resolve_draft_id(nid):
        if not isinstance(nid, str):
            return None
        clean = nid.strip()
        # Direct numeric id or DRAFT-id or SAM-D id
        if clean.startswith("DRAFT-"):
            try:
                return int(clean.replace("DRAFT-", ""))
            except ValueError:
                return None
        if clean.startswith("SAM-D"):
            try:
                return int(clean.replace("SAM-D", ""))
            except ValueError:
                return None
        if clean.startswith("SAM-"):
            try:
                target_serial = int(clean.replace("SAM-", ""))
            except ValueError:
                return None
            try:
                return find_request_id(clean)
            except LookupError:
                pass
            # Stored IDs unavailable: fall back to the position-based rule.

            with get_conn() as conn:
                with conn.cursor() as cur:
                    cur.execute(f"SELECT id FROM {DB_SCHEMA}.external_registered_ngo")
                    max_serial = 0
                    for r in cur.fetchall():
                        s = str(r["id"])
                        if s.startswith("SAM-"):
                            try:
                                max_serial = max(max_serial, int(s.split("-")[-1]))
                            except ValueError:
                                pass

                    if target_serial > max_serial:
                        cur.execute(f"SELECT id FROM {DB_SCHEMA}.ngo_requests ORDER BY id ASC")
                        rows = cur.fetchall()
                        offset = target_serial - max_serial - 1
                        if 0 <= offset < len(rows):
                            return rows[offset]["id"]
        return None

    db_id = resolve_draft_id(ngo_id)
    if db_id is not None:
        if type_name == "NGO":
            status_val = payload.get("status")
            approved_qty = payload.get("approved_quantity")
            approver = payload.get("approver_name")
            partner = payload.get("partner_type")
            disp_loc = payload.get("dispatch_location")
            exp_days = payload.get("expected_delivery_days")
            disp_date = payload.get("dispatch_date")
            del_date = payload.get("delivery_date")
            
            with get_conn() as conn:
                with conn.cursor() as cur:
                    update_fields = []
                    params = []
                    
                    if status_val is not None:
                        update_fields.append("status = %s")
                        params.append(status_val)
                        if status_val == "Submitted Request":
                            update_fields.append("partner_type = %s")
                            params.append("AFE Partner")
                            update_fields.append("donor = %s")
                            params.append("Amazon")
                    if approved_qty is not None:
                        update_fields.append("approved_quantity = %s")
                        params.append(approved_qty)
                    if approver is not None:
                        update_fields.append("approver_name = %s")
                        params.append(approver)
                    if partner is not None:
                        update_fields.append("partner_type = %s")
                        params.append(partner)
                    if disp_loc is not None:
                        update_fields.append("dispatch_location = %s")
                        params.append(disp_loc)
                    if exp_days is not None:
                        update_fields.append("expected_delivery_days = %s")
                        params.append(exp_days)
                    if disp_date is not None:
                        if disp_date == "": disp_date = None
                        update_fields.append("dispatch_date = %s")
                        params.append(disp_date)
                    if del_date is not None:
                        if del_date == "": del_date = None
                        update_fields.append("delivery_date = %s")
                        params.append(del_date)
                        
                    if update_fields:
                        query = f"""
                            UPDATE {DB_SCHEMA}.ngo_requests
                            SET {', '.join(update_fields)}
                            WHERE id = %s
                        """
                        params.append(db_id)
                        cur.execute(query, tuple(params))
                        conn.commit()
                    
                    if status_val in {"Approved", "Dispatched", "Delivered"}:
                        cur.execute(
                            f"""
                            SELECT ngo_name, email, laptop_quantity, approver_name, approved_quantity, 
                                   dispatch_location, expected_delivery_days, dispatch_date, delivery_date, attached_email_link
                            FROM {DB_SCHEMA}.ngo_requests 
                            WHERE id = %s
                            """, 
                            (db_id,)
                        )
                        row = cur.fetchone()
                        if row and row.get("email"):
                            final_qty = row["approved_quantity"] or row["laptop_quantity"]
                            if status_val == "Approved":
                                # send_afe_internal_approval_email disabled: only NGOs receive approval emails
                                send_afe_approval_email(row["ngo_name"], row["email"], final_qty)
                            elif status_val in ["Dispatched", "Delivered"]:
                                # Fetch any laptops allocated to this NGO name
                                laptops_list = []
                                try:
                                    cur.execute(
                                        f"""
                                        SELECT id, manufacturer_model, ram, rom, processor 
                                        FROM {DB_SCHEMA}.laptop_labeling 
                                        WHERE UPPER(allocated_to) = UPPER(%s)
                                        """,
                                        (row["ngo_name"],)
                                    )
                                    for r_lap in cur.fetchall():
                                        laptops_list.append(dict(r_lap))
                                except Exception as e:
                                    print(f"Failed to fetch laptops for email: {e}")
                                    
                                if status_val == "Dispatched":
                                    send_afe_dispatch_email(
                                        row["ngo_name"], 
                                        row["email"], 
                                        final_qty, 
                                        row["dispatch_date"], 
                                        row["dispatch_location"], 
                                        row["expected_delivery_days"]
                                    )
                                    send_afe_serial_number_sheet_email(
                                        row["ngo_name"], 
                                        row["email"], 
                                        laptops_list
                                    )
                                elif status_val == "Delivered":
                                    send_afe_delivery_email(row["ngo_name"], row["email"], final_qty, laptops_list, row["delivery_date"])
            return {"status": "success", "id": ngo_id, "status_updated": status_val}
            
        elif type_name == "NGOTimeline":
            date_val = payload.get("tentative_refurb_completion")
            if date_val == "": date_val = None
            with get_conn() as conn:
                with conn.cursor() as cur:
                    if str(ngo_id).startswith("SAM-"):
                        cur.execute(
                            f"""
                            UPDATE {DB_SCHEMA}.external_registered_ngo
                            SET tentative_refurb_completion = %s
                            WHERE id = %s
                            """,
                            (date_val, str(ngo_id))
                        )
                    else:
                        cur.execute(
                            f"""
                            UPDATE {DB_SCHEMA}.ngo_requests
                            SET tentative_refurb_completion = %s
                            WHERE id = %s
                            """,
                            (date_val, db_id)
                        )
                    conn.commit()
            return {"status": "success", "id": ngo_id, "timeline_updated": date_val}
            
        elif type_name == "deleteNgo":
            with get_conn() as conn:
                with conn.cursor() as cur:
                    cur.execute(f"DELETE FROM {DB_SCHEMA}.ngo_requests WHERE id = %s", (db_id,))
                    conn.commit()
            return {"status": "success", "id": ngo_id, "deleted": True}
            
        elif type_name == "donorUpdate":
            donor_val = payload.get("donor")
            with get_conn() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        f"""
                        UPDATE {DB_SCHEMA}.ngo_requests
                        SET donor = %s
                        WHERE id = %s
                        """,
                        (donor_val, db_id)
                    )
                    conn.commit()
            return {"status": "success", "id": ngo_id, "donor_updated": donor_val}
            
    # Intercept status changes
    if type_name == "NGO":
        status_val = payload.get("status")
        ngo_id = payload.get("id")
        ngo_type = payload.get("ngoType")
        
        # Persist status in database for registered NGOs (SAM-...)
        if ngo_id:
            try:
                with get_conn() as conn:
                    with conn.cursor() as cur:
                        update_parts = ["status = %s"]
                        update_args = [status_val]
                        if ngo_type:
                            update_parts.append("ngo_type = %s")
                            update_args.append(ngo_type)
                        update_args.append(str(ngo_id))
                        cur.execute(
                            f"""
                            UPDATE {DB_SCHEMA}.external_registered_ngo
                            SET {', '.join(update_parts)}
                            WHERE id = %s
                            """,
                            tuple(update_args)
                        )
                        conn.commit()
            except Exception as update_err:
                print(f"Failed to update status in external_registered_ngo: {update_err}")

        if status_val in {"Approved", "Dispatched", "Delivered"}:
            try:
                with get_conn() as conn:
                    with conn.cursor() as cur:
                        cur.execute(
                            f"""
                            SELECT organization_name, email, laptop_require
                            FROM {DB_SCHEMA}.external_registered_ngo
                            WHERE id = %s
                            """,
                            (str(ngo_id),)
                        )
                        row = cur.fetchone()
                        if row:
                            ngo_name = row["organization_name"] or "NGO Partner"
                            ngo_email = row["email"]
                            qty_requested = row["laptop_require"] or 0
                            
                            if ngo_email:
                                if status_val == "Approved":
                                    send_afe_approval_email(ngo_name, ngo_email, qty_requested)
                                elif status_val == "Dispatched":
                                    send_afe_dispatch_email(ngo_name, ngo_email, qty_requested)
                                elif status_val == "Delivered":
                                    laptops_list = []
                                    try:
                                        with get_conn() as conn:
                                            with conn.cursor() as cur:
                                                cur.execute(
                                                    f"""
                                                    SELECT id, manufacturer_model, ram, rom, processor 
                                                    FROM {DB_SCHEMA}.laptop_labeling 
                                                    WHERE UPPER(allocated_to) = UPPER(%s)
                                                    """,
                                                    (ngo_name,)
                                                )
                                                for r in cur.fetchall():
                                                    laptops_list.append({
                                                        "id": r[0],
                                                        "manufacturer_model": r[1] or "",
                                                        "ram": r[2] or "",
                                                        "rom": r[3] or "",
                                                        "processor": r[4] or ""
                                                    })
                                    except Exception as db_err:
                                        print(f"Failed to fetch laptop serials for {ngo_name} on delivery: {db_err}")
                                    
                                    send_afe_delivery_email(ngo_name, ngo_email, qty_requested, laptops_list)
                            else:
                                print(f"NGO email is empty. Skipping email trigger for status {status_val}.")
                        else:
                            print(f"NGO with ID {ngo_id} not found in registration list.")
            except Exception as e:
                print(f"Failed to process status notification details for {status_val}: {e}")
        return {"status": "success", "id": ngo_id, "status_updated": status_val}

    elif type_name == "donorUpdate":
        donor_val = payload.get("donor")
        ngo_id = payload.get("id")
        if ngo_id:
            try:
                with get_conn() as conn:
                    with conn.cursor() as cur:
                        cur.execute(
                            f"""
                            UPDATE {DB_SCHEMA}.external_registered_ngo
                            SET doner = %s
                            WHERE id = %s
                            """,
                            (donor_val, str(ngo_id))
                        )
                        conn.commit()
            except Exception as e:
                print(f"Failed to update donor in external_registered_ngo: {e}")
        return {"status": "success", "id": ngo_id, "donor_updated": donor_val}
                
    if type_name in {
        "MultipleDocsUpload", "MultipleDocsUpdate", "NewMultipleDocsUpload", "updateDocStatus",
        "MouUpload", "question", "UpdateMonthly", "UpdateYearly", "Monthly", "Yearly",
        "SendMonthlyReport", "SendYearlyReport", "manageStatus", "addManageStatus",
        "editManageStatus", "deleteManageStatus", "updateStatusHistory", "donorQuestion",
        "Donor", "GetMou", "getMonthlyStatusUpdate", "yearlyQuestion",
    }:
        return _save_ngo_operation(type_name, payload)

    raise HTTPException(
        status_code=501,
        detail=f"NGO operation '{type_name or 'unknown'}' is not implemented in the database backend",
    )


@router.get("/exec")
def exec_get(request: Request) -> Any:
    type_name = _type_from_request(request, None)
    if not type_name:
        raise HTTPException(status_code=400, detail="Missing 'type' query parameter")
    authorize(request, f"read:{type_name}")

    if type_name == "getLaptopData":
        return _query_laptops(request)
    if type_name == "getUserData":
        return _query_users(request)
    if type_name == "getpre":
        return _query_preliminary(request)
    if type_name == "pickupget":
        return _query_pickups()
    if type_name == "audit":
        return _query_audit(request)
    if type_name in {"getDonorList", "getDonorCompanies"}:
        return _query_donor_companies()
    if type_name == "getStageTemplate":
        return _query_stage_template(request)
    if type_name in {"getStageMap", "getStages"}:
        return _query_stage_map(request)
    if type_name == "getLaptopStageRuns":
        return _query_laptop_stage_runs(request)
    if type_name == "getStageRunResponses":
        return _query_stage_run_responses(request)
    if type_name == "getStageGateLogs":
        return _query_stage_gate_logs(request)
    if type_name == "getLaptopStageSnapshot":
        return _query_laptop_stage_snapshot(request)
    if type_name == "getFailedGateQueue":
        return _query_failed_gate_queue()
    if type_name == "getIssueLogs":
        return _query_issue_logs(request)

    raise HTTPException(status_code=501, detail=f"Operation '{type_name}' is not implemented in the database backend")


@router.post("/exec")
async def exec_post(request: Request) -> Any:
    payload = await _json_object(request)
    return await run_in_threadpool(_exec_post, request, payload)


def _exec_post(request: Request, payload: Dict[str, Any]) -> Any:
    type_name = _type_from_request(request, payload)
    if not type_name:
        raise HTTPException(status_code=400, detail="Missing 'type' in query or JSON body")

    if type_name == "publicInquiry":
        return _save_public_inquiry(payload)

    if type_name == "email-webhook":
        verify_webhook_secret(request, "EMAIL_WEBHOOK_SECRET")
    if type_name in {"userdetails", "editUser"}:
        _authorize_beneficiary_edit(request, type_name, payload)
    else:
        authorize(request, type_name)
    if type_name in MIGRATED_TYPES:
        return _handle_post_type(type_name, payload)

    raise HTTPException(status_code=501, detail=f"Operation '{type_name}' is not implemented in the database backend")


@router.get("/user-exec")
def user_exec_get(request: Request) -> Any:
    type_name = _type_from_request(request, None)
    authorize(request, type_name or "getUsers")
    if type_name in (None, "", "getUserRole", "getUsers"):
        return _query_user_login_data()
    if type_name == "getRegistration":
        return _query_user_registration()
    raise HTTPException(status_code=501, detail=f"type '{type_name}' not implemented in user backend")


@router.post("/user-exec")
async def user_exec_post(request: Request) -> Any:
    payload = await _json_object(request)

    type_name = _type_from_request(request, payload)
    if not type_name:
        raise HTTPException(status_code=400, detail="Missing 'type' in query or JSON body")
    # The handler dispatches on the body's type, which can differ from the query's.
    authorize(request, type_name)
    if payload.get("type") != type_name:
        authorize(request, payload.get("type"))
    try:
        return await asyncio.wait_for(
            asyncio.to_thread(_handle_user_post_type, payload, client_ip(request)),
            timeout=45,
        )
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="Login database request timed out")
