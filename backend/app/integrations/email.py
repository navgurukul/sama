"""Outbound email through SMTP, Mailjet, or a local log file as fallback."""

from __future__ import annotations

import os
import re
from datetime import datetime

import httpx

from ..core.paths import BACKEND_DIR


def _log_email_to_file(to_email: str, subject: str, html_part: str, cc: list = None):
    try:
        import datetime
        import re
        scratch_dir = os.path.join(BACKEND_DIR, "scratch")
        os.makedirs(scratch_dir, exist_ok=True)
        log_path = os.path.join(scratch_dir, "email_log.txt")
        
        # Clean HTML tags for a clean terminal/text view
        text_body = re.sub('<[^<]+?>', '', html_part)
        text_body = "\n".join([line.strip() for line in text_body.split("\n") if line.strip()])
        
        with open(log_path, "a", encoding="utf-8") as f:
            f.write("=" * 60 + "\n")
            f.write(f"TIMESTAMP: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"TO: {to_email}\n")
            if cc:
                f.write(f"CC: {', '.join([c.get('Email', '') for c in cc])}\n")
            f.write(f"SUBJECT: {subject}\n")
            f.write("-" * 60 + "\n")
            f.write(text_body + "\n")
            f.write("=" * 60 + "\n\n")
        print(f"Logged email to local sandbox: {log_path}")
    except Exception as e:
        print(f"Failed to log email to file: {e}")


def _send_email_common(to_email: str, subject: str, html_part: str, cc: list = None, attachments: list = None, to_name: str = "", from_email: str = None, from_name: str = None, reply_to: str = None):
    # 1. Try Google SMTP
    smtp_user = os.environ.get("SMTP_USER")
    smtp_password = os.environ.get("SMTP_PASSWORD")
    sender_name = from_name or os.environ.get("MAILJET_SENDER_NAME", "Sama Operations")
    
    # 2. Try Mailjet fallback
    api_key = os.environ.get("MAILJET_API_KEY")
    api_secret = os.environ.get("MAILJET_API_SECRET")
    sender_email = from_email or os.environ.get("MAILJET_SENDER_EMAIL")
    
    if smtp_user and smtp_password:
        import smtplib
        from email.mime.multipart import MIMEMultipart
        from email.mime.text import MIMEText
        from email.mime.base import MIMEBase
        from email import encoders
        import base64
        
        smtp_host = os.environ.get("SMTP_HOST", "smtp.gmail.com")
        smtp_sender = from_email or os.environ.get("SMTP_SENDER", smtp_user)
        try:
            smtp_port = int(os.environ.get("SMTP_PORT", "587"))
        except Exception:
            smtp_port = 587
            
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{sender_name} <{smtp_sender}>"
            msg["To"] = to_email
            if reply_to:
                msg["Reply-To"] = reply_to
            
            cc_emails = []
            if cc:
                cc_emails = [c.get("Email", "") for c in cc if c.get("Email")]
                msg["Cc"] = ", ".join(cc_emails)
                
            all_recipients = [to_email] + cc_emails
            msg.attach(MIMEText(html_part, "html"))
            
            if attachments:
                for att in attachments:
                    part = MIMEBase("application", "octet-stream")
                    b64_content = att.get("Base64Content")
                    if b64_content:
                        raw_data = base64.b64decode(b64_content)
                        part.set_payload(raw_data)
                    else:
                        part.set_payload(att.get("Content", b""))
                    encoders.encode_base64(part)
                    part.add_header(
                        "Content-Disposition",
                        f"attachment; filename={att.get('Filename', 'attachment.csv')}",
                    )
                    msg.attach(part)
            
            with smtplib.SMTP(smtp_host, smtp_port, timeout=15.0) as server:
                server.starttls()
                server.login(smtp_user, smtp_password)
                server.sendmail(smtp_sender, all_recipients, msg.as_string())
            print(f"Email sent successfully via SMTP ({smtp_host}) to {to_email}")
            return True
        except Exception as e:
            print(f"Failed to send email via SMTP ({smtp_host}): {e}. Falling back to logging.")
            _log_email_to_file(to_email, subject, html_part, cc=cc)
            return False
            
    elif api_key and api_secret and sender_email:
        payload = {
            "Messages": [
                {
                    "From": {
                        "Email": sender_email,
                        "Name": sender_name
                    },
                    "To": [
                        {
                            "Email": to_email,
                            "Name": to_name or to_email
                        }
                    ],
                    "Subject": subject,
                    "HTMLPart": html_part
                }
            ]
        }
        if cc:
            payload["Messages"][0]["Cc"] = [{"Email": c.get("Email", ""), "Name": c.get("Name", "Recipient")} for c in cc if c.get("Email")]
        if attachments:
            payload["Messages"][0]["Attachments"] = attachments
            
        try:
            response = httpx.post("https://api.mailjet.com/v3.1/send", auth=(api_key, api_secret), json=payload, timeout=15.0)
            response.raise_for_status()
            print(f"Email sent successfully via Mailjet to {to_email}")
            return True
        except Exception as e:
            print(f"Failed to send email via Mailjet: {e}. Falling back to logging.")
            _log_email_to_file(to_email, subject, html_part, cc=cc)
            return False
    else:
        # Attach details for the log file if present
        log_text = html_part
        if attachments:
            for att in attachments:
                log_text += f"\n\n[ATTACHMENT: {att.get('Filename', 'attachment.csv')}]"
        _log_email_to_file(to_email, subject, log_text, cc=cc)
        return True
