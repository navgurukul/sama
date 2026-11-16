"""Scheduled notifications: RMS inactivity alerts, impact reminders, inbound email parsing."""

from __future__ import annotations

import asyncio
import os
import re
from datetime import date

from ...core.db import DB_SCHEMA, get_conn
from ...integrations.email import _send_email_common
from ...integrations.llm import _parse_ngo_request_with_ai


def send_rms_inactivity_support_email(ngo_name: str, ngo_email: str, laptop_id: str, limit_days: int):
    ops_email = os.environ.get("SAMA_OPS_EMAIL", "operations@thesama.in")
    afe_email = os.environ.get("AMAZON_AFE_EMAIL", "afe-team@amazon.com")
    
    subject = f"Laptop Inactivity Alert – Support Check-in Required {ngo_name}"
    html_part = f"""
        <p>Dear {ngo_name} Team,</p>
        <p>We hope you are doing well.</p>
        <p>As part of our routine monitoring under the Remote Management System (RMS), we have noticed that one of the laptops distributed to {ngo_name}, Asset Tag/Serial Number: {laptop_id}, has not connected to the internet for over {limit_days} days and has therefore been marked as inactive in our system.</p>
        <p>This could be due to a number of reasons, such as limited connectivity, the device being temporarily out of use, or a technical issue on the device end. We would appreciate it if you could share a quick update on the current status of this laptop within a week.</p>
        <p>If any support is needed on our end, whether technical troubleshooting or otherwise, please feel free to reach out to us.</p>
        <p>Best regards,<br/>Sama Operations Team</p>
    """
    _send_email_common(
        to_email=ngo_email,
        subject=subject,
        html_part=html_part,
        cc=[{"Email": ops_email}, {"Email": afe_email}],
        to_name=ngo_name
    )


async def check_rms_inactivity():
    print("Checking RMS inactivity...")
    limit_days = int(os.environ.get("RMS_INACTIVITY_LIMIT_DAYS", "30"))
    
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"""
                SELECT ll.id, ll.allocated_to, MAX(mc.rms_last_seen) AS rms_last_seen
                FROM {DB_SCHEMA}.laptop_labeling ll
                LEFT JOIN {DB_SCHEMA}.monthly_check_in mc ON mc.laptop_id = ll.id
                WHERE ll.status = 'DISTRIBUTION'
                GROUP BY ll.id, ll.allocated_to
                HAVING COALESCE(MAX(mc.rms_last_seen), ll.last_updated_on) < now() - %s * INTERVAL '1 day'
                """,
                (limit_days,)
            )
            inactive_laptops = cur.fetchall()
            
            if not inactive_laptops:
                print("No inactive laptops found.")
                return
                
            ngos = []
            try:
                cur.execute(
                    f"""
                    SELECT id, organization_name, email
                    FROM {DB_SCHEMA}.external_registered_ngo
                    """
                )
                ngos = [{"Id": r["id"], "organizationName": r["organization_name"], "email": r["email"]} for r in cur.fetchall()]
            except Exception as e:
                print(f"Failed to fetch NGO registrations from DB for email mapping: {e}")
                
            for laptop in inactive_laptops:
                laptop_id = laptop["id"]
                ngo_name = laptop["allocated_to"]
                last_seen = laptop["rms_last_seen"]
                
                cur.execute(
                    f"""
                    SELECT 1 FROM {DB_SCHEMA}.issue_log 
                    WHERE laptop_id = %s 
                      AND status = 'OPEN' 
                      AND issue_description LIKE 'Device Inactive%%'
                    LIMIT 1
                    """,
                    (laptop_id,)
                )
                if cur.fetchone():
                    continue
                    
                desc = f"Device Inactive for {limit_days}+ days. Last seen: {last_seen.strftime('%d/%m/%Y %H:%M') if last_seen else 'Never'}"
                cur.execute(
                    f"""
                    INSERT INTO {DB_SCHEMA}.issue_log (laptop_id, issue_description, severity, status)
                    VALUES (%s, %s, 'P2', 'OPEN')
                    """,
                    (laptop_id, desc)
                )
                conn.commit()
                
                ngo = next((n for n in ngos if str(n.get("organizationName", "")).lower() == str(ngo_name).lower()), None)
                ngo_email = ngo.get("email") if ngo else None
                
                if ngo_email:
                    send_rms_inactivity_support_email(ngo_name, ngo_email, laptop_id, limit_days)
                else:
                    print(f"No email found for NGO {ngo_name}. Logged issue in DB only.")


def send_quarterly_impact_email(ngo_name: str, ngo_email: str, months: int, jotform_url: str):
    ops_email = os.environ.get("SAMA_OPS_EMAIL", "operations@thesama.in")
    afe_email = os.environ.get("AMAZON_AFE_EMAIL", "afe-team@amazon.com")
    
    subject = f"Quarterly Impact Report Submission Reminder – {ngo_name}"
    html_part = f"""
        <p>Dear {ngo_name} Team,</p>
        <p>We hope you are doing well.</p>
        <p>As part of our quarterly review process, we kindly request you to submit the Impact Report for your organization. This report helps us track the usage and impact of the distributed laptops within your programs.</p>
        <p>Please use the link below to submit your report along with the required photos:</p>
        <p><a href="{jotform_url}" target="_blank">Impact report</a></p>
        <p>We would appreciate it if this could be completed within a week. If you have any questions or need assistance while filling out the form, please feel free to reach out to us.</p>
        <p>Thank you for your continued partnership and support.</p>
        <p>Best regards,<br/>Sama Operations Team</p>
    """
    _send_email_common(
        to_email=ngo_email,
        subject=subject,
        html_part=html_part,
        cc=[{"Email": ops_email}, {"Email": afe_email}],
        to_name=ngo_name
    )


async def send_quarterly_impact_reminders():
    print("Checking for quarterly impact reminders...")
    jotform_url = os.environ.get("QUARTERLY_IMPACT_JOTFORM_URL", "https://form.jotform.com/sama-impact-report")
    
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"""
                SELECT r.laptop_id, r.completed_at, ll.allocated_to
                FROM {DB_SCHEMA}.laptop_stage_run r
                JOIN {DB_SCHEMA}.laptop_labeling ll ON ll.id = r.laptop_id
                WHERE r.stage_code = 'DISTRIBUTION' 
                  AND r.completed_at IS NOT NULL
                """
            )
            shipments = cur.fetchall()
            
            if not shipments:
                return
                
            ngos = []
            try:
                cur.execute(
                    f"""
                    SELECT id, organization_name, email
                    FROM {DB_SCHEMA}.external_registered_ngo
                    """
                )
                ngos = [{"Id": r["id"], "organizationName": r["organization_name"], "email": r["email"]} for r in cur.fetchall()]
            except Exception as e:
                print(f"Failed to fetch NGO registrations from DB: {e}")
                
            today = date.today()
            for ship in shipments:
                comp_at = ship["completed_at"]
                if not comp_at:
                    continue
                diff_days = (today - comp_at.date()).days
                
                # Triggers exactly at 3 months (90 days), 6 months (180 days), 9 months (270 days)
                if diff_days in {90, 180, 270}:
                    months = diff_days // 30
                    ngo_name = ship["allocated_to"]
                    ngo = next((n for n in ngos if str(n.get("organizationName", "")).lower() == str(ngo_name).lower()), None)
                    ngo_email = ngo.get("email") if ngo else None
                    
                    if ngo_email:
                        send_quarterly_impact_email(ngo_name, ngo_email, months, jotform_url)


async def check_and_parse_inbound_emails():
    imap_user = os.environ.get("NGO_REQUEST_EMAIL")
    imap_pass = os.environ.get("NGO_REQUEST_EMAIL_PASSWORD")
    if not imap_user or not imap_pass:
        return
        
    import imaplib
    import email
    from email.header import decode_header
    
    try:
        mail = imaplib.IMAP4_SSL("imap.gmail.com", 993)
        mail.login(imap_user, imap_pass)
        mail.select("inbox")
        
        status, messages = mail.search(None, "UNSEEN")
        if status != "OK" or not messages[0]:
            mail.logout()
            return
            
        for num in messages[0].split():
            status, data = mail.fetch(num, "(RFC822)")
            if status != "OK":
                continue
                
            raw_email = data[0][1]
            msg = email.message_from_bytes(raw_email)
            
            subject, encoding = decode_header(msg.get("Subject", ""))[0]
            if isinstance(subject, bytes):
                subject = subject.decode(encoding or "utf-8", errors="ignore")
                
            # Match laptop request keywords
            if "request" not in subject.lower() or "laptop" not in subject.lower():
                continue
                
            sender, encoding = decode_header(msg.get("From", ""))[0]
            if isinstance(sender, bytes):
                sender = sender.decode(encoding or "utf-8", errors="ignore")
                
            body = ""
            if msg.is_multipart():
                for part in msg.walk():
                    content_type = part.get_content_type()
                    content_disposition = str(part.get("Content-Disposition"))
                    if content_type == "text/plain" and "attachment" not in content_disposition:
                        payload_data = part.get_payload(decode=True)
                        body = payload_data.decode(part.get_content_charset() or "utf-8", errors="ignore")
                        break
            else:
                payload_data = msg.get_payload(decode=True)
                body = payload_data.decode(msg.get_content_charset() or "utf-8", errors="ignore")
                
            body = body.strip()
            if not body:
                continue
                
            parsed_data = _parse_ngo_request_with_ai(body)
            email_address = str(parsed_data.get("email") or sender or "").strip()
            email_match = re.search(r"[\w\.-]+@[\w\.-]+", email_address)
            if email_match:
                email_address = email_match.group(0)
                
            with get_conn() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        f"""
                        INSERT INTO {DB_SCHEMA}.ngo_requests
                        (ngo_name, laptop_quantity, location, use_case, contact_name, email, status)
                        VALUES (%s, %s, %s, %s, %s, %s, 'Pending Review')
                        """,
                        (
                            parsed_data["ngo_name"],
                            parsed_data["laptop_quantity"],
                            parsed_data["location"],
                            parsed_data["use_case"],
                            parsed_data["contact_name"],
                            email_address,
                        )
                    )
                    conn.commit()
            print(f"Automatically parsed and saved request draft from {email_address}")
            
            # Mark as read
            mail.store(num, "+FLAGS", "\\Seen")
            
        mail.close()
        mail.logout()
    except Exception as e:
        print(f"Error reading IMAP inbox: {e}")


async def run_email_polling_scheduler():
    print("Email polling scheduler task initiated.")
    while True:
        try:
            await check_and_parse_inbound_emails()
        except Exception as e:
            print(f"Error in email polling scheduler: {e}")
        await asyncio.sleep(60)
