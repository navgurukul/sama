"""Read models for laptops, beneficiaries, preliminary requests, pickups and audits."""

from __future__ import annotations

import os
from typing import Any, Dict, List, Optional

from fastapi import Request

from ...common.payload import _normalize_rows
from ...core.config import DONOR_TABLE
from ...core.db import DB_SCHEMA, get_conn


LAPTOP_SELECT_MAP = {
    "ID": 'll.id AS "ID"',
    "Date Committed": 'll.date_committed AS "Date Committed"',
    "Donor Company Name": 'COALESCE(d.donor_company, ll.donor_company_name) AS "Donor Company Name"',
    "RAM": 'll.ram AS "RAM"',
    "ROM": 'll.rom AS "ROM"',
    "Manufacturer Model": 'll.manufacturer_model AS "Manufacturer Model"',
    "Processor": 'll.processor AS "Processor"',
    "Manufacturing Date": 'll.manufacturing_date AS "Manufacturing Date"',
    "Condition Status": 'll.condition_status AS "Condition Status"',
    "Minor Issues": 'll.minor_issues AS "Minor Issues"',
    "Major Issues": 'll.major_issues AS "Major Issues"',
    "Other Issues": 'll.other_issues AS "Other Issues"',
    "Inventory Location": 'll.inventory_location AS "Inventory Location"',
    "laptop weight": 'll.laptop_weight AS "laptop weight"',
    "Mac address": 'll.mac_address AS "Mac address"',
    "Status": 'll.status AS "Status"',
    "Working": 'll.working AS "Working"',
    "Battery Capacity": 'll.battery_capacity AS "Battery Capacity"',
    "Allocated To": 'll.allocated_to AS "Allocated To"',
    "Last Updated On": 'll.last_updated_on AS "Last Updated On"',
    "Last Updated By": 'll.last_updated_by AS "Last Updated By"',
    "Assigned To": 'll.assigned_to AS "Assigned To"',
    "Comment for the Issues": 'll.comment_for_issues AS "Comment for the Issues"',
    "Inspection Files": 'll.inspection_files AS "Inspection Files"',
    "ActvityWatch PDF": 'll.activitywatch_pdf AS "ActvityWatch PDF"',
    "Date": 'll.activity_date AS "Date"',
    "AFK Time": 'll.afk_time AS "AFK Time"',
    "Usage Hours": 'll.usage_hours AS "Usage Hours"',
    "Off Times": 'll.off_times AS "Off Times"',
    "Last Delivery Date": 'll.last_delivery_date AS "Last Delivery Date"',
    "Refurbishment Date": 'll.refurbishment_date AS "Refurbishment Date"',
    "Batch": 'll.batch AS "Batch"',
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
        where_sql.append("(ll.id = %s OR ll.id ILIKE %s)")
        params.extend([id_query, f"%{id_query}%"])
    if mac_query:
        where_sql.append("(ll.mac_address = %s OR ll.mac_address ILIKE %s)")
        params.extend([mac_query, f"%{mac_query}%"])
    if assign_query:
        where_sql.append("ll.assigned_to ILIKE %s")
        params.append(f"%{assign_query}%")
    if working_filter and working_filter.lower() != "all":
        where_sql.append("ll.working = %s")
        params.append(working_filter)
    if status_filter and status_filter.lower() != "all":
        where_sql.append("ll.status = %s")
        params.append(status_filter)
    if major_issue_filter and major_issue_filter.lower() != "all":
        where_sql.append("ll.major_issues ILIKE %s")
        params.append(f"%{major_issue_filter}%")
    if minor_issue_filter and minor_issue_filter.lower() != "all":
        where_sql.append("ll.minor_issues ILIKE %s")
        params.append(f"%{minor_issue_filter}%")
    if allocated_to_filter:
        where_sql.append("ll.allocated_to = %s")
        params.append(allocated_to_filter)

    where_sql.append("(ll.is_deleted_from_sheet = FALSE OR ll.is_deleted_from_sheet IS NULL)")
    where_clause = " AND ".join(where_sql)
    select_expr = ",\n            ".join(LAPTOP_SELECT_MAP[f] for f in fields)

    sql = f"""
        SELECT
            {select_expr}
        FROM {DB_SCHEMA}.laptop_labeling ll
        LEFT JOIN {DB_SCHEMA}.{DONOR_TABLE} d
               ON d.donor_id = ll.donor_id
        WHERE {where_clause}
        ORDER BY ll.last_updated_on DESC NULLS LAST, ll.id
    """

    count_mode = include_meta
    if count_mode:
        sql = f"""
        SELECT
            {select_expr},
            count(*) OVER() AS "__total"
        FROM {DB_SCHEMA}.laptop_labeling ll
        LEFT JOIN {DB_SCHEMA}.{DONOR_TABLE} d
               ON d.donor_id = ll.donor_id
        WHERE {where_clause}
        ORDER BY ll.last_updated_on DESC NULLS LAST, ll.id
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
            doner AS "Doner",
            purpose_of_usage AS "purposeOfUsage",
            purpose_of_usage AS "Purpose of using the laptop",
            how_to_use AS "howToUse",
            how_to_use AS "How the laptop will be used",
            expected_impact AS "expectedImpact",
            expected_impact AS "Expected impact after receiving the device",
            additional_info AS "additionalInfo",
            additional_info AS "Any additional information required to understand the laptop's intended usage"
        FROM {DB_SCHEMA}.userdetails
        WHERE {' AND '.join(where_sql)}
        ORDER BY id
    """

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            return _normalize_rows(cur.fetchall())


def _parse_states(states_str: Optional[str]) -> List[str]:
    if not states_str:
        return []
    return [s.strip() for s in states_str.split(",") if s.strip()]


def _parse_courses(courses_str: Optional[str]) -> List[Dict[str, str]]:
    if not courses_str:
        return []
    courses = []
    parts = courses_str.split(",")
    for part in parts:
        part = part.strip()
        if not part:
            continue
        if ":" in part:
            name, duration = part.split(":", 1)
            courses.append({
                "name": name.strip(),
                "duration": duration.strip()
            })
        else:
            courses.append({
                "name": part,
                "duration": ""
            })
    return courses


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
            rows = _normalize_rows(cur.fetchall())
            for row in rows:
                row["States"] = _parse_states(row.get("States"))
                row["Courses"] = _parse_courses(row.get("Course"))
            return rows


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


def _query_donor_companies() -> List[Dict[str, Any]]:
    sql = f"""
        SELECT
            donor_id AS "Donor ID",
            donor_company AS "Donor Company Name",
            donor_key AS "Donor Key"
        FROM {DB_SCHEMA}.{DONOR_TABLE}
        WHERE donor_company IS NOT NULL
          AND btrim(donor_company) <> ''
        ORDER BY donor_company
    """

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql)
            return _normalize_rows(cur.fetchall())


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
