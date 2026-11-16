"""Approved NGO directory."""

from __future__ import annotations

from fastapi import APIRouter
from psycopg.rows import dict_row

from ...core.db import DB_SCHEMA, get_conn

router = APIRouter()


@router.get("/api/ngos")
def get_approved_ngos(filter: str = None):
    try:
        with get_conn() as conn:
            with conn.cursor(row_factory=dict_row) as cur:
                cur.execute(f"""
                    SELECT id, organization_name 
                    FROM {DB_SCHEMA}.external_registered_ngo 
                    WHERE UPPER(status) IN ('APPROVED', 'DISPATCHED', 'DELIVERED')
                    ORDER BY organization_name
                """)
                ngos = cur.fetchall()
                
                cur.execute(f"""
                    SELECT school_id, udise, name, city, partner_name, ngo_id, distribution_host_id, zipcode, state, district, district_code
                    FROM {DB_SCHEMA}.schools
                    WHERE ngo_id IS NOT NULL
                """)
                schools = cur.fetchall()
                
                schools_by_ngo = {}
                for s in schools:
                    nid = s["ngo_id"]
                    if nid not in schools_by_ngo:
                        schools_by_ngo[nid] = []
                    schools_by_ngo[nid].append(s)
                
                for ngo in ngos:
                    ngo["schools"] = schools_by_ngo.get(ngo["id"], [])
                    
                if filter == "schools":
                    filtered_ngos = []
                    for ngo in ngos:
                        if len(ngo["schools"]) > 0:
                            filtered_ngos.append(ngo)
                    return {"status": "success", "data": filtered_ngos}
                    
                return {"status": "success", "data": ngos}
    except Exception as e:
        return {"status": "error", "message": str(e)}
