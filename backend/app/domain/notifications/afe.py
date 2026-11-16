"""Email notifications for the AFE (Amazon Future Engineer) request lifecycle."""

from __future__ import annotations

import os
from datetime import date
from typing import Any, Dict, List

from ...integrations.email import _send_email_common


def send_afe_approval_email(ngo_name: str, ngo_email: str, qty_requested: Any):
    ops_email = os.environ.get("SAMA_OPS_EMAIL", "ops@thesama.in")
    afe_email = os.environ.get("AMAZON_AFE_EMAIL", "afe-team@amazon.com")
    subject = f"AFE Laptop Request Approved – {ngo_name}"
    html_part = f"""
        <p>Dear {ngo_name} Team,</p>
        <p>We are pleased to inform you that your request for <strong>{qty_requested} laptops</strong> has been approved. The request has now been handed over to the Sama Operations team for further processing. We will begin the refurbishment process and share the tentative completion and dispatch timeline with you within 8–10 business days.</p>
        <p>If you have any questions, please feel free to reach out to us.</p>
        <p>Best regards,<br/>Sama Operations Team</p>
    """
    _send_email_common(
        to_email=ngo_email,
        subject=subject,
        html_part=html_part,
        cc=[{"Email": ops_email}, {"Email": afe_email}],
        to_name=ngo_name
    )


def send_afe_internal_approval_email(ngo_name: str, approver_name: str, qty_approved: Any):
    # Internal notification disabled so operations team inbox is not spammed; only NGOs receive the approval email
    return True


def send_afe_draft_submission_email(ngo_name: str, ngo_email: str, qty_requested: Any, contact_name: str, location: str, use_case: str):
    ops_email = os.environ.get("SAMA_OPS_EMAIL", "operations@thesama.in")
    afe_email = os.environ.get("AMAZON_AFE_EMAIL", "afe-team@amazon.com")
    subject = f"New NGO Draft Request Submitted – {ngo_name}"
    html_part = f"""
        <p>Dear Sama Team,</p>
        <p>A new NGO laptop request has been submitted as a draft.</p>
        <p><strong>NGO Name:</strong> {ngo_name}</p>
        <p><strong>Contact Email:</strong> {ngo_email}</p>
        <p><strong>Contact Name:</strong> {contact_name}</p>
        <p><strong>Requested Quantity:</strong> {qty_requested} laptops</p>
        <p><strong>Location:</strong> {location}</p>
        <p><strong>Use Case:</strong> {use_case}</p>
        <p>This request is now available as a draft on the admin dashboard for your review.</p>
        <p>Best regards,<br/>Sama Operations System</p>
    """
    _send_email_common(
        to_email=ops_email,
        subject=subject,
        html_part=html_part,
        to_name="Sama Operations",
        from_email=os.environ.get("SMTP_SENDER", "operations@thesama.in")
    )


def send_afe_serial_number_sheet_email(ngo_name: str, ngo_email: str, laptops_list: list):
    import csv, io, base64
    afe_email = os.environ.get("AMAZON_AFE_EMAIL", "afe-team@amazon.com")
    subject = f"AFE Laptop Serial Numbers – {ngo_name}"
    
    # Generate CSV
    csv_io = io.StringIO()
    writer = csv.writer(csv_io)
    writer.writerow(["Serial Number", "Manufacturer/Model", "Processor", "RAM", "ROM"])
    for lap in laptops_list:
        writer.writerow([
            lap.get("id", ""),
            lap.get("manufacturer_model", ""),
            lap.get("processor", ""),
            lap.get("ram", ""),
            lap.get("rom", "")
        ])
    
    csv_content = csv_io.getvalue().encode("utf-8")
    b64_content = base64.b64encode(csv_content).decode("utf-8")
    
    attachments = [{
        "Filename": f"{ngo_name.replace(' ', '_')}_Laptops.csv",
        "Base64Content": b64_content,
        "ContentType": "text/csv"
    }]
    
    html_part = f"""
        <p>Dear {ngo_name} Team,</p>
        <p>Please find attached the CSV file containing the serial numbers and hardware details of the laptops dispatched to your organization.</p>
        <p>If you have any questions or require support, please contact us.</p>
        <p>Best regards,<br/>Sama Operations Team</p>
    """
    _send_email_common(
        to_email=ngo_email,
        subject=subject,
        html_part=html_part,
        cc=[{"Email": afe_email}],
        attachments=attachments,
        to_name=ngo_name
    )


def send_afe_dispatch_email(ngo_name: str, ngo_email: str, qty_requested: Any, dispatch_date_val: Any = None, dispatch_location: Any = None, expected_days: Any = None):
    ops_email = os.environ.get("SAMA_OPS_EMAIL", "operations@thesama.in")
    afe_email = os.environ.get("AMAZON_AFE_EMAIL", "afe-team@amazon.com")
    
    date_str = str(dispatch_date_val) if dispatch_date_val else date.today().strftime("%d/%m/%Y")
    loc_str = str(dispatch_location) if dispatch_location else "Pune/Bangalore"
    days_str = str(expected_days) if expected_days else "3-5"
    
    subject = f"AFE Laptop Dispatch Confirmation – {ngo_name}"
    html_part = f"""
        <p>Dear {ngo_name} Team,</p>
        <p>We're happy to share that {qty_requested} laptops have been dispatched from our {loc_str} location on {date_str} and are on their way to you. They are expected to reach your location within {days_str} business days.</p>
        <p>Once the laptops are delivered, we'll follow up separately to confirm receipt and check that everything has arrived in good condition. In the meantime, if you have any questions about the shipment, please feel free to reach out.</p>
        <p>Warm regards,<br/>Sama Operations Team</p>
    """
    _send_email_common(
        to_email=ngo_email,
        subject=subject,
        html_part=html_part,
        cc=[{"Email": ops_email}, {"Email": afe_email}],
        to_name=ngo_name
    )


def send_afe_delivery_email(ngo_name: str, ngo_email: str, qty_requested: Any, laptops_list: List[Dict[str, Any]], delivery_date_val: Any = None):
    import csv
    import io
    import base64
    
    ops_email = os.environ.get("SAMA_OPS_EMAIL", "operations@thesama.in")
    afe_email = os.environ.get("AMAZON_AFE_EMAIL", "afe-team@amazon.com")
    
    date_str = str(delivery_date_val) if delivery_date_val else date.today().strftime("%d/%m/%Y")
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["#", "Serial number", "RAM", "ROM", "Manufacturer Model"])
    for idx, laptop in enumerate(laptops_list, 1):
        writer.writerow([
            idx,
            laptop.get("id", ""),
            laptop.get("ram", ""),
            laptop.get("rom", ""),
            laptop.get("manufacturer_model", "")
        ])
    csv_content = output.getvalue()
    base64_content = base64.b64encode(csv_content.encode("utf-8")).decode("utf-8")
    
    subject = f"AFE Laptop Delivery Confirmation – {ngo_name}"
    html_part = f"""
        <p>Dear {ngo_name} Team,</p>
        
        <p>We're happy to share that {qty_requested} laptops were delivered to your organization on {date_str}. We hope they reach your beneficiaries soon and make a real difference.</p>
        
        <p>At your earliest convenience, please confirm receipt and let us know the units are all in good working condition. We've attached the <span style="color: #0066cc; text-decoration: underline; font-weight: bold;">serial number sheet</span> and credentials for your reference. If anything seems off, please do reach out within <strong>15 working days</strong> so we can sort it out quickly.</p>
        
        <p>For your reference, please find the default login credentials and specifications for the delivered laptops:</p>
        <table border="1" cellpadding="5" style="border-collapse: collapse; margin-bottom: 20px;">
            <tr style="background-color: #f2f2f2;">
                <th>Detail</th>
                <th>Value</th>
            </tr>
            <tr>
                <td><strong>Default Username</strong></td>
                <td>Sama</td>
            </tr>
            <tr>
                <td><strong>Default Password</strong></td>
                <td>1</td>
            </tr>
            <tr>
                <td><strong>Scope</strong></td>
                <td>Standard login for all Windows laptops in this shipment</td>
            </tr>
        </table>

        <p>A couple of small things we'd appreciate:</p>
        <ul style="list-style-type: disc; padding-left: 20px;">
            <li>A signed delivery acknowledgment would be great to have on file</li>
            <li>A feedback form is also attached; please do share it in case you face any issues with the laptops (Feedback link: <a href="https://form.jotform.com/261834345018052">https://form.jotform.com/261834345018052</a>)</li>
            <li>We'd love to hear a quick update every three months on how the laptops are being used, as it really helps us understand the impact on your beneficiaries</li>
        </ul>
        
        <p>Thank you so much for being a valued implementation partner. We're looking forward to hearing the good things these laptops help make possible!</p>
        
        <p>Best regards,<br/>Sama Operations Team</p>
    """
    
    attachments = [
        {
            "ContentType": "text/csv",
            "Filename": f"AFE_Laptops_List_{ngo_name.replace(' ', '_')}.csv",
            "Base64Content": base64_content
        }
    ]
    
    _send_email_common(
        to_email=ngo_email,
        subject=subject,
        html_part=html_part,
        cc=[{"Email": ops_email}, {"Email": afe_email}],
        attachments=attachments,
        to_name=ngo_name
    )
