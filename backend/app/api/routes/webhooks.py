"""Inbound webhooks from JotForm."""

from __future__ import annotations

from typing import Any, Dict

from fastapi import APIRouter, Request
from starlette.concurrency import run_in_threadpool

from ...core.db import DB_SCHEMA, get_conn
from ...core.security import verify_webhook_secret

router = APIRouter()


@router.post("/jotform-webhook")
async def jotform_webhook(request: Request):
    verify_webhook_secret(request, "JOTFORM_WEBHOOK_SECRET")
    try:
        payload = await request.json()
    except Exception:
        form_data = await request.form()
        payload = dict(form_data)
    return await run_in_threadpool(_record_impact_report, payload)


def _record_impact_report(payload: Dict[str, Any]) -> Dict[str, Any]:
    print(f"JotForm webhook received submission with {len(payload)} fields")

    email = None
    ngo_name = None
    
    for key, val in payload.items():
        if "email" in key.lower():
            email = str(val).strip()
        if "ngo" in key.lower() or "organization" in key.lower():
            ngo_name = str(val).strip()
            
    if not email and not ngo_name:
        return {"status": "ignored", "reason": "No email or NGO name found in submission"}
        
    with get_conn() as conn:
        with conn.cursor() as cur:
            if email:
                cur.execute(f"UPDATE {DB_SCHEMA}.ngo_requests SET last_impact_report_date = CURRENT_DATE WHERE LOWER(email) = LOWER(%s)", (email,))
            elif ngo_name:
                cur.execute(f"UPDATE {DB_SCHEMA}.ngo_requests SET last_impact_report_date = CURRENT_DATE WHERE LOWER(ngo_name) = LOWER(%s)", (ngo_name,))
            conn.commit()
            
    return {"status": "success"}
