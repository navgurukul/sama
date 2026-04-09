from __future__ import annotations

import os
from typing import Any, Dict, List, Optional

import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

from .db import DB_SCHEMA, get_conn


LEGACY_LAPTOP_API_URL = os.getenv("LEGACY_LAPTOP_API_URL", "").strip()
USER_PROFILE_TABLE_PREFIX = os.getenv("USER_PROFILE_TABLE_PREFIX", "user_profile").strip() or "user_profile"
USER_REGISTRATION_TABLE = f"{USER_PROFILE_TABLE_PREFIX}_registration"
USER_ROLE_TABLE = f"{USER_PROFILE_TABLE_PREFIX}_userrole"

app = FastAPI(title="Sama Laptop Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


MIGRATED_TYPES = {
    "getLaptopData",
    "getUserData",
    "getpre",
    "pickupget",
    "audit",
    "UpdateLaptopComment",
    "updatepickupstatus",
    "assign",
    "laptopLabeling",
    "userdetails",
    "editUser",
    "deleteUser",
}


def _type_from_request(request: Request, body: Optional[Dict[str, Any]]) -> Optional[str]:
    q_type = request.query_params.get("type")
    if q_type:
        return q_type
    if body and isinstance(body.get("type"), str):
        return body["type"]
    return None


def _as_iso(value: Any) -> Any:
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return value


def _normalize_rows(rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    for row in rows:
        out.append({k: _as_iso(v) for k, v in row.items()})
    return out


def _payload_get(payload: Dict[str, Any], *keys: str) -> Any:
    for key in keys:
        if key in payload and payload.get(key) is not None:
            return payload.get(key)
    return None


LAPTOP_SELECT_MAP = {
    "ID": 'id AS "ID"',
    "Date Committed": 'date_committed AS "Date Committed"',
    "Donor Company Name": 'donor_company_name AS "Donor Company Name"',
    "RAM": 'ram AS "RAM"',
    "ROM": 'rom AS "ROM"',
    "Manufacturer Model": 'manufacturer_model AS "Manufacturer Model"',
    "Processor": 'processor AS "Processor"',
    "Manufacturing Date": 'manufacturing_date AS "Manufacturing Date"',
    "Condition Status": 'condition_status AS "Condition Status"',
    "Minor Issues": 'minor_issues AS "Minor Issues"',
    "Major Issues": 'major_issues AS "Major Issues"',
    "Other Issues": 'other_issues AS "Other Issues"',
    "Inventory Location": 'inventory_location AS "Inventory Location"',
    "laptop weight": 'laptop_weight AS "laptop weight"',
    "Mac address": 'mac_address AS "Mac address"',
    "Status": 'status AS "Status"',
    "Working": 'working AS "Working"',
    "Battery Capacity": 'battery_capacity AS "Battery Capacity"',
    "Allocated To": 'allocated_to AS "Allocated To"',
    "Last Updated On": 'last_updated_on AS "Last Updated On"',
    "Last Updated By": 'last_updated_by AS "Last Updated By"',
    "Assigned To": 'assigned_to AS "Assigned To"',
    "Comment for the Issues": 'comment_for_issues AS "Comment for the Issues"',
    "Inspection Files": 'inspection_files AS "Inspection Files"',
    "ActvityWatch PDF": 'activitywatch_pdf AS "ActvityWatch PDF"',
    "Date": 'activity_date AS "Date"',
    "AFK Time": 'afk_time AS "AFK Time"',
    "Usage Hours": 'usage_hours AS "Usage Hours"',
    "Off Times": 'off_times AS "Off Times"',
    "Last Delivery Date": 'last_delivery_date AS "Last Delivery Date"',
    "Refurbishment Date": 'refurbishment_date AS "Refurbishment Date"',
    "Batch": 'batch AS "Batch"',
}


def _parse_requested_fields(raw_fields: Optional[str]) -> List[str]:
    if not raw_fields:
        return list(LAPTOP_SELECT_MAP.keys())
    requested = [f.strip() for f in raw_fields.split(",") if f.strip()]
    selected = [f for f in requested if f in LAPTOP_SELECT_MAP]
    if not selected:
        return list(LAPTOP_SELECT_MAP.keys())
    if "ID" not in selected:
        selected.insert(0, "ID")
    return selected


def _query_laptops(request: Request) -> Any:
    id_query = request.query_params.get("idQuery")
    mac_query = request.query_params.get("macQuery")
    assign_query = request.query_params.get("assignQuery")
    working_filter = request.query_params.get("workingFilter")
    status_filter = request.query_params.get("statusFilter")
    major_issue_filter = request.query_params.get("majorIssueFilter")
    minor_issue_filter = request.query_params.get("minorIssueFilter")
    allocated_to_filter = request.query_params.get("allocatedToFilter")
    include_meta = request.query_params.get("includeMeta") == "1"
    fields = _parse_requested_fields(request.query_params.get("fields"))

    page_raw = request.query_params.get("page")
    limit_raw = request.query_params.get("limit")
    page = int(page_raw) if page_raw and page_raw.isdigit() else None
    limit = int(limit_raw) if limit_raw and limit_raw.isdigit() else None
    max_limit_raw = os.getenv("LAPTOP_QUERY_MAX_LIMIT", "0")
    max_limit = int(max_limit_raw) if max_limit_raw.isdigit() else 0
    if limit and max_limit > 0:
        limit = min(limit, max_limit)
    offset = ((page - 1) * limit) if page and limit else 0

    where_sql = ["1=1"]
    params: List[Any] = []

    if id_query:
        where_sql.append("(id = %s OR id ILIKE %s)")
        params.extend([id_query, f"%{id_query}%"])
    if mac_query:
        where_sql.append("(mac_address = %s OR mac_address ILIKE %s)")
        params.extend([mac_query, f"%{mac_query}%"])
    if assign_query:
        where_sql.append("assigned_to ILIKE %s")
        params.append(f"%{assign_query}%")
    if working_filter and working_filter.lower() != "all":
        where_sql.append("working = %s")
        params.append(working_filter)
    if status_filter and status_filter.lower() != "all":
        where_sql.append("status = %s")
        params.append(status_filter)
    if major_issue_filter and major_issue_filter.lower() != "all":
        where_sql.append("major_issues ILIKE %s")
        params.append(f"%{major_issue_filter}%")
    if minor_issue_filter and minor_issue_filter.lower() != "all":
        where_sql.append("minor_issues ILIKE %s")
        params.append(f"%{minor_issue_filter}%")
    if allocated_to_filter:
        where_sql.append("allocated_to = %s")
        params.append(allocated_to_filter)

    where_clause = " AND ".join(where_sql)
    select_expr = ",\n            ".join(LAPTOP_SELECT_MAP[f] for f in fields)

    sql = f"""
        SELECT
            {select_expr}
        FROM {DB_SCHEMA}.laptop_labeling
        WHERE {where_clause}
        ORDER BY last_updated_on DESC NULLS LAST, id
    """

    count_mode = include_meta
    if count_mode:
        sql = f"""
        SELECT
            {select_expr},
            count(*) OVER() AS "__total"
        FROM {DB_SCHEMA}.laptop_labeling
        WHERE {where_clause}
        ORDER BY last_updated_on DESC NULLS LAST, id
        """

    if limit:
        sql += " LIMIT %s OFFSET %s"
        params.extend([limit, offset])

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            raw_rows = cur.fetchall()

            if not include_meta:
                return _normalize_rows(raw_rows)

            total = 0
            if raw_rows:
                total = int(raw_rows[0].get("__total", 0) or 0)
                for row in raw_rows:
                    row.pop("__total", None)

            rows = _normalize_rows(raw_rows)

    return {
        "data": rows,
        "meta": {
            "total": total,
            "page": page or 1,
            "limit": limit or len(rows),
        },
    }


def _query_users(request: Request) -> List[Dict[str, Any]]:
    user_id_query = request.query_params.get("userIdQuery")

    where_sql = ["1=1"]
    params: List[Any] = []

    if user_id_query:
        where_sql.append("(id::text ILIKE %s OR email ILIKE %s OR contact_number ILIKE %s)")
        q = f"%{user_id_query}%"
        params.extend([q, q, q])

    sql = f"""
        SELECT
            id AS "ID",
            ngo AS "Ngo",
            name AS "name",
            email AS "email",
            contact_number AS "contact number",
            address AS "Address",
            address_state AS "Address State",
            id_proof_type AS "ID Proof type",
            id_proof_number AS "ID Proof number",
            qualification AS "Qualification",
            occupation AS "Occupation",
            date_of_birth AS "Date Of Birth",
            use_case AS "Use case",
            family_members_count AS "Number of Family members(who might use the laptop)",
            guardian_occupation AS "Father/Mother/Guardians Occupation",
            family_annual_income AS "Family Annual Income",
            status AS "status",
            laptop_assigned AS "Laptop Assigned",
            id_link AS "ID Link",
            income_certificate_link AS "Income Certificate Link",
            date_time AS "Date-time",
            doner AS "Doner"
        FROM {DB_SCHEMA}.userdetails
        WHERE {' AND '.join(where_sql)}
        ORDER BY id
    """

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            return _normalize_rows(cur.fetchall())


def _query_preliminary(request: Request) -> List[Dict[str, Any]]:
    pre_id = request.query_params.get("id")

    sql = f"""
        SELECT
            id AS "Id",
            ngoid AS "NgoId",
            number_of_school AS "Number of school",
            number_of_teacher AS "Number of teacher",
            number_of_student AS "Number of student",
            number_of_female_student AS "Number of Female student",
            states AS "States",
            course AS "Course",
            unit AS "Unit",
            doner AS "Doner",
            request_type AS "requestType",
            ngo_prelim_requests AS "NGOPrelimRequests"
        FROM {DB_SCHEMA}.preliminary
    """
    params: List[Any] = []
    if pre_id and pre_id.isdigit():
        sql += " WHERE id=%s"
        params.append(int(pre_id))
    sql += " ORDER BY id DESC"

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            return _normalize_rows(cur.fetchall())


def _query_pickups() -> Dict[str, Any]:
    sql = f"""
        SELECT
            pickup_id AS "Pickup ID",
            donor_company AS "Donor Company",
            poc_name AS "POC Name",
            poc_contact AS "POC Contact",
            poc_email AS "POC Email",
            number_of_laptops AS "Number of Laptops",
            pickup_location AS "Pickup Location",
            pickup_by AS "Pickup By",
            current_date_time AS "Current Date & Time",
            status AS "Status",
            confirm_pickup_date AS "Confirm Pickup Date",
            updated_on AS "Updated On",
            updated_by AS "Updated By"
        FROM {DB_SCHEMA}.pickup
        ORDER BY current_date_time DESC NULLS LAST
    """

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql)
            rows = _normalize_rows(cur.fetchall())

    total = sum((r.get("Number of Laptops") or 0) for r in rows)
    return {"status": "success", "data": rows, "totalLaptops": total}


def _query_audit(request: Request) -> Any:
    laptop_id = request.query_params.get("id")
    id_query = request.query_params.get("idQuery")
    include_meta = request.query_params.get("includeMeta") == "1"

    page_raw = request.query_params.get("page")
    limit_raw = request.query_params.get("limit")
    page = int(page_raw) if page_raw and page_raw.isdigit() else None
    limit = int(limit_raw) if limit_raw and limit_raw.isdigit() else None
    max_limit_raw = os.getenv("AUDIT_QUERY_MAX_LIMIT", "0")
    max_limit = int(max_limit_raw) if max_limit_raw.isdigit() else 0
    if limit and max_limit > 0:
        limit = min(limit, max_limit)
    offset = ((page - 1) * limit) if page and limit else 0

    sql = f"""
        SELECT
            id AS "ID",
            field AS "Field",
            from_value AS "From",
            to_value AS "To",
            updated_by AS "Updated By",
            updated_on AS "Updated On"
        FROM {DB_SCHEMA}.audit_for_laptops
    """
    params: List[Any] = []
    where_sql = ["1=1"]

    if laptop_id:
        where_sql.append("id = %s")
        params.append(laptop_id)
    if id_query:
        where_sql.append("id ILIKE %s")
        params.append(f"%{id_query}%")

    sql += f" WHERE {' AND '.join(where_sql)}"

    if include_meta:
        sql = f"""
        SELECT
            id AS "ID",
            field AS "Field",
            from_value AS "From",
            to_value AS "To",
            updated_by AS "Updated By",
            updated_on AS "Updated On",
            count(*) OVER() AS "__total"
        FROM {DB_SCHEMA}.audit_for_laptops
        WHERE {' AND '.join(where_sql)}
        """

    sql += " ORDER BY updated_on DESC NULLS LAST"

    if limit:
        sql += " LIMIT %s OFFSET %s"
        params.extend([limit, offset])

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            raw_rows = cur.fetchall()
            if not include_meta:
                return _normalize_rows(raw_rows)

            total = 0
            if raw_rows:
                total = int(raw_rows[0].get("__total", 0) or 0)
                for row in raw_rows:
                    row.pop("__total", None)

            rows = _normalize_rows(raw_rows)
            return {
                "data": rows,
                "meta": {
                    "total": total,
                    "page": page or 1,
                    "limit": limit or len(rows),
                },
            }


def _query_user_registration() -> List[Dict[str, Any]]:
    sql = f'''
        SELECT
            name AS "Name",
            email AS "Email",
            password AS "Password",
            status AS "Status",
            role AS "Role",
            reason AS "Reason"
        FROM {DB_SCHEMA}.{USER_REGISTRATION_TABLE}
        ORDER BY name NULLS LAST, email
    '''
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql)
            return _normalize_rows(cur.fetchall())


def _query_user_login_data() -> List[Dict[str, Any]]:
    sql = f'''
        WITH approved_registration AS (
            SELECT
                r.name,
                r.email,
                r.password,
                r.role,
                ''::text AS ngo_id,
                ''::text AS type,
                ''::text AS doner
            FROM {DB_SCHEMA}.{USER_REGISTRATION_TABLE} r
            WHERE lower(coalesce(r.status, '')) = 'approved'
              AND coalesce(r.role, '') <> ''
              AND NOT EXISTS (
                  SELECT 1
                  FROM {DB_SCHEMA}.{USER_ROLE_TABLE} u
                  WHERE lower(u.email) = lower(r.email)
              )
        )
        SELECT
            t.name AS "Name",
            t.email AS "Email",
            t.password AS "Password",
            t.role AS "Role",
            t.ngo_id AS "Ngo Id",
            t.type AS "Type",
            t.doner AS "Doner"
        FROM (
            SELECT
                u.name,
                u.email,
                u.password,
                u.role,
                u.ngo_id,
                u.type,
                u.doner
            FROM {DB_SCHEMA}.{USER_ROLE_TABLE} u
            UNION ALL
            SELECT * FROM approved_registration
        ) t
        WHERE coalesce(t.email, '') <> ''
    '''
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql)
            return _normalize_rows(cur.fetchall())


def _handle_user_post_type(payload: Dict[str, Any]) -> Dict[str, Any]:
    type_name = payload.get("type")

    with get_conn() as conn:
        with conn.cursor() as cur:
            if type_name == "addRegistration":
                email = (payload.get("Email") or payload.get("email") or "").strip()
                name = (payload.get("Name") or payload.get("name") or "").strip()
                password = payload.get("Password") or payload.get("password")
                status = payload.get("status") or "Data entered"

                if not email or not name or not password:
                    raise HTTPException(status_code=400, detail="Name, Email, Password are required")

                cur.execute(
                    f"""
                    SELECT 1
                    FROM {DB_SCHEMA}.{USER_REGISTRATION_TABLE}
                    WHERE lower(email) = lower(%s)
                    LIMIT 1
                    """,
                    (email,),
                )
                exists_in_registration = cur.fetchone() is not None

                cur.execute(
                    f"""
                    SELECT 1
                    FROM {DB_SCHEMA}.{USER_ROLE_TABLE}
                    WHERE lower(email) = lower(%s)
                    LIMIT 1
                    """,
                    (email,),
                )
                exists_in_roles = cur.fetchone() is not None

                if exists_in_registration or exists_in_roles:
                    raise HTTPException(status_code=409, detail="Email already exists")

                cur.execute(
                    f"""
                    INSERT INTO {DB_SCHEMA}.{USER_REGISTRATION_TABLE}
                    (name, email, password, status, role, reason)
                    VALUES (%s, %s, %s, %s, '', '')
                    """,
                    (name, email, password, status),
                )
                conn.commit()
                return {"status": "success", "type": type_name}

            if type_name == "updateRegistration":
                email = (payload.get("email") or payload.get("Email") or "").strip()
                status = payload.get("status")
                role = payload.get("role")
                reason = payload.get("reason") or ""

                if not email:
                    raise HTTPException(status_code=400, detail="email is required")

                cur.execute(
                    f"""
                    UPDATE {DB_SCHEMA}.{USER_REGISTRATION_TABLE}
                    SET status = %s,
                        role = %s,
                        reason = %s
                    WHERE lower(email) = lower(%s)
                    """,
                    (status, role, reason, email),
                )

                if (status or "").lower() == "approved" and (role or "") != "":
                    cur.execute(
                        f"""
                        SELECT name, email, password, role
                        FROM {DB_SCHEMA}.{USER_REGISTRATION_TABLE}
                        WHERE lower(email) = lower(%s)
                        LIMIT 1
                        """,
                        (email,),
                    )
                    reg_row = cur.fetchone()
                    if reg_row:
                        cur.execute(
                            f"""
                            SELECT ngo_id, type, doner
                            FROM {DB_SCHEMA}.{USER_ROLE_TABLE}
                            WHERE lower(email) = lower(%s)
                            LIMIT 1
                            """,
                            (email,),
                        )
                        existing = cur.fetchone()
                        ngo_id = (existing or {}).get("ngo_id") if isinstance(existing, dict) else None
                        ngo_type = (existing or {}).get("type") if isinstance(existing, dict) else None
                        doner = (existing or {}).get("doner") if isinstance(existing, dict) else None

                        cur.execute(
                            f"DELETE FROM {DB_SCHEMA}.{USER_ROLE_TABLE} WHERE lower(email) = lower(%s)",
                            (email,),
                        )
                        cur.execute(
                            f"""
                            INSERT INTO {DB_SCHEMA}.{USER_ROLE_TABLE}
                            (name, email, password, role, ngo_id, type, doner)
                            VALUES (%s, %s, %s, %s, %s, %s, %s)
                            """,
                            (
                                reg_row.get("name"),
                                reg_row.get("email"),
                                reg_row.get("password"),
                                reg_row.get("role"),
                                ngo_id or "",
                                ngo_type or "",
                                doner or "",
                            ),
                        )
                elif (status or "").lower() == "reject":
                    cur.execute(
                        f"DELETE FROM {DB_SCHEMA}.{USER_ROLE_TABLE} WHERE lower(email) = lower(%s)",
                        (email,),
                    )

                conn.commit()
                return {"status": "success", "type": type_name}

            if type_name == "forgotPassword":
                email = (payload.get("email") or payload.get("Email") or "").strip()
                if not email:
                    raise HTTPException(status_code=400, detail="email is required")
                # Kept intentionally simple: frontend only needs success acknowledgment.
                return {"status": "success", "type": type_name}

    raise HTTPException(status_code=501, detail=f"type '{type_name}' not implemented in user backend")


def _handle_post_type(payload: Dict[str, Any]) -> Dict[str, Any]:
    type_name = payload.get("type")

    with get_conn() as conn:
        with conn.cursor() as cur:
            if type_name == "UpdateLaptopComment":
                cur.execute(
                    f"""
                    UPDATE {DB_SCHEMA}.laptop_labeling
                    SET comment_for_issues=%s,
                        last_updated_by=%s,
                        last_updated_on=now()
                    WHERE id=%s
                    """,
                    (
                        payload.get("commentForIssues") or payload.get("comment") or "",
                        payload.get("lastUpdatedBy") or payload.get("updatedBy") or "system",
                        payload.get("id") or payload.get("ID"),
                    ),
                )
                conn.commit()
                return {"status": "success", "type": type_name}

            if type_name == "updatepickupstatus":
                cur.execute(
                    f"""
                    UPDATE {DB_SCHEMA}.pickup
                    SET status=%s,
                        confirm_pickup_date=%s,
                        updated_by=%s,
                        updated_on=now()
                    WHERE pickup_id=%s
                    """,
                    (
                        payload.get("status"),
                        payload.get("confirmPickupDate") or None,
                        payload.get("updatedBy") or "system",
                        payload.get("pickupId"),
                    ),
                )
                conn.commit()
                return {"status": "success", "type": type_name}

            if type_name == "assign":
                laptop_id = payload.get("laptopId")
                user_id = payload.get("userId")
                issued_date = payload.get("issuedDate")
                cur.execute(
                    f"INSERT INTO {DB_SCHEMA}.laptop_user_map (laptop_id, user_id, issued_date) VALUES (%s, %s, %s)",
                    (laptop_id, user_id, issued_date),
                )
                cur.execute(
                    f"UPDATE {DB_SCHEMA}.laptop_labeling SET status='Laptop Assigned', allocated_to='Beneficiary', last_updated_on=now() WHERE id=%s",
                    (laptop_id,),
                )
                cur.execute(
                    f"UPDATE {DB_SCHEMA}.userdetails SET laptop_assigned=%s WHERE id=%s",
                    (laptop_id, user_id),
                )
                conn.commit()
                return {"status": "success", "type": type_name}

            if type_name == "laptopLabeling":
                laptop_id = _payload_get(payload, "id", "ID")
                minor_issues = _payload_get(payload, "minorIssues", "minorIssue", "Minor Issues")
                major_issues = _payload_get(payload, "majorIssues", "majorIssue", "Major Issues")

                if isinstance(minor_issues, list):
                    minor_issues = ", ".join(str(v).strip() for v in minor_issues if str(v).strip())
                if isinstance(major_issues, list):
                    major_issues = ", ".join(str(v).strip() for v in major_issues if str(v).strip())

                donated_to = _payload_get(payload, "donatedTo", "allocatedTo", "Allocated To")
                other_issues = _payload_get(payload, "others", "otherIssues", "Other Issues")
                status_value = _payload_get(payload, "status", "Status") or "Pickup Requested"

                cur.execute(
                    f"""
                    INSERT INTO {DB_SCHEMA}.laptop_labeling
                    (id, donor_company_name, ram, rom, manufacturer_model, processor, manufacturing_date,
                     condition_status, minor_issues, major_issues, inventory_location, laptop_weight,
                     other_issues, mac_address, battery_capacity, batch, status, working,
                     allocated_to, assigned_to, comment_for_issues, last_updated_by, last_updated_on)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, now())
                    ON CONFLICT (id) DO UPDATE SET
                      donor_company_name=EXCLUDED.donor_company_name,
                      ram=EXCLUDED.ram,
                      rom=EXCLUDED.rom,
                      manufacturer_model=EXCLUDED.manufacturer_model,
                      processor=EXCLUDED.processor,
                      manufacturing_date=EXCLUDED.manufacturing_date,
                      condition_status=EXCLUDED.condition_status,
                      minor_issues=EXCLUDED.minor_issues,
                      major_issues=EXCLUDED.major_issues,
                      inventory_location=EXCLUDED.inventory_location,
                      laptop_weight=EXCLUDED.laptop_weight,
                      other_issues=EXCLUDED.other_issues,
                      mac_address=EXCLUDED.mac_address,
                      battery_capacity=EXCLUDED.battery_capacity,
                      batch=EXCLUDED.batch,
                                            status=EXCLUDED.status,
                                            working=EXCLUDED.working,
                                            allocated_to=EXCLUDED.allocated_to,
                                            assigned_to=EXCLUDED.assigned_to,
                                            comment_for_issues=EXCLUDED.comment_for_issues,
                                            last_updated_by=EXCLUDED.last_updated_by,
                      last_updated_on=now()
                    """,
                    (
                                                laptop_id,
                                                _payload_get(payload, "donorCompanyName", "Donor Company Name"),
                                                _payload_get(payload, "ram", "RAM"),
                                                _payload_get(payload, "rom", "ROM"),
                                                _payload_get(payload, "manufacturerModel", "Manufacturer Model"),
                                                _payload_get(payload, "processor", "Processor"),
                                                _payload_get(payload, "manufacturingDate", "Manufacturing Date") or None,
                                                _payload_get(payload, "conditionStatus", "Condition Status"),
                                                minor_issues,
                                                major_issues,
                                                _payload_get(payload, "inventoryLocation", "Inventory Location"),
                                                _payload_get(payload, "laptopWeight", "laptop weight"),
                                                other_issues,
                                                _payload_get(payload, "macAddress", "Mac address"),
                                                _payload_get(payload, "batteryCapacity", "Battery Capacity"),
                                                _payload_get(payload, "batch", "Batch"),
                                                status_value,
                                                _payload_get(payload, "working", "Working"),
                                                donated_to,
                                                _payload_get(payload, "assignedTo", "Assigned To"),
                                                _payload_get(payload, "comment", "commentForIssues", "Comment for the Issues"),
                                                _payload_get(payload, "lastUpdatedBy", "updatedBy", "Last Updated By", "last_updated_by") or "system",
                    ),
                )
                conn.commit()
                return {"status": "success", "type": type_name}

            if type_name in {"userdetails", "editUser"}:
                user_id = payload.get("id") or payload.get("ID")
                if user_id is None:
                    raise HTTPException(status_code=400, detail="id is required for userdetails/editUser")
                cur.execute(
                    f"""
                    INSERT INTO {DB_SCHEMA}.userdetails
                    (id, ngo, name, email, contact_number, address, address_state, id_proof_type,
                     id_proof_number, qualification, occupation, date_of_birth, use_case,
                     family_members_count, guardian_occupation, family_annual_income, status,
                     laptop_assigned, id_link, income_certificate_link, date_time, doner)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, now(), %s)
                    ON CONFLICT (id) DO UPDATE SET
                      ngo=EXCLUDED.ngo,
                      name=EXCLUDED.name,
                      email=EXCLUDED.email,
                      contact_number=EXCLUDED.contact_number,
                      address=EXCLUDED.address,
                      address_state=EXCLUDED.address_state,
                      id_proof_type=EXCLUDED.id_proof_type,
                      id_proof_number=EXCLUDED.id_proof_number,
                      qualification=EXCLUDED.qualification,
                      occupation=EXCLUDED.occupation,
                      date_of_birth=EXCLUDED.date_of_birth,
                      use_case=EXCLUDED.use_case,
                      family_members_count=EXCLUDED.family_members_count,
                      guardian_occupation=EXCLUDED.guardian_occupation,
                      family_annual_income=EXCLUDED.family_annual_income,
                      status=EXCLUDED.status,
                      laptop_assigned=EXCLUDED.laptop_assigned,
                      id_link=EXCLUDED.id_link,
                      income_certificate_link=EXCLUDED.income_certificate_link,
                      doner=EXCLUDED.doner,
                      date_time=now()
                    """,
                    (
                        user_id,
                        payload.get("ngo") or payload.get("Ngo"),
                        payload.get("name"),
                        payload.get("email"),
                        payload.get("contact number") or payload.get("contactNumber"),
                        payload.get("Address") or payload.get("address"),
                        payload.get("Address State") or payload.get("addressState"),
                        payload.get("ID Proof type") or payload.get("idProofType"),
                        payload.get("ID Proof number") or payload.get("idProofNumber"),
                        payload.get("Qualification") or payload.get("qualification"),
                        payload.get("Occupation") or payload.get("occupation"),
                        payload.get("Date Of Birth") or payload.get("dateOfBirth") or None,
                        payload.get("Use case") or payload.get("useCase"),
                        payload.get("Number of Family members(who might use the laptop)") or payload.get("familyMembersCount"),
                        payload.get("Father/Mother/Guardians Occupation") or payload.get("guardianOccupation"),
                        payload.get("Family Annual Income") or payload.get("familyAnnualIncome"),
                        payload.get("status"),
                        payload.get("Laptop Assigned") or payload.get("laptopAssigned"),
                        payload.get("ID Link") or payload.get("idLink"),
                        payload.get("Income Certificate Link") or payload.get("incomeCertificateLink"),
                        payload.get("Doner") or payload.get("doner"),
                    ),
                )
                conn.commit()
                return {"status": "success", "type": type_name}

            if type_name == "deleteUser":
                cur.execute(
                    f"DELETE FROM {DB_SCHEMA}.userdetails WHERE id=%s",
                    (payload.get("id") or payload.get("ID"),),
                )
                conn.commit()
                return {"status": "success", "type": type_name}

    raise HTTPException(status_code=501, detail=f"type '{type_name}' not implemented in RDS backend")


def _proxy_to_legacy(method: str, request: Request, payload: Optional[Dict[str, Any]]) -> Any:
    if not LEGACY_LAPTOP_API_URL:
        raise HTTPException(
            status_code=501,
            detail="Type is not migrated and LEGACY_LAPTOP_API_URL is not configured",
        )

    params = dict(request.query_params)
    timeout = httpx.Timeout(30.0)
    with httpx.Client(timeout=timeout) as client:
        if method == "GET":
            response = client.get(LEGACY_LAPTOP_API_URL, params=params)
        else:
            response = client.post(LEGACY_LAPTOP_API_URL, params=params, json=payload or {})

    content_type = response.headers.get("content-type", "")
    if "application/json" in content_type:
        return response.json()
    return {"status": "proxied", "raw": response.text}


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.get("/exec")
def exec_get(request: Request) -> Any:
    type_name = _type_from_request(request, None)
    if not type_name:
        raise HTTPException(status_code=400, detail="Missing 'type' query parameter")

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

    return _proxy_to_legacy("GET", request, None)


@app.post("/exec")
async def exec_post(request: Request) -> Any:
    try:
        payload = await request.json()
        if not isinstance(payload, dict):
            payload = {}
    except Exception:
        payload = {}

    type_name = _type_from_request(request, payload)
    if not type_name:
        raise HTTPException(status_code=400, detail="Missing 'type' in query or JSON body")

    if type_name in MIGRATED_TYPES:
        return _handle_post_type(payload)

    return _proxy_to_legacy("POST", request, payload)


@app.get("/user-exec")
def user_exec_get(request: Request) -> Any:
    type_name = _type_from_request(request, None)
    if type_name in (None, "", "getUserRole", "getUsers"):
        return _query_user_login_data()
    if type_name == "getRegistration":
        return _query_user_registration()
    raise HTTPException(status_code=501, detail=f"type '{type_name}' not implemented in user backend")


@app.post("/user-exec")
async def user_exec_post(request: Request) -> Any:
    try:
        payload = await request.json()
        if not isinstance(payload, dict):
            payload = {}
    except Exception:
        payload = {}

    type_name = _type_from_request(request, payload)
    if not type_name:
        raise HTTPException(status_code=400, detail="Missing 'type' in query or JSON body")
    return _handle_user_post_type(payload)
