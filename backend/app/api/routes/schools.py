"""School registry endpoints."""

from __future__ import annotations

import re
import uuid
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Body, Depends, Request
from starlette.concurrency import run_in_threadpool
from psycopg.rows import dict_row

from ...core.db import DB_SCHEMA, get_conn
from ...core.security import require, require_service_key

router = APIRouter()


@router.get("/api/schools", dependencies=[Depends(require("schools:read"))])
def get_schools(ngo_id: Optional[str] = None):
    try:
        with get_conn() as conn:
            with conn.cursor(row_factory=dict_row) as cur:
                # Ensure table exists
                cur.execute(f"""
                    CREATE TABLE IF NOT EXISTS {DB_SCHEMA}.schools (
                        id SERIAL PRIMARY KEY,
                        school_id VARCHAR(100) UNIQUE,
                        udise VARCHAR(100) UNIQUE,
                        name VARCHAR(255),
                        city VARCHAR(100),
                        partner_name VARCHAR(255),
                        ngo_id VARCHAR(100),
                        distribution_host_id VARCHAR(255),
                        zipcode VARCHAR(20),
                        state VARCHAR(100),
                        district VARCHAR(100),
                        district_code VARCHAR(100),
                        status VARCHAR(100),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                # Safe migration for new columns
                new_cols = {
                    "udise": "VARCHAR(100) UNIQUE",
                    "ngo_id": "VARCHAR(100)",
                    "distribution_host_id": "VARCHAR(255)",
                    "zipcode": "VARCHAR(20)",
                    "state": "VARCHAR(100)",
                    "district": "VARCHAR(100)",
                    "district_code": "VARCHAR(100)",
                    "status": "VARCHAR(100)"
                }
                # Check information_schema first: a failed ALTER would abort the transaction.
                cur.execute(f"SELECT column_name FROM information_schema.columns WHERE table_name='schools' AND table_schema='{DB_SCHEMA}'")
                existing_cols = {row['column_name'] for row in cur.fetchall()}
                for col, col_type in new_cols.items():
                    if col not in existing_cols:
                        cur.execute(f"ALTER TABLE {DB_SCHEMA}.schools ADD COLUMN {col} {col_type}")
                
                # Also ensure laptop_labeling has the rms columns since we query them here
                cur.execute(f"SELECT column_name FROM information_schema.columns WHERE table_name='laptop_labeling' AND table_schema='{DB_SCHEMA}'")
                ll_cols = {row['column_name'] for row in cur.fetchall()}
                if "rms_status" not in ll_cols:
                    cur.execute(f"ALTER TABLE {DB_SCHEMA}.laptop_labeling ADD COLUMN rms_status VARCHAR(50)")
                if "last_active_date" not in ll_cols:
                    cur.execute(f"ALTER TABLE {DB_SCHEMA}.laptop_labeling ADD COLUMN last_active_date TIMESTAMP")
                    
                cur.execute(f"ALTER TABLE {DB_SCHEMA}.schools DROP COLUMN IF EXISTS laptops_assigned")
                
                conn.commit()
                
                query = f"SELECT * FROM {DB_SCHEMA}.schools"
                params = []
                if ngo_id:
                    query += " WHERE ngo_id = %s OR partner_name = %s"
                    params.extend([ngo_id, ngo_id])
                
                query += " ORDER BY id DESC"
                cur.execute(query, params)
                rows = cur.fetchall()

                # Calculate analytics
                total_schools = len(rows)
                unique_ngos = len(set([r["partner_name"] for r in rows if r["partner_name"]]))
                total_laptops_verified = 0

                data = []
                for r in rows:
                    school_dict = dict(r)
                    cur.execute(f"""
                        SELECT COUNT(*) as count FROM {DB_SCHEMA}.laptop_labeling 
                        WHERE (LOWER(assigned_to) = LOWER(%s) OR LOWER(assigned_to) = LOWER(%s) OR LOWER(assigned_to) = LOWER(%s))
                          AND rms_status = 'ACTIVE'
                    """, (school_dict.get("name", ""), school_dict.get("school_id", ""), school_dict.get("udise", "")))
                    rms_count = cur.fetchone()["count"]
                    total_laptops_verified += rms_count
                    data.append(school_dict)

                analytics = {
                    "total_schools": total_schools,
                    "ngos_with_schools": unique_ngos,
                    "laptops_verified": total_laptops_verified
                }

                return {"status": "success", "analytics": analytics, "data": data}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.post("/api/schools", dependencies=[Depends(require("schools:write"))])
async def create_school(request: Request):
    try:
        data = await request.json()
    except Exception as e:
        return {"status": "error", "message": str(e)}
    return await run_in_threadpool(_create_school, data)


def _create_school(data: Any) -> Dict[str, Any]:
    try:
        school_id = data.get("school_id") or f"SCH-{uuid.uuid4().hex[:8].upper()}"
        udise = data.get("udise")
        name = data.get("name")
        city = data.get("city")
        partner_name = data.get("partner_name")
        ngo_id = data.get("ngo_id")
        distribution_host_id = "Sama Platform"
        zipcode = data.get("zipcode")
        state = data.get("state")
        district = data.get("district")
        district_code = data.get("district_code")
        status = data.get("status") or "ACTIVE"
        school_type = data.get("school_type") or "Government School"
        school_type_id = data.get("school_type_id") or 1

        if not name:
            return {"status": "error", "message": "School name is required"}

        with get_conn() as conn:
            with conn.cursor(row_factory=dict_row) as cur:
                cur.execute(f"""
                    INSERT INTO {DB_SCHEMA}.schools (
                        school_id, udise, name, city, partner_name, ngo_id,
                        distribution_host_id, zipcode, state, district, district_code, status,
                        school_type, school_type_id
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (school_id) DO UPDATE SET
                        udise = EXCLUDED.udise,
                        name = EXCLUDED.name,
                        city = EXCLUDED.city,
                        partner_name = EXCLUDED.partner_name,
                        ngo_id = EXCLUDED.ngo_id,
                        distribution_host_id = EXCLUDED.distribution_host_id,
                        zipcode = EXCLUDED.zipcode,
                        state = EXCLUDED.state,
                        district = EXCLUDED.district,
                        district_code = EXCLUDED.district_code,
                        status = EXCLUDED.status,
                        school_type = EXCLUDED.school_type,
                        school_type_id = EXCLUDED.school_type_id
                    RETURNING *
                """, (school_id, udise, name, city, partner_name, ngo_id, distribution_host_id, zipcode, state, district, district_code, status, school_type, school_type_id))
                conn.commit()
                return {"status": "success", "message": "School added/updated successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.post("/api/schools/bulk", dependencies=[Depends(require("schools:write"))])
def upload_schools_bulk(data: List[Dict[str, Any]] = Body(...)):
    try:
        import uuid
        with get_conn() as conn:
            with conn.cursor(row_factory=dict_row) as cur:
                # Group by NGO ID to fetch counts efficiently
                ngo_counts = {}
                for row in data:
                    ngo_id = row.get("ngo_id")
                    if ngo_id and ngo_id not in ngo_counts:
                        cur.execute(f"SELECT COUNT(*) as count FROM {DB_SCHEMA}.schools WHERE ngo_id = %s", (ngo_id,))
                        res = cur.fetchone()
                        ngo_counts[ngo_id] = res['count'] if res else 0

                for row in data:
                    udise = row.get("udise")
                    ngo_id = row.get("ngo_id")
                    
                    if ngo_id:
                        # Extract numeric part from NGO ID (e.g. SAM-130 -> 130)
                        import re
                        nums = re.findall(r'\d+', ngo_id)
                        ngo_prefix = nums[0] if nums else "00"
                        ngo_counts[ngo_id] += 1
                        default_school_id = f"SCH-{ngo_prefix}{ngo_counts[ngo_id]}"
                    else:
                        import random
                        default_school_id = f"SCH-{random.randint(10000, 99999)}"
                        
                    school_id = row.get("school_id") or default_school_id
                    name = row.get("name")
                    city = row.get("city")
                    partner_name = row.get("partner_name")
                    ngo_id = row.get("ngo_id")
                    distribution_host_id = "Sama Platform"
                    zipcode = row.get("zipcode")
                    state = row.get("state")
                    district = row.get("district")
                    district_code = row.get("district_code")
                    status = row.get("status") or "ACTIVE"
                    school_type = row.get("school_type") or "Government School"
                    school_type_id = row.get("school_type_id") or 1
                    
                    if not name:
                        continue
                        
                    cur.execute(f"""
                        INSERT INTO {DB_SCHEMA}.schools (
                            school_id, udise, name, city, partner_name, ngo_id,
                            distribution_host_id, zipcode, state, district, district_code, status,
                            school_type, school_type_id
                        )
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (udise) DO UPDATE SET 
                            name = EXCLUDED.name, 
                            city = EXCLUDED.city, 
                            partner_name = EXCLUDED.partner_name,
                            ngo_id = EXCLUDED.ngo_id,
                            distribution_host_id = EXCLUDED.distribution_host_id,
                            zipcode = EXCLUDED.zipcode,
                            state = EXCLUDED.state,
                            district = EXCLUDED.district,
                            district_code = EXCLUDED.district_code,
                            status = EXCLUDED.status,
                            school_type = EXCLUDED.school_type,
                            school_type_id = EXCLUDED.school_type_id
                    """, (school_id, udise, name, city, partner_name, ngo_id, distribution_host_id, zipcode, state, district, district_code, status, school_type, school_type_id))
                    
                conn.commit()
                return {"status": "success", "message": "Bulk upload successful"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.get("/api/schools/udise-map", dependencies=[Depends(require_service_key("RMS_API_KEY"))])
def get_schools_udise_map():
    try:
        with get_conn() as conn:
            with conn.cursor(row_factory=dict_row) as cur:
                # Get ALL columns for ALL schools
                cur.execute(f"SELECT * FROM {DB_SCHEMA}.schools WHERE udise IS NOT NULL")
                schools = cur.fetchall()
                
                # Organize them into a dictionary by UDISE code
                udise_map = {}
                for school in schools:
                    udise_map[school["udise"]] = school
                    
                return {"status": "success", "data": udise_map}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.get("/api/schools/udise-map/{udise}", dependencies=[Depends(require_service_key("RMS_API_KEY"))])
def get_school_by_udise(udise: str):
    try:
        with get_conn() as conn:
            with conn.cursor(row_factory=dict_row) as cur:
                cur.execute(f"SELECT * FROM {DB_SCHEMA}.schools WHERE udise = %s", (udise,))
                row = cur.fetchone()
                if not row:
                    return {"status": "error", "message": "School with this UDISE code not found"}
                    
                return {"status": "Ok", "data": dict(row)}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.get("/api/schools/{school_id}", dependencies=[Depends(require_service_key("RMS_API_KEY"))])
def get_school_details(school_id: str):
    # Called by the RMS server; protected by RMS_API_KEY once that is configured.
    try:
        with get_conn() as conn:
            with conn.cursor(row_factory=dict_row) as cur:
                cur.execute(f"SELECT * FROM {DB_SCHEMA}.schools WHERE school_id = %s", (school_id,))
                row = cur.fetchone()
                if not row:
                    return {"status": "error", "message": "School not found"}
                    
                return {"status": "success", "data": dict(row)}
    except Exception as e:
        return {"status": "error", "message": str(e)}
