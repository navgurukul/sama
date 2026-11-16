"""AFE inventory summary."""

from __future__ import annotations

from fastapi import APIRouter

from ...core.config import DONOR_TABLE
from ...core.db import DB_SCHEMA, get_conn

router = APIRouter()


@router.get("/api/afe/inventory-summary")
def get_afe_inventory_summary():
    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    f"""
                    SELECT ll.manufacturer_model, ll.status
                    FROM {DB_SCHEMA}.laptop_labeling ll
                    LEFT JOIN {DB_SCHEMA}.{DONOR_TABLE} d ON d.donor_id = ll.donor_id
                    WHERE UPPER(COALESCE(d.donor_company, ll.donor_company_name)) LIKE '%AMAZON%' 
                       OR UPPER(COALESCE(d.donor_company, ll.donor_company_name)) LIKE '%AFE%'
                    """
                )
                rows = cur.fetchall()
                
                summary = {
                    "Total Received": {"Macbook": 0, "Windows": 0, "Total": 0},
                    "Total Refurbished": {"Macbook": 0, "Windows": 0, "Total": 0},
                    "Total Distributed": {"Macbook": 0, "Windows": 0, "Total": 0},
                    "Current Stock": {"Macbook": 0, "Windows": 0, "Total": 0}
                }
                
                for r in rows:
                    model = str(r.get("manufacturer_model") or "").strip().lower()
                    status = str(r.get("status") or "").strip().upper()
                    
                    if "mac" in model:
                        brand = "Macbook"
                    else:
                        brand = "Windows"
                        
                    # Total Received
                    summary["Total Received"][brand] += 1
                    summary["Total Received"]["Total"] += 1
                    
                    # Refurbished (includes anything that has finished repair)
                    if status in ["READY", "QC_CHECK", "LAPTOP REFURBISHED", "ALLOCATED", "TO BE DISPATCH", "DISPATCHED", "DISTRIBUTION", "DISTRIBUTED", "POST_DEPLOYMENT_15D", "MONTHLY_MONITORING"]:
                        summary["Total Refurbished"][brand] += 1
                        summary["Total Refurbished"]["Total"] += 1
                        
                    # Dispatched / Distributed
                    if status in ["DISTRIBUTION", "DISTRIBUTED", "POST_DEPLOYMENT_15D", "MONTHLY_MONITORING"]:
                        summary["Total Distributed"][brand] += 1
                        summary["Total Distributed"]["Total"] += 1
                        
                # Mathematically calculate Current Stock = Total Received - Total Distributed
                for b in ["Macbook", "Windows", "Total"]:
                    summary["Current Stock"][b] = summary["Total Received"][b] - summary["Total Distributed"][b]
                        
                return {"status": "success", "data": summary}
    except Exception as e:
        return {"status": "error", "message": str(e)}
