"""RMS webhook and device activity statistics."""

from __future__ import annotations

import asyncio
import html
import json
import urllib.parse
from typing import Any, Optional

from fastapi import APIRouter, HTTPException, Request, Response
from starlette.concurrency import run_in_threadpool

from ...core.db import DB_SCHEMA, get_conn
from ...core.security import verify_webhook_secret
from ...integrations.email import _send_email_common

router = APIRouter()


@router.post("/api/rms-webhook")
async def rms_webhook(request: Request):
    verify_webhook_secret(request, "RMS_WEBHOOK_SECRET")
    try:
        payload = await request.json()
        asset_tag = payload.get("asset_tag")
        status = payload.get("status")
        
        if not asset_tag:
            raise HTTPException(status_code=400, detail="Missing asset_tag")
            
        await run_in_threadpool(_record_rms_status, str(asset_tag), status)

        # If marked inactive, trigger the Stage 6 email alert to Ops
        if status and status.upper() == "INACTIVE":
            body = (
                f"Laptop Inactivity Alert for Asset Tag/Serial Number: {html.escape(str(asset_tag))}. "
                "It has not connected to the internet for over 30 days."
            )
            await asyncio.to_thread(
                _send_email_common,
                to_email="operations@thesama.in",
                to_name="Sama Operations",
                subject="Laptop Inactivity Alert - Support Check-in Required",
                html_part=body,
            )

        return {"status": "success", "message": f"Updated RMS status for {asset_tag}"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _record_rms_status(asset_tag: str, status: Any) -> None:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(f"""
                UPDATE {DB_SCHEMA}.laptop_labeling
                SET rms_status = %s, last_active_date = CURRENT_TIMESTAMP
                WHERE id = %s OR serial_number = %s
            """, (status, asset_tag, asset_tag))
            conn.commit()


@router.get("/api/rms-stats")
def get_rms_stats():
    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(f"""
                    SELECT rms_status, COUNT(*) AS count
                    FROM (
                        SELECT 
                            CASE 
                                WHEN COALESCE(MAX(mc.rms_last_seen), MAX(ll.last_updated_on)) >= now() - 30 * INTERVAL '1 day' THEN 'ACTIVE'
                                ELSE 'INACTIVE'
                            END AS rms_status
                        FROM {DB_SCHEMA}.laptop_labeling ll
                        LEFT JOIN {DB_SCHEMA}.monthly_check_in mc ON mc.laptop_id = ll.id
                        LEFT JOIN {DB_SCHEMA}.donor d ON ll.donor_id = d.donor_id
                        WHERE (ll.donor_company_name ILIKE '%amazon%' OR d.donor_company ILIKE '%amazon%')
                          AND ll.status = 'DISTRIBUTED'
                        GROUP BY ll.id
                    ) AS subquery
                    GROUP BY rms_status;
                """)
                rows = cur.fetchall()
                
                active = 0
                inactive = 0
                for r in rows:
                    if r.get("rms_status", "").upper() == "ACTIVE":
                        active += r.get("count", 0)
                    elif r.get("rms_status", "").upper() == "INACTIVE":
                        inactive += r.get("count", 0)
                        
                return {"active": active, "inactive": inactive}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/rms/by-ngo")
def get_rms_by_ngo(
    status_filter: Optional[str] = "all", 
    ngo_name: Optional[str] = None, 
    format: Optional[str] = "json"
):
    """
    Returns live RMS telemetry mapped to NGO names without altering or risking any data.
    - Joins laptop_labeling (allocated_to NGO) with live RMS API devices
    - Calculates exact working vs not working counts per NGO
    - Supports format='csv' for 1-click download of not-working or summary datasets
    """
    import urllib.request
    import csv
    import io
    from fastapi.responses import Response
    from collections import defaultdict

    try:
        # 1. Fetch live RMS devices from RMS Server
        rms_by_serial = {}
        try:
            req = urllib.request.Request(
                'https://rms-api.thesama.in/api/devices', 
                headers={'User-Agent': 'Mozilla/5.0'}
            )
            with urllib.request.urlopen(req, timeout=15) as resp:
                rms_devices = json.loads(resp.read().decode('utf-8'))
                for d in rms_devices:
                    sn = str(d.get('serial_number') or '').strip().upper()
                    if sn:
                        rms_by_serial[sn] = d
        except Exception as rms_err:
            print(f"Warning: Failed to fetch live RMS devices: {rms_err}")

        # 2. Query all allocated laptops from PostgreSQL RDS
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(f"""
                    SELECT 
                        trim(id) as serial,
                        trim(allocated_to) as ngo_name,
                        status,
                        donor_company_name,
                        manufacturer_model,
                        processor,
                        ram,
                        condition_status,
                        inventory_location,
                        mac_address,
                        last_delivery_date,
                        last_updated_on
                    FROM {DB_SCHEMA}.laptop_labeling
                    WHERE (is_deleted_from_sheet = FALSE OR is_deleted_from_sheet IS NULL)
                      AND allocated_to IS NOT NULL 
                      AND trim(allocated_to) != ''
                      AND lower(trim(allocated_to)) NOT IN ('sama demo', 'data entry', 'sample ngo')
                    ORDER BY allocated_to, id;
                """)
                laptops = cur.fetchall()

        # 3. Aggregate per NGO and build device list
        ngo_summary = defaultdict(lambda: {
            'ngo_name': '',
            'total_allocated': 0,
            'rms_working': 0,
            'rms_not_working': 0,
            'rms_not_installed': 0,
            'rms_inactive': 0,
            'active_percentage': 0.0,
            'total_usage_hours': 0.0,
            'donors': set()
        })

        not_working_devices = []
        matching_devices = []
        target_ngo_clean = ngo_name.strip().lower() if ngo_name else None

        for row in laptops:
            sn_orig = row["serial"]
            ngo = row["ngo_name"]
            sn_key = sn_orig.strip().upper()

            s = ngo_summary[ngo]
            s['ngo_name'] = ngo
            s['total_allocated'] += 1
            if row["donor_company_name"]:
                s['donors'].add(row["donor_company_name"].strip())

            rms_info = rms_by_serial.get(sn_key)
            is_working = False
            rms_state = 'NOT_INSTALLED'
            usage_mins = '0'
            last_ping = 'Never'
            mac_val = row["mac_address"] or ''
            rms_ver = ''

            if rms_info:
                mac_val = rms_info.get('mac_address') or mac_val
                rms_ver = str(rms_info.get('rms_version') or '')
                usage_mins = str(rms_info.get('total_usage_minutes') or '0')
                last_ping = str(rms_info.get('created_at') or '')
                try:
                    s['total_usage_hours'] += round(float(usage_mins) / 60.0, 1)
                except Exception:
                    pass

                if rms_info.get('isactive') is True:
                    is_working = True
                    s['rms_working'] += 1
                    rms_state = 'WORKING'
                else:
                    s['rms_inactive'] += 1
                    s['rms_not_working'] += 1
                    rms_state = 'INACTIVE'
            else:
                s['rms_not_installed'] += 1
                s['rms_not_working'] += 1

            dev_obj = {
                'serial_number': sn_orig,
                'ngo_name': ngo,
                'rms_status': rms_state,
                'is_working': is_working,
                'laptop_status': row["status"] or 'UNKNOWN',
                'donor_company': row["donor_company_name"] or 'N/A',
                'manufacturer_model': row["manufacturer_model"] or 'N/A',
                'processor': row["processor"] or 'N/A',
                'ram': row["ram"] or 'N/A',
                'condition_status': row["condition_status"] or 'N/A',
                'inventory_location': row["inventory_location"] or 'N/A',
                'mac_address': mac_val or 'N/A',
                'rms_version': rms_ver or 'N/A',
                'total_usage_minutes': usage_mins,
                'last_rms_ping': last_ping,
                'last_delivery_date': str(row["last_delivery_date"] or ''),
                'last_updated_on': str(row["last_updated_on"] or '')
            }

            if not is_working:
                not_working_devices.append(dev_obj)

            if target_ngo_clean:
                if ngo.strip().lower() == target_ngo_clean:
                    if status_filter == 'working' and is_working:
                        matching_devices.append(dev_obj)
                    elif status_filter == 'not_working' and not is_working:
                        matching_devices.append(dev_obj)
                    elif status_filter == 'all':
                        matching_devices.append(dev_obj)

        summary_list = []
        for ngo, s in sorted(ngo_summary.items(), key=lambda x: x[1]['total_allocated'], reverse=True):
            pct = round((s['rms_working'] / s['total_allocated'] * 100), 1) if s['total_allocated'] > 0 else 0.0
            summary_list.append({
                'ngo_name': ngo,
                'total_allocated': s['total_allocated'],
                'rms_working': s['rms_working'],
                'rms_not_working': s['rms_not_working'],
                'rms_inactive': s['rms_inactive'],
                'rms_not_installed': s['rms_not_installed'],
                'active_percentage': pct,
                'total_usage_hours': round(s['total_usage_hours'], 1),
                'associated_donors': sorted(list(s['donors']))
            })

        if format and format.lower() == 'csv':
            output = io.StringIO()
            if status_filter == 'not_working':
                writer = csv.DictWriter(output, fieldnames=[
                    'serial_number', 'ngo_name', 'rms_status', 'laptop_status',
                    'donor_company', 'manufacturer_model', 'processor', 'ram',
                    'condition_status', 'inventory_location', 'mac_address',
                    'rms_version', 'total_usage_minutes', 'last_rms_ping',
                    'last_delivery_date', 'last_updated_on'
                ])
                writer.writeheader()
                writer.writerows(not_working_devices)
                filename = "Laptops_RMS_Not_Working_Or_Missing_Report.csv"
            else:
                writer = csv.writer(output)
                writer.writerow([
                    'NGO_Name', 'Total_Laptops_Allocated', 'RMS_Working_Laptops',
                    'RMS_Not_Working_Laptops', 'RMS_Not_Installed_Laptops', 'RMS_Active_Percentage',
                    'Total_Usage_Hours', 'Associated_Donors'
                ])
                for s in summary_list:
                    writer.writerow([
                        s['ngo_name'], s['total_allocated'], s['rms_working'],
                        s['rms_not_working'], s['rms_not_installed'], f"{s['active_percentage']}%",
                        s['total_usage_hours'], "; ".join(s['associated_donors'])
                    ])
                filename = "NGO_RMS_Summary_Report.csv"

            return Response(
                content=output.getvalue(),
                media_type="text/csv",
                headers={"Content-Disposition": f'attachment; filename="{filename}"'}
            )

        total_allocated = sum(s['total_allocated'] for s in summary_list)
        total_working = sum(s['rms_working'] for s in summary_list)
        total_not_working = sum(s['rms_not_working'] for s in summary_list)
        overall_pct = round((total_working / total_allocated * 100), 1) if total_allocated > 0 else 0.0

        return {
            'totals': {
                'total_ngos': len(summary_list),
                'total_laptops_allocated': total_allocated,
                'total_rms_working': total_working,
                'total_rms_not_working': total_not_working,
                'overall_working_percentage': overall_pct
            },
            'summary': summary_list,
            'devices': matching_devices if target_ngo_clean else not_working_devices[:100]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
