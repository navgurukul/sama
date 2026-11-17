"""Public inquiries submitted from the website."""

from __future__ import annotations

import json
import os
from typing import Any, Dict

from fastapi import HTTPException

from ..core.db import DB_SCHEMA, get_conn
from ..integrations.email import _send_email_common


def _is_inquiry_email_paused(form_type: str, topic: str) -> bool:
    """Return True if email notification is paused for this inquiry.
    
    Operations requested pausing auto-emails for:
    - Sama Saathi inquiries ("I want to become a Sama Saathi")
    - Community model inquiries ("Bringing the Saathi model to my community" / community forms)
    - "Something else" inquiries
    """
    normalized_topic = (topic or "").strip().lower()
    normalized_form = (form_type or "").strip().lower()

    if normalized_form == "community":
        return True

    if "saathi" in normalized_topic:
        return True

    if "community" in normalized_topic or "model" in normalized_topic:
        return True

    if "something else" in normalized_topic or normalized_topic == "other":
        return True

    return False


def _save_public_inquiry(payload: Dict[str, Any]) -> Dict[str, Any]:
    form_type = str(payload.get("formType") or "").strip().lower()
    if form_type not in {"email", "community", "corporate", "government", "contact", "callback", "book_call", "newsletter"}:
        raise HTTPException(status_code=400, detail="Unsupported public form type")

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"""
                CREATE TABLE IF NOT EXISTS {DB_SCHEMA}.public_inquiries (
                    id SERIAL PRIMARY KEY,
                    form_type VARCHAR(50),
                    email VARCHAR(255),
                    first_name VARCHAR(100),
                    last_name VARCHAR(100),
                    company_name VARCHAR(255),
                    phone VARCHAR(50),
                    state VARCHAR(100),
                    city VARCHAR(100),
                    message TEXT,
                    payload JSONB,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
                """
            )
            cur.execute(
                f"""
                INSERT INTO {DB_SCHEMA}.public_inquiries
                (form_type, email, first_name, last_name, company_name, phone,
                 state, city, message, payload)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb)
                RETURNING id
                """,
                (
                    form_type,
                    payload.get("email"),
                    payload.get("firstName") or payload.get("name"),
                    payload.get("lastName"),
                    payload.get("companyName") or payload.get("organization"),
                    payload.get("phone") or payload.get("contact"),
                    payload.get("state"),
                    payload.get("city") or payload.get("place"),
                    payload.get("message"),
                    json.dumps(payload),
                ),
            )
            inquiry_id = cur.fetchone()["id"]
            conn.commit()

    topic = str(payload.get("topic") or "General Website Contact").strip()
    if _is_inquiry_email_paused(form_type, topic):
        print(f"Info: email notification paused for inquiry form_type='{form_type}', topic='{topic}' (inquiry_id={inquiry_id})")
        return {"status": "success", "databaseId": inquiry_id}

    # Automatically dispatch direct notification email to operations@thesama.in with CC to brendon@thesama.in
    try:
        sender_name = str(payload.get("name") or f"{payload.get('firstName', '')} {payload.get('lastName', '')}".strip() or "Website Visitor").strip()
        sender_phone = str(payload.get("phone") or payload.get("contact") or "Not provided").strip()
        sender_email = str(payload.get("email") or "Not provided").strip()
        sender_place = str(payload.get("place") or payload.get("city") or payload.get("state") or "Not provided").strip()
        company_name = str(payload.get("companyName") or payload.get("organization") or "").strip()
        preferred_time = str(payload.get("preferredTime") or payload.get("preferredDate") or "").strip()
        user_message = str(payload.get("message") or "").strip()

        if form_type in {"callback", "book_call"}:
            email_title = "Book a Call Request (Renew Desk)"
            email_subject = f"Book a Call Request: {sender_name}{f' ({company_name})' if company_name else ''}"
        elif form_type == "newsletter":
            email_title = "New Newsletter / Cohort Subscription"
            email_subject = f"Subscriber Signup: {sender_email} ({topic})"
        else:
            email_title = "New Website Contact Message"
            email_subject = f"Contact Message: {topic} - {sender_name}"

        company_row = f'<tr><td style="padding: 6px 0; font-weight: bold; color: #555;">Company / Org:</td><td>{company_name}</td></tr>' if company_name else ''
        preferred_time_row = f'<tr><td style="padding: 6px 0; font-weight: bold; color: #555;">Preferred Time:</td><td>{preferred_time}</td></tr>' if preferred_time else ''

        email_html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #222; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e2ddd5; border-radius: 8px; padding: 24px; background-color: #faf8f5;">
                <h2 style="color: #174B32; border-bottom: 2px solid #5C785A; padding-bottom: 10px; margin-top: 0;">
                    {email_title}
                </h2>
                <table style="width: 100%; border-collapse: collapse; margin-top: 14px;">
                    <tr><td style="padding: 6px 0; font-weight: bold; width: 140px; color: #555;">Topic / Source:</td><td>{topic}</td></tr>
                    <tr><td style="padding: 6px 0; font-weight: bold; color: #555;">Name:</td><td>{sender_name}</td></tr>
                    {company_row}
                    <tr><td style="padding: 6px 0; font-weight: bold; color: #555;">Email:</td><td><a href="mailto:{sender_email}">{sender_email}</a></td></tr>
                    <tr><td style="padding: 6px 0; font-weight: bold; color: #555;">Phone:</td><td>{sender_phone}</td></tr>
                    {preferred_time_row}
                    <tr><td style="padding: 6px 0; font-weight: bold; color: #555;">Location:</td><td>{sender_place}</td></tr>
                </table>
                <div style="background-color: #ffffff; padding: 16px; border-radius: 6px; margin-top: 18px; border: 1px solid #e8e3d8; border-left: 4px solid #174B32;">
                    <p style="margin: 0; font-weight: bold; color: #555;">Notes / Message:</p>
                    <p style="margin-top: 8px; margin-bottom: 0; white-space: pre-wrap; color: #222;">{user_message or 'No additional notes provided.'}</p>
                </div>
                <hr style="margin-top: 24px; border: none; border-top: 1px solid #e0ded8;">
                <p style="font-size: 12px; color: #888; margin: 0;">Submitted via Sama Website · CC: brendon@thesama.in · Reference ID #{inquiry_id}</p>
            </div>
        </body>
        </html>
        """
        reply_to_addr = sender_email if sender_email and "@" in sender_email and sender_email != "Not provided" else None
        cc_recipients = [{"Email": "brendon@thesama.in", "Name": "Brendon"}]

        _send_email_common(
            to_email=os.environ.get("SAMA_OPS_EMAIL", "operations@thesama.in"),
            subject=email_subject,
            html_part=email_html,
            cc=cc_recipients,
            to_name="Sama Operations Team",
            from_name="Sama Website Inquiries",
            reply_to=reply_to_addr
        )
    except Exception as email_err:
        print(f"Error sending contact form email to operations: {email_err}")

    return {"status": "success", "databaseId": inquiry_id}
