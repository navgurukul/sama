from __future__ import annotations

import asyncio
import json
import os
import re
import uuid
import traceback
from datetime import date, datetime, timedelta
from typing import Any, Dict, List, Optional

import boto3
import httpx
from botocore.exceptions import ClientError
from fastapi import FastAPI, File, HTTPException, Request, UploadFile, BackgroundTasks, Response, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from .db import DB_SCHEMA, get_conn


USER_PROFILE_TABLE_PREFIX = os.getenv("USER_PROFILE_TABLE_PREFIX", "user_profile").strip() or "user_profile"
USER_REGISTRATION_TABLE = f"{USER_PROFILE_TABLE_PREFIX}_registration"
USER_ROLE_TABLE = f"{USER_PROFILE_TABLE_PREFIX}_userrole"
DONOR_TABLE = os.getenv("DONOR_TABLE", "donor").strip() or "donor"
LEGACY_NGO_API_URL = ""

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
    "pickup",
    "audit",
    "UpdateLaptopComment",
    "updatepickupstatus",
    "assign",
    "laptopLabeling",
    "bulkupload",
    "userdetails",
    "editUser",
    "deleteUser",
    "startStageRun",
    "submitChecklistResponses",
    "evaluateStageRun",
    "completeStageRun",
    "createIssueLog",
    "resolveIssueLog",
    "email-webhook",
    "publicInquiry",
}


STAGE_STATUS_VALUES = {
    "LAPTOP_RECEIVED",
    "REFURBISHMENT_TESTING",
    "QC_CHECK",
    "DISTRIBUTION",
    "POST_DEPLOYMENT_15D",
    "MONTHLY_MONITORING",
    "NOT_WORKING",
}

CONDITION_STATUS_VALUES = {
    "GOOD",
    "BAD",
    "NEEDS_REPAIR",
}

UNKNOWN_VALUE_MARKERS = {"unknown", "n/a", "na", "null"}

STAGE1_DASHBOARD_REQUIRED_FIELDS = [
    ("id", "Serial Number"),
    ("inventory_location", "Inventory Location"),
    ("donor", "Donor Company"),
]

STAGE2_FUNCTIONAL_TEST_ITEM_CODES = [
    "POWER_TEST_DONE",
    "INPUT_TEST_DONE",
    "BATTERY_TEST_DONE",
    "PORT_TEST_DONE",
    "CAMERA_AUDIO_TEST_DONE",
]
STAGE2_RMS_ITEM_CODE = "RMS_INSTALLED_ACTIVE"
STAGE2_DASHBOARD_ITEM_CODE = "TEST_RESULTS_DASHBOARD_UPDATED"


# Explicit transition graph for predictable operational flow.
# Any missing PASS transition falls back to next active stage by display_order.
STAGE_TRANSITIONS: Dict[str, Dict[str, str]] = {
    "LAPTOP_RECEIVED": {"pass": "REFURBISHMENT_TESTING", "fail": "NOT_WORKING", "fast_pass": "QC_CHECK"},
    "REFURBISHMENT_TESTING": {"pass": "QC_CHECK", "fail": "NOT_WORKING"},
    "QC_CHECK": {"pass": "DISTRIBUTION", "fail": "NOT_WORKING"},
    "DISTRIBUTION": {"pass": "POST_DEPLOYMENT_15D", "fail": "DISTRIBUTION"},
    "POST_DEPLOYMENT_15D": {"pass": "MONTHLY_MONITORING", "fail": "POST_DEPLOYMENT_15D"},
    "MONTHLY_MONITORING": {"fail": "MONTHLY_MONITORING"},
    "NOT_WORKING": {"fail": "NOT_WORKING"},
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


def _parse_int(value: Any, field_name: str) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail=f"{field_name} must be an integer")


def _normalize_stage_id(raw: Any) -> Optional[int]:
    if raw is None:
        return None
    text = str(raw).strip()
    if not text:
        return None
    return _parse_int(text, "stageId")


def _normalize_stage_code(raw: Any) -> Optional[str]:
    if raw is None:
        return None
    code = str(raw).strip().upper()
    return code or None


def _normalize_condition_status(raw: Any) -> Optional[str]:
    if raw is None:
        return None
    text = str(raw).strip()
    if not text:
        return None

    normalized = re.sub(r"\s+", " ", text).strip().upper()
    if normalized.startswith("GOOD"):
        return "GOOD"
    if normalized.startswith("BAD"):
        return "BAD"
    if "REPAIR" in normalized or "NEED" in normalized:
        return "NEEDS_REPAIR"

    return normalized if normalized in CONDITION_STATUS_VALUES else None


def _normalize_laptop_status(raw: Any) -> str:
    text = str(raw or "").strip().upper()
    return text or "LAPTOP_RECEIVED"


def _normalize_text_value(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def _is_unknown_value(value: Any) -> bool:
    text = _normalize_text_value(value)
    if not text:
        return True
    return text.lower() in UNKNOWN_VALUE_MARKERS


def _count_urls_from_text(raw: Any) -> int:
    text = _normalize_text_value(raw)
    if not text:
        return 0
    parts = re.split(r"[\s,;]+", text)
    return len([p for p in parts if p])


def _resolve_stage(cur, stage_id: Optional[int], stage_code: Optional[str]) -> Dict[str, Any]:
    if stage_id is None and not stage_code:
        raise HTTPException(status_code=400, detail="Either stageId or stageCode is required")

    if stage_id is not None:
        cur.execute(
            f"""
            SELECT stage_id, stage_code
            FROM {DB_SCHEMA}.stage_definition
            WHERE stage_id = %s
              AND is_active = TRUE
            LIMIT 1
            """,
            (stage_id,),
        )
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=400, detail="Invalid stageId")
        return row

    if stage_code and stage_code not in STAGE_STATUS_VALUES:
        raise HTTPException(status_code=400, detail="Invalid stageCode")

    cur.execute(
        f"""
        SELECT stage_id, stage_code
        FROM {DB_SCHEMA}.stage_definition
        WHERE stage_code = %s
          AND is_active = TRUE
        LIMIT 1
        """,
        (stage_code,),
    )
    row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=400, detail="Invalid stageCode")
    return row


def _resolve_next_stage(cur, current_stage_id: int) -> Optional[Dict[str, Any]]:
    cur.execute(
        f"""
        WITH current_stage AS (
            SELECT stage_id, stage_code, display_order
            FROM {DB_SCHEMA}.stage_definition
            WHERE stage_id = %s
            LIMIT 1
        )
        SELECT sd.stage_id, sd.stage_code
        FROM {DB_SCHEMA}.stage_definition sd
        JOIN current_stage cs
          ON sd.display_order > cs.display_order
        WHERE sd.is_active = TRUE
        ORDER BY sd.display_order, sd.stage_id
        LIMIT 1
        """,
        (current_stage_id,),
    )
    row = cur.fetchone()
    return row or None


def _resolve_transition_stage(
    cur,
    current_stage_code: str,
    event: str,
    current_stage_id: Optional[int] = None,
) -> Optional[Dict[str, Any]]:
    event_key = str(event or "").strip().lower()
    if event_key not in {"pass", "fail", "fast_pass"}:
        raise HTTPException(status_code=400, detail="Invalid transition event")

    transitions = STAGE_TRANSITIONS.get(current_stage_code, {})
    target_stage_code = transitions.get(event_key)

    if target_stage_code:
        return _resolve_stage(cur, None, target_stage_code)

    if event_key == "pass" and current_stage_id is not None:
        return _resolve_next_stage(cur, current_stage_id)

    return None


def _evaluate_requires_different_actor_gate(
    cur,
    run_id: int,
    completed_by: Optional[str] = None,
    verifier_name: Optional[str] = None,
) -> Dict[str, Any]:
    cur.execute(
        f"""
        SELECT
            r.run_id,
            r.stage_id,
            r.stage_code,
            r.laptop_id,
            r.started_by,
            r.completed_by,
            r.verifier_name,
            sd.requires_different_actor
        FROM {DB_SCHEMA}.laptop_stage_run r
        JOIN {DB_SCHEMA}.stage_definition sd
          ON sd.stage_id = r.stage_id
        WHERE r.run_id = %s
        LIMIT 1
        """,
        (run_id,),
    )
    row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="runId not found")

    requires_different_actor = bool(row.get("requires_different_actor"))
    laptop_id = str(row.get("laptop_id") or "")
    completed_actor = str(completed_by or row.get("completed_by") or "").strip()
    verifier_actor = str(verifier_name or row.get("verifier_name") or "").strip()

    # Find the most recent PASS run from the previous stage for this laptop.
    # The SOP rule is: QC actor must differ from the Stage 2 refurbisher,
    # not that two different people must work within Stage 3 itself.
    prior_actor = ""
    if requires_different_actor:
        cur.execute(
            f"""
            SELECT COALESCE(r.completed_by, r.started_by) AS actor
            FROM {DB_SCHEMA}.laptop_stage_run r
            JOIN {DB_SCHEMA}.stage_definition sd ON sd.stage_id = r.stage_id
            WHERE r.laptop_id = %s
              AND r.outcome = 'PASS'
              AND sd.display_order < (
                  SELECT sd2.display_order
                  FROM {DB_SCHEMA}.stage_definition sd2
                  WHERE sd2.stage_id = %s
              )
            ORDER BY sd.display_order DESC, r.run_id DESC
            LIMIT 1
            """,
            (laptop_id, row["stage_id"]),
        )
        prior_row = cur.fetchone()
        if prior_row:
            prior_actor = str(prior_row.get("actor") or "").strip()

    violations: List[str] = []
    if requires_different_actor and prior_actor:
        if completed_actor and completed_actor.lower() == prior_actor.lower():
            violations.append(
                f"completedBy ({completed_actor}) must differ from the previous stage actor ({prior_actor})"
            )
        if verifier_actor and verifier_actor.lower() == prior_actor.lower():
            violations.append(
                f"verifierName ({verifier_actor}) must differ from the previous stage actor ({prior_actor})"
            )

    passed = len(violations) == 0
    details = {
        "requiresDifferentActor": requires_different_actor,
        "priorStageActor": prior_actor,
        "completedBy": completed_actor,
        "verifierName": verifier_actor,
        "violations": violations,
    }

    cur.execute(
        f"""
        INSERT INTO {DB_SCHEMA}.stage_gate_rule (stage_id, stage_code, rule_code, rule_name, is_blocking, is_active, config_json)
        VALUES (%s, %s, 'REQUIRES_DIFFERENT_ACTOR', 'QC actor must differ from the Stage 2 refurbisher', TRUE, TRUE, %s::jsonb)
        ON CONFLICT (stage_id, rule_code)
        DO UPDATE SET is_active = TRUE, config_json = EXCLUDED.config_json
        RETURNING rule_id
        """,
        (row["stage_id"], row["stage_code"], json.dumps({"logic": "requires_different_actor"})),
    )
    rule_id_row = cur.fetchone()
    if not rule_id_row:
        raise HTTPException(status_code=500, detail="Failed to upsert actor gate rule")
    rule_id = int(rule_id_row["rule_id"])

    cur.execute(
        f"""
        INSERT INTO {DB_SCHEMA}.stage_gate_evaluation (run_id, rule_id, passed, details_json, evaluated_at)
        VALUES (%s, %s, %s, %s::jsonb, now())
        ON CONFLICT (run_id, rule_id)
        DO UPDATE SET
            passed = EXCLUDED.passed,
            details_json = EXCLUDED.details_json,
            evaluated_at = now()
        """,
        (run_id, rule_id, passed, json.dumps(details)),
    )

    return {
        "runId": run_id,
        "laptopId": row["laptop_id"],
        "stageId": row["stage_id"],
        "stageCode": row["stage_code"],
        "passed": passed,
        "details": details,
    }


def _normalize_donor_name(donor_raw: Optional[str]) -> Optional[str]:
    if donor_raw is None:
        return None
    text = str(donor_raw).strip()
    if not text:
        return None

    # Numeric-only values are treated as invalid donor labels.
    if re.fullmatch(r"\d+", text):
        return None

    donor_key = re.sub(r"[^A-Z0-9]+", "", text.upper())
    alias_map = {
        "AMAZON": "AMAZON",
        "AMAZONNG": "AMAZON",
        "TIGERANALYTICS": "TIGER ANALYTICS",
        "SGANALYTICS": "SG ANALYTICS",
    }
    return alias_map.get(donor_key, re.sub(r"\s+", " ", text).strip().upper())


def _donor_key_from_name(donor_name: str) -> str:
    return re.sub(r"[^A-Z0-9]+", "", donor_name.upper())


def _get_or_create_donor_id(cur, donor_raw: Optional[str]) -> Optional[int]:
    donor_company = _normalize_donor_name(donor_raw)
    if not donor_company:
        return None

    donor_key = _donor_key_from_name(donor_company)
    cur.execute(
        f"""
        INSERT INTO {DB_SCHEMA}.{DONOR_TABLE} (donor_company, donor_key)
        VALUES (%s, %s)
        ON CONFLICT (donor_key) DO UPDATE SET donor_company = EXCLUDED.donor_company
        RETURNING donor_id
        """,
        (donor_company, donor_key),
    )
    row = cur.fetchone()
    return int(row["donor_id"]) if row and row.get("donor_id") is not None else None


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


def _query_stage_template(request: Request) -> Dict[str, Any]:
    stage_id = _normalize_stage_id(request.query_params.get("stageId"))
    stage_code = _normalize_stage_code(request.query_params.get("stageCode"))
    if stage_id is not None and stage_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid stageId")
    if stage_code and stage_code not in STAGE_STATUS_VALUES:
        raise HTTPException(status_code=400, detail="Invalid stageCode")

    stage_sql = f"""
        SELECT
            stage_id AS "stageId",
            stage_code AS "stageCode",
            stage_name AS "stageName",
            display_order AS "displayOrder",
            sla_hours AS "slaHours",
            responsible_role AS "responsibleRole",
            verifier_role AS "verifierRole",
            requires_different_actor AS "requiresDifferentActor",
            is_active AS "isActive"
        FROM {DB_SCHEMA}.stage_definition
        WHERE is_active = TRUE
    """
    section_sql = f"""
        SELECT
            section_id AS "sectionId",
            stage_id AS "stageId",
            stage_code AS "stageCode",
            section_code AS "sectionCode",
            section_name AS "sectionName",
            display_order AS "displayOrder",
            is_active AS "isActive"
        FROM {DB_SCHEMA}.checklist_section
        WHERE is_active = TRUE
    """
    item_sql = f"""
        SELECT
            i.item_id AS "itemId",
            i.section_id AS "sectionId",
            s.stage_id AS "stageId",
            s.stage_code AS "stageCode",
            i.item_code AS "itemCode",
            i.item_text AS "itemText",
            i.display_order AS "displayOrder",
            i.is_mandatory AS "isMandatory",
            i.evidence_required AS "evidenceRequired",
            i.severity_if_fail AS "severityIfFail",
            i.sub_items_json AS "subItems",
            i.is_active AS "isActive"
        FROM {DB_SCHEMA}.checklist_item i
        JOIN {DB_SCHEMA}.checklist_section s
          ON s.section_id = i.section_id
        WHERE i.is_active = TRUE
          AND s.is_active = TRUE
    """

    params: List[Any] = []
    if stage_id is not None:
        stage_sql += " AND stage_id = %s"
        section_sql += " AND stage_id = %s"
        item_sql += " AND s.stage_id = %s"
        params.append(stage_id)
    elif stage_code:
        stage_sql += " AND stage_code = %s"
        section_sql += " AND stage_code = %s"
        item_sql += " AND s.stage_code = %s"
        params.append(stage_code)

    stage_sql += " ORDER BY display_order, stage_code"
    section_sql += " ORDER BY stage_code, display_order, section_code"
    item_sql += " ORDER BY s.stage_code, i.section_id, i.display_order, i.item_code"

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(stage_sql, params)
            stages = _normalize_rows(cur.fetchall())

            cur.execute(section_sql, params)
            sections = _normalize_rows(cur.fetchall())

            cur.execute(item_sql, params)
            items = _normalize_rows(cur.fetchall())

    return {
        "stages": stages,
        "sections": sections,
        "items": items,
    }


def _query_stage_map(request: Request) -> List[Dict[str, Any]]:
    include_inactive = request.query_params.get("includeInactive") == "1"

    sql = f"""
        SELECT
            sd.stage_id AS "stageId",
            sd.stage_code AS "stageCode",
            sd.stage_name AS "stageName",
            sd.display_order AS "displayOrder",
            sd.sla_hours AS "slaHours",
            sd.responsible_role AS "responsibleRole",
            sd.verifier_role AS "verifierRole",
            sd.requires_different_actor AS "requiresDifferentActor",
            sd.is_active AS "isActive",
            COALESCE(sec.section_count, 0) AS "sectionCount",
            COALESCE(itm.item_count, 0) AS "itemCount"
        FROM {DB_SCHEMA}.stage_definition sd
        LEFT JOIN (
            SELECT stage_id, count(*) AS section_count
            FROM {DB_SCHEMA}.checklist_section
            WHERE is_active = TRUE
            GROUP BY stage_id
        ) sec ON sec.stage_id = sd.stage_id
        LEFT JOIN (
            SELECT s.stage_id, count(*) AS item_count
            FROM {DB_SCHEMA}.checklist_item i
            JOIN {DB_SCHEMA}.checklist_section s
              ON s.section_id = i.section_id
            WHERE i.is_active = TRUE
              AND s.is_active = TRUE
            GROUP BY s.stage_id
        ) itm ON itm.stage_id = sd.stage_id
    """

    params: List[Any] = []
    if not include_inactive:
        sql += " WHERE sd.is_active = TRUE"

    sql += " ORDER BY sd.display_order, sd.stage_id"

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            return _normalize_rows(cur.fetchall())


def _query_laptop_stage_runs(request: Request) -> List[Dict[str, Any]]:
    laptop_id = (request.query_params.get("laptopId") or "").strip()
    if not laptop_id:
        raise HTTPException(status_code=400, detail="laptopId is required")

    sql = f"""
        SELECT
            r.run_id AS "runId",
            r.laptop_id AS "laptopId",
            r.stage_id AS "stageId",
            r.stage_code AS "stageCode",
            s.stage_name AS "stageName",
            r.run_number AS "runNumber",
            r.outcome AS "outcome",
            r.started_by AS "startedBy",
            r.completed_by AS "completedBy",
            r.verifier_name AS "verifierName",
            r.started_at AS "startedAt",
            r.completed_at AS "completedAt",
            r.notes AS "notes"
        FROM {DB_SCHEMA}.laptop_stage_run r
        LEFT JOIN {DB_SCHEMA}.stage_definition s
          ON s.stage_code = r.stage_code
        WHERE r.laptop_id = %s
        ORDER BY r.started_at DESC, r.run_id DESC
    """

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (laptop_id,))
            return _normalize_rows(cur.fetchall())


def _query_stage_run_responses(request: Request) -> List[Dict[str, Any]]:
    run_id = _parse_int(request.query_params.get("runId"), "runId")
    sql = f"""
        SELECT
            r.response_id AS "responseId",
            r.run_id AS "runId",
            r.item_id AS "itemId",
            i.section_id AS "sectionId",
            i.item_code AS "itemCode",
            i.item_text AS "itemText",
            i.is_mandatory AS "isMandatory",
            i.evidence_required AS "evidenceRequired",
            i.sub_items_json AS "subItems",
            s.stage_id AS "stageId",
            s.stage_code AS "stageCode",
            r.result AS "result",
            r.remark AS "remark",
            r.evidence_url AS "evidenceUrl",
            r.sub_checks_json AS "subChecks",
            r.responded_by AS "respondedBy",
            r.responded_at AS "respondedAt"
        FROM {DB_SCHEMA}.checklist_response r
        JOIN {DB_SCHEMA}.checklist_item i
          ON i.item_id = r.item_id
        JOIN {DB_SCHEMA}.checklist_section s
          ON s.section_id = i.section_id
        WHERE r.run_id = %s
        ORDER BY i.display_order, i.item_id
    """

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (run_id,))
            rows = _normalize_rows(cur.fetchall())

    for row in rows:
        evidence = row.get("evidenceUrl")
        evidence_keys = _extract_evidence_keys(evidence)
        evidence_files: List[Dict[str, Any]] = []
        for key in evidence_keys:
            if key.lower().startswith("http://") or key.lower().startswith("https://"):
                evidence_files.append({
                    "key": None,
                    "url": key,
                    "contentType": None,
                })
                continue
            try:
                resolved = _resolve_s3_evidence(key)
                evidence_files.append({
                    "key": key,
                    "url": resolved.get("url") or key,
                    "contentType": resolved.get("contentType"),
                })
            except HTTPException:
                evidence_files.append({
                    "key": key,
                    "url": key,
                    "contentType": None,
                })

        if evidence_files:
            row["evidenceFiles"] = evidence_files
            row["evidenceKey"] = evidence_files[0].get("key")
            row["evidenceUrl"] = evidence_files[0].get("url")
            row["evidenceContentType"] = evidence_files[0].get("contentType")
        else:
            row["evidenceFiles"] = []

    return rows


def _evaluate_run_mandatory_gate(cur, run_id: int) -> Dict[str, Any]:
    cur.execute(
        f"""
        SELECT
            r.run_id,
            r.stage_id,
            r.stage_code,
            r.laptop_id,
            count(*) FILTER (WHERE i.is_mandatory) AS mandatory_total,
            count(*) FILTER (WHERE i.is_mandatory AND resp.result = 'PASS') AS mandatory_passed,
            count(*) FILTER (WHERE i.is_mandatory AND resp.result = 'FAIL') AS mandatory_failed,
            count(*) FILTER (WHERE i.is_mandatory AND (resp.response_id IS NULL OR resp.result = 'NA')) AS mandatory_missing
        FROM {DB_SCHEMA}.laptop_stage_run r
        LEFT JOIN {DB_SCHEMA}.checklist_section s
                    ON s.stage_id = r.stage_id
         AND s.is_active = TRUE
        LEFT JOIN {DB_SCHEMA}.checklist_item i
          ON i.section_id = s.section_id
         AND i.is_active = TRUE
        LEFT JOIN {DB_SCHEMA}.checklist_response resp
          ON resp.run_id = r.run_id
         AND resp.item_id = i.item_id
        WHERE r.run_id = %s
        GROUP BY r.run_id, r.stage_id, r.stage_code, r.laptop_id
        """,
        (run_id,),
    )
    row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="runId not found")

    mandatory_total = int(row.get("mandatory_total") or 0)
    mandatory_passed = int(row.get("mandatory_passed") or 0)
    mandatory_failed = int(row.get("mandatory_failed") or 0)
    mandatory_missing = int(row.get("mandatory_missing") or 0)

    cur.execute(
        f"""
        SELECT
            i.item_id AS item_id,
            i.item_code AS item_code,
            i.item_text AS item_text,
            s.section_code AS section_code,
            s.section_name AS section_name,
            resp.result AS result,
            resp.remark AS remark,
            resp.evidence_url AS evidence_url
        FROM {DB_SCHEMA}.laptop_stage_run r
        JOIN {DB_SCHEMA}.checklist_section s
          ON s.stage_id = r.stage_id
         AND s.is_active = TRUE
        JOIN {DB_SCHEMA}.checklist_item i
          ON i.section_id = s.section_id
         AND i.is_active = TRUE
         AND i.is_mandatory = TRUE
        LEFT JOIN {DB_SCHEMA}.checklist_response resp
          ON resp.run_id = r.run_id
         AND resp.item_id = i.item_id
        WHERE r.run_id = %s
          AND (
            resp.response_id IS NULL
                        OR resp.result IN ('FAIL', 'NA')
          )
        ORDER BY s.display_order, i.display_order, i.item_id
        """,
        (run_id,),
    )
    issue_rows = cur.fetchall() or []
    failed_items: List[Dict[str, Any]] = []
    missing_items: List[Dict[str, Any]] = []
    for issue in issue_rows:
        item_payload = {
            "itemId": issue.get("item_id"),
            "itemCode": issue.get("item_code"),
            "itemText": issue.get("item_text"),
            "sectionCode": issue.get("section_code"),
            "sectionName": issue.get("section_name"),
            "remark": issue.get("remark"),
            "evidenceUrl": issue.get("evidence_url"),
        }
        if issue.get("result") == "FAIL":
            failed_items.append(item_payload)
        else:
            missing_items.append(item_payload)

    passed = mandatory_failed == 0 and mandatory_missing == 0
    details = {
        "mandatoryTotal": mandatory_total,
        "mandatoryPassed": mandatory_passed,
        "mandatoryFailed": mandatory_failed,
        "mandatoryMissing": mandatory_missing,
        "failedMandatoryItems": failed_items,
        "missingMandatoryItems": missing_items,
    }

    cur.execute(
        f"""
        INSERT INTO {DB_SCHEMA}.stage_gate_rule (stage_id, stage_code, rule_code, rule_name, is_blocking, is_active, config_json)
        VALUES (%s, %s, 'MANDATORY_ITEMS_PASS', 'All mandatory checklist items must be PASS', TRUE, TRUE, %s::jsonb)
        ON CONFLICT (stage_id, rule_code)
        DO UPDATE SET is_active = TRUE, config_json = EXCLUDED.config_json
        RETURNING rule_id
        """,
        (row["stage_id"], row["stage_code"], json.dumps({"logic": "mandatory_pass"})),
    )
    rule_id_row = cur.fetchone()
    if not rule_id_row:
        raise HTTPException(status_code=500, detail="Failed to upsert stage gate rule")
    rule_id = int(rule_id_row["rule_id"])

    cur.execute(
        f"""
        INSERT INTO {DB_SCHEMA}.stage_gate_evaluation (run_id, rule_id, passed, details_json, evaluated_at)
        VALUES (%s, %s, %s, %s::jsonb, now())
        ON CONFLICT (run_id, rule_id)
        DO UPDATE SET
            passed = EXCLUDED.passed,
            details_json = EXCLUDED.details_json,
            evaluated_at = now()
        """,
        (run_id, rule_id, passed, json.dumps(details)),
    )

    return {
        "runId": run_id,
        "laptopId": row["laptop_id"],
        "stageId": row["stage_id"],
        "stageCode": row["stage_code"],
        "passed": passed,
        "details": details,
    }


def _resolve_rule_config(rule_row: Dict[str, Any]) -> Dict[str, Any]:
    raw_config = rule_row.get("config_json") or {}
    if isinstance(raw_config, str):
        try:
            raw_config = json.loads(raw_config)
        except json.JSONDecodeError:
            raw_config = {}
    if not isinstance(raw_config, dict):
        raw_config = {}
    return raw_config


def _normalize_json_list(value: Any) -> List[Any]:
    if value is None:
        return []
    if isinstance(value, list):
        return value
    if isinstance(value, str):
        try:
            parsed = json.loads(value)
            return parsed if isinstance(parsed, list) else []
        except json.JSONDecodeError:
            return []
    return []


def _extract_evidence_keys(value: Any) -> List[str]:
    if value is None:
        return []
    if isinstance(value, list):
        return [str(item) for item in value if item]
    if isinstance(value, str):
        raw = value.strip()
        if not raw:
            return []
        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError:
            parsed = None
        if isinstance(parsed, list):
            return [str(item) for item in parsed if item]
        return [part for part in re.split(r"[\s,;]+", raw) if part]
    return [str(value)]


def _get_s3_client() -> Any:
    region = os.getenv("AWS_REGION") or os.getenv("AWS_DEFAULT_REGION")
    access_key = os.getenv("AWS_ACCESS_KEY_ID")
    secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
    session_token = os.getenv("AWS_SESSION_TOKEN")

    session = boto3.session.Session(
        aws_access_key_id=access_key or None,
        aws_secret_access_key=secret_key or None,
        aws_session_token=session_token or None,
        region_name=region or None,
    )
    return session.client("s3")


def _get_s3_settings() -> Dict[str, Any]:
    bucket = (os.getenv("S3_BUCKET") or "").strip()
    if not bucket:
        raise HTTPException(status_code=500, detail="S3_BUCKET is not configured")

    prefix = (os.getenv("S3_PREFIX") or "").strip()
    if prefix and not prefix.endswith("/"):
        prefix += "/"

    expires_raw = (os.getenv("S3_PRESIGN_EXPIRES") or "3600").strip()
    try:
        expires = int(expires_raw)
    except ValueError:
        expires = 3600

    return {
        "bucket": bucket,
        "prefix": prefix,
        "expires": max(expires, 60),
    }


def _presign_s3_get(client: Any, bucket: str, key: str, expires: int) -> str:
    return client.generate_presigned_url(
        "get_object",
        Params={"Bucket": bucket, "Key": key},
        ExpiresIn=expires,
    )


def _resolve_s3_evidence(key: str) -> Dict[str, Any]:
    if not key:
        return {"url": None, "contentType": None}
    settings = _get_s3_settings()
    client = _get_s3_client()
    content_type = None
    try:
        head = client.head_object(Bucket=settings["bucket"], Key=key)
        content_type = head.get("ContentType")
    except ClientError:
        content_type = None

    url = _presign_s3_get(client, settings["bucket"], key, settings["expires"])
    return {"url": url, "contentType": content_type}


def _fetch_run_item_statuses(cur, run_id: int, item_codes: List[str]) -> Dict[str, Dict[str, Any]]:
    if not item_codes:
        return {}
    cur.execute(
        f"""
        SELECT
            i.item_code,
            r.result,
            r.sub_checks_json,
            i.sub_items_json
        FROM {DB_SCHEMA}.checklist_item i
        LEFT JOIN {DB_SCHEMA}.checklist_response r
          ON r.item_id = i.item_id
         AND r.run_id = %s
        WHERE i.item_code = ANY(%s)
        """,
        (run_id, item_codes),
    )
    rows = cur.fetchall() or []
    status_map: Dict[str, Dict[str, Any]] = {}
    for row in rows:
        code = str(row.get("item_code") or "")
        status_map[code] = {
            "result": row.get("result"),
            "subChecks": _normalize_json_list(row.get("sub_checks_json")),
            "subItems": _normalize_json_list(row.get("sub_items_json")),
        }
    return status_map


def _is_subchecks_complete(sub_items: List[Any], sub_checks: List[Any]) -> bool:
    if not sub_items:
        return True
    if not sub_checks:
        return False
    for index in range(len(sub_items)):
        if index >= len(sub_checks) or not bool(sub_checks[index]):
            return False
    return True


def _evaluate_stage2_tests_completed(cur, run_id: int, item_codes: List[str]) -> Dict[str, Any]:
    statuses = _fetch_run_item_statuses(cur, run_id, item_codes)
    not_passed: List[str] = []
    for code in item_codes:
        result = str(statuses.get(code, {}).get("result") or "").upper()
        if result != "PASS":
            not_passed.append(code)

    passed = len(not_passed) == 0
    return {
        "passed": passed,
        "details": {
            "requiredItemCodes": item_codes,
            "notPassed": not_passed,
            "completedCount": len(item_codes) - len(not_passed),
        },
    }


def _evaluate_stage2_pass_required(cur, run_id: int, item_code: str) -> Dict[str, Any]:
    statuses = _fetch_run_item_statuses(cur, run_id, [item_code])
    status = statuses.get(item_code, {})
    result = str(status.get("result") or "").upper()
    sub_items = status.get("subItems") or []
    sub_checks = status.get("subChecks") or []
    sub_checks_complete = _is_subchecks_complete(sub_items, sub_checks)
    checked_count = 0
    if sub_items:
        checked_count = sum(
            1 for index in range(len(sub_items))
            if index < len(sub_checks) and bool(sub_checks[index])
        )

    is_macbook_skipped = False
    if item_code == STAGE2_RMS_ITEM_CODE and result in ("SKIP", "SKIPPED", "SKIPPED_MAC"):
        cur.execute(f"""
            SELECT l.manufacturer_model
            FROM {DB_SCHEMA}.laptop_labeling_run r
            JOIN {DB_SCHEMA}.laptop_labeling l ON l.id = r.laptop_id
            WHERE r.id = %s
        """, (run_id,))
        row = cur.fetchone()
        if row:
            model = str(row.get("manufacturer_model") or "").lower()
            if "mac" in model or "apple" in model:
                is_macbook_skipped = True

    if is_macbook_skipped:
        passed = True
    else:
        passed = result == "PASS" and sub_checks_complete

    return {
        "passed": passed,
        "details": {
            "itemCode": item_code,
            "result": result,
            "subChecksComplete": sub_checks_complete,
            "requiredSubChecks": len(sub_items),
            "checkedSubChecks": checked_count,
        },
    }


def _evaluate_dashboard_fields_complete(cur, laptop_id: str) -> Dict[str, Any]:
    cur.execute(
        f"""
        SELECT id, donor_company_name, donor_id, inventory_location, inspection_files
        FROM {DB_SCHEMA}.laptop_labeling
        WHERE id = %s
        LIMIT 1
        """,
        (laptop_id,),
    )
    row = cur.fetchone() or {}

    missing_fields: List[str] = []
    if _is_unknown_value(row.get("id")):
        missing_fields.append("Serial Number")

    donor_ok = row.get("donor_id") is not None or not _is_unknown_value(row.get("donor_company_name"))
    if not donor_ok:
        missing_fields.append("Donor Company")

    if _is_unknown_value(row.get("inventory_location")):
        missing_fields.append("Inventory Location")

    passed = len(missing_fields) == 0
    return {
        "passed": passed,
        "details": {
            "requiredFields": [label for _, label in STAGE1_DASHBOARD_REQUIRED_FIELDS],
            "missingFields": missing_fields,
        },
    }


def _evaluate_photos_uploaded(cur, run_id: int, laptop_id: str, min_photos: int) -> Dict[str, Any]:
    cur.execute(
        f"""
        SELECT inspection_files
        FROM {DB_SCHEMA}.laptop_labeling
        WHERE id = %s
        LIMIT 1
        """,
        (laptop_id,),
    )
    row = cur.fetchone() or {}
    inspection_files = row.get("inspection_files")
    if not _is_unknown_value(inspection_files):
        return {
            "passed": True,
            "details": {
                "source": "inspection_files",
                "photoUrlCount": _count_urls_from_text(inspection_files),
                "minPhotos": min_photos,
            },
        }

    cur.execute(
        f"""
        SELECT r.evidence_url
        FROM {DB_SCHEMA}.checklist_response r
        JOIN {DB_SCHEMA}.checklist_item i
          ON i.item_id = r.item_id
        WHERE r.run_id = %s
          AND coalesce(r.evidence_url, '') <> ''
        """,
        (run_id,),
    )
    urls: List[str] = []
    for resp in cur.fetchall() or []:
        evidence_value = resp.get("evidence_url")
        urls.extend(_extract_evidence_keys(evidence_value))

    urls = [u for u in urls if u]
    passed = len(urls) >= min_photos
    return {
        "passed": passed,
        "details": {
            "source": "checklist_evidence",
            "photoUrlCount": len(urls),
            "minPhotos": min_photos,
        },
    }


def _evaluate_serial_verified(laptop_id: str) -> Dict[str, Any]:
    passed = not _is_unknown_value(laptop_id)
    return {
        "passed": passed,
        "details": {
            "serialPresent": passed,
        },
    }


def _evaluate_barcode_scanned(cur, run_id: int, item_codes: List[str]) -> Dict[str, Any]:
    cur.execute(
        f"""
        SELECT i.item_code, r.result
        FROM {DB_SCHEMA}.checklist_response r
        JOIN {DB_SCHEMA}.checklist_item i
          ON i.item_id = r.item_id
        WHERE r.run_id = %s
          AND i.item_code = ANY(%s)
        """,
        (run_id, item_codes),
    )
    rows = cur.fetchall() or []
    result_map = {str(r.get("item_code")): str(r.get("result") or "").upper() for r in rows}
    missing = [code for code in item_codes if result_map.get(code) != "PASS"]
    passed = len(missing) == 0
    return {
        "passed": passed,
        "details": {
            "requiredItemCodes": item_codes,
            "missingOrFailed": missing,
        },
    }


def _evaluate_stage_gate_rules(cur, run_id: int) -> Dict[str, Any]:
    cur.execute(
        f"""
        SELECT run_id, stage_id, stage_code, laptop_id
        FROM {DB_SCHEMA}.laptop_stage_run
        WHERE run_id = %s
        LIMIT 1
        """,
        (run_id,),
    )
    run_row = cur.fetchone()
    if not run_row:
        raise HTTPException(status_code=404, detail="runId not found")

    cur.execute(
        f"""
        SELECT rule_id, rule_code, rule_name, is_blocking, config_json
        FROM {DB_SCHEMA}.stage_gate_rule
        WHERE stage_id = %s
          AND is_active = TRUE
        ORDER BY rule_id
        """,
        (run_row["stage_id"],),
    )
    rules = cur.fetchall() or []

    results: List[Dict[str, Any]] = []
    all_blocking_passed = True

    for rule in rules:
        rule_code = str(rule.get("rule_code") or "")
        if rule_code == "MANDATORY_ITEMS_PASS":
            continue

        config = _resolve_rule_config(rule)
        logic = str(config.get("logic") or "manual_check").strip().lower()

        if logic == "dashboard_fields_complete":
            eval_result = _evaluate_dashboard_fields_complete(cur, run_row["laptop_id"])
        elif logic == "photos_uploaded":
            min_photos = int(config.get("minPhotos") or 4)
            eval_result = _evaluate_photos_uploaded(cur, run_id, run_row["laptop_id"], min_photos)
        elif logic == "serial_verified":
            eval_result = _evaluate_serial_verified(run_row["laptop_id"])
        elif logic == "barcode_scanned":
            item_codes = config.get("itemCodes") or ["SCAN_BARCODE_CONFIRM"]
            if not isinstance(item_codes, list):
                item_codes = ["SCAN_BARCODE_CONFIRM"]
            eval_result = _evaluate_barcode_scanned(cur, run_id, [str(code) for code in item_codes])
        elif logic == "stage2_tests_completed":
            item_codes = config.get("itemCodes") or STAGE2_FUNCTIONAL_TEST_ITEM_CODES
            if not isinstance(item_codes, list):
                item_codes = STAGE2_FUNCTIONAL_TEST_ITEM_CODES
            eval_result = _evaluate_stage2_tests_completed(cur, run_id, [str(code) for code in item_codes])
        elif logic == "stage2_rms_active":
            item_code = str(config.get("itemCode") or STAGE2_RMS_ITEM_CODE)
            eval_result = _evaluate_stage2_pass_required(cur, run_id, item_code)
        elif logic == "stage2_dashboard_updated":
            item_code = str(config.get("itemCode") or STAGE2_DASHBOARD_ITEM_CODE)
            eval_result = _evaluate_stage2_pass_required(cur, run_id, item_code)
        else:
            eval_result = {
                "passed": True,
                "details": {"note": "manual_check_not_enforced"},
            }

        passed = bool(eval_result.get("passed"))
        details = eval_result.get("details") or {}

        cur.execute(
            f"""
            INSERT INTO {DB_SCHEMA}.stage_gate_evaluation (run_id, rule_id, passed, details_json, evaluated_at)
            VALUES (%s, %s, %s, %s::jsonb, now())
            ON CONFLICT (run_id, rule_id)
            DO UPDATE SET
                passed = EXCLUDED.passed,
                details_json = EXCLUDED.details_json,
                evaluated_at = now()
            """,
            (run_id, rule["rule_id"], passed, json.dumps(details)),
        )

        results.append(
            {
                "ruleId": rule["rule_id"],
                "ruleCode": rule_code,
                "ruleName": rule.get("rule_name"),
                "isBlocking": rule.get("is_blocking"),
                "passed": passed,
                "details": details,
            }
        )

        if rule.get("is_blocking") and not passed:
            all_blocking_passed = False

    return {
        "runId": run_id,
        "stageCode": run_row["stage_code"],
        "passed": all_blocking_passed,
        "rules": results,
    }


def _query_stage_gate_logs(request: Request) -> List[Dict[str, Any]]:
    run_id_raw = request.query_params.get("runId")
    laptop_id = (request.query_params.get("laptopId") or "").strip()

    if not run_id_raw and not laptop_id:
        raise HTTPException(status_code=400, detail="Either runId or laptopId is required")

    sql = f"""
        SELECT
            e.evaluation_id AS "evaluationId",
            e.run_id AS "runId",
            r.laptop_id AS "laptopId",
            r.stage_id AS "stageId",
            r.stage_code AS "stageCode",
            r.run_number AS "runNumber",
            gr.rule_id AS "ruleId",
            gr.rule_code AS "ruleCode",
            gr.rule_name AS "ruleName",
            gr.is_blocking AS "isBlocking",
            e.passed AS "passed",
            e.details_json AS "details",
            e.evaluated_at AS "evaluatedAt"
        FROM {DB_SCHEMA}.stage_gate_evaluation e
        JOIN {DB_SCHEMA}.stage_gate_rule gr
          ON gr.rule_id = e.rule_id
        JOIN {DB_SCHEMA}.laptop_stage_run r
          ON r.run_id = e.run_id
        WHERE 1=1
    """

    params: List[Any] = []
    if run_id_raw:
        run_id = _parse_int(run_id_raw, "runId")
        sql += " AND e.run_id = %s"
        params.append(run_id)
    if laptop_id:
        sql += " AND r.laptop_id = %s"
        params.append(laptop_id)

    sql += " ORDER BY e.evaluated_at DESC, e.evaluation_id DESC"

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, params)
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
            if type_name == "login":
                email = (payload.get("email") or payload.get("Email") or "").strip()
                password = payload.get("password") or payload.get("Password")

                if not email or password is None:
                    raise HTTPException(status_code=400, detail="Email and password are required")

                cur.execute(
                    f"""
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
                        t.role AS "Role",
                        t.ngo_id AS "Ngo Id",
                        t.type AS "Type",
                        t.doner AS "Doner"
                    FROM (
                        SELECT name, email, password, role, ngo_id, type, doner
                        FROM {DB_SCHEMA}.{USER_ROLE_TABLE}
                        UNION ALL
                        SELECT name, email, password, role, ngo_id, type, doner
                        FROM approved_registration
                    ) t
                    WHERE lower(t.email) = lower(%s)
                      AND t.password = %s
                    """,
                    (email, password),
                )
                matching_users = cur.fetchall()
                if not matching_users:
                    raise HTTPException(status_code=401, detail="Invalid Email or password.")

                user = dict(matching_users[0])
                roles = []
                for matching_user in matching_users:
                    for role in str(matching_user.get("Role") or "").split(","):
                        role = role.strip()
                        if role and role not in roles:
                            roles.append(role)
                user["Role"] = ", ".join(roles)
                conn.rollback()
                return {"status": "success", "user": _normalize_rows([user])[0]}

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
                payload_ngo_id = payload.get("ngo_id") or payload.get("NgoId")
                payload_ngo_type = payload.get("ngo_type") or payload.get("Type")
                payload_doner = payload.get("doner") or payload.get("Doner")

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

                        if not ngo_id:
                            ngo_id = payload_ngo_id
                        if not ngo_type:
                            ngo_type = payload_ngo_type
                        if not doner:
                            doner = payload_doner

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


def _parse_excel_date(val: Any) -> Optional[str]:
    if val is None or val == "":
        return None
    
    if isinstance(val, (datetime, date)):
        return val.strftime("%Y-%m-%d")
        
    try:
        if isinstance(val, (int, float)) or (isinstance(val, str) and val.strip().isdigit()):
            serial_num = int(val)
            if serial_num > 60:
                base_date = datetime(1899, 12, 30)
            else:
                base_date = datetime(1899, 12, 31)
            parsed_date = base_date + timedelta(days=serial_num)
            return parsed_date.strftime("%Y-%m-%d")
    except Exception:
        pass
        
    if isinstance(val, str):
        val_str = val.strip()
        if not val_str or val_str.lower() in ("none", "null"):
            return None
        for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%m/%d/%Y", "%Y/%m/%d"):
            try:
                return datetime.strptime(val_str, fmt).strftime("%Y-%m-%d")
            except ValueError:
                continue
        return val_str
        
    return None


def _upsert_laptop_row(cur, item: Dict[str, Any], last_updated_by: str) -> None:
    laptop_id = _payload_get(item, "id", "ID")
    donor_name_input = _payload_get(item, "donorCompanyName", "Donor Company Name")
    minor_issues = _payload_get(item, "minorIssues", "minorIssue", "Minor Issues")
    major_issues = _payload_get(item, "majorIssues", "majorIssue", "Major Issues")

    if isinstance(minor_issues, list):
        minor_issues = ", ".join(str(v).strip() for v in minor_issues if str(v).strip())
    if isinstance(major_issues, list):
        major_issues = ", ".join(str(v).strip() for v in major_issues if str(v).strip())

    donated_to = _payload_get(item, "donatedTo", "allocatedTo", "Allocated To")
    other_issues = _payload_get(item, "others", "otherIssues", "Other Issues")
    status_value = _payload_get(item, "status", "Status") or "LAPTOP_RECEIVED"
    condition_status_value = _normalize_condition_status(_payload_get(item, "conditionStatus", "Condition Status"))
    donor_id = _get_or_create_donor_id(cur, donor_name_input)

    cur.execute(
        f"""
        INSERT INTO {DB_SCHEMA}.laptop_labeling
        (id, donor_company_name, donor_id, ram, rom, manufacturer_model, processor, manufacturing_date,
         condition_status, minor_issues, major_issues, inventory_location, laptop_weight,
         other_issues, mac_address, battery_capacity, batch, status, working,
         allocated_to, assigned_to, comment_for_issues, last_updated_by, last_updated_on)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, now())
        ON CONFLICT (id) DO UPDATE SET
          donor_company_name=EXCLUDED.donor_company_name,
          donor_id=EXCLUDED.donor_id,
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
            str(donor_id) if donor_id is not None else donor_name_input,
            donor_id,
            _payload_get(item, "ram", "RAM"),
            _payload_get(item, "rom", "ROM"),
            _payload_get(item, "manufacturerModel", "Manufacturer Model", "manufacturer_model"),
            _payload_get(item, "processor", "Processor"),
            _parse_excel_date(_payload_get(item, "manufacturingDate", "Manufacturing Date", "Manufacturing Date(if available)")),
            condition_status_value,
            minor_issues,
            major_issues,
            _payload_get(item, "inventoryLocation", "Inventory Location", "inventory_location"),
            _payload_get(item, "laptopWeight", "laptop weight", "Laptop Weight", "laptop_weight"),
            other_issues,
            _payload_get(item, "macAddress", "Mac address", "Mac Address", "mac_address"),
            _payload_get(item, "batteryCapacity", "Battery Capacity", "battery_capacity"),
            _payload_get(item, "batch", "Batch"),
            status_value,
            _payload_get(item, "working", "Working"),
            donated_to,
            _payload_get(item, "assignedTo", "Assigned To", "assigned_to"),
            _payload_get(item, "comment", "commentForIssues", "Comment for the Issues"),
            last_updated_by,
        ),
    )


def _handle_post_type(type_name: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    with get_conn() as conn:
        with conn.cursor() as cur:
            if type_name == "startStageRun":
                laptop_id = str(_payload_get(payload, "laptopId", "id", "ID") or "").strip()
                stage_id = _normalize_stage_id(_payload_get(payload, "stageId"))
                stage_code = _normalize_stage_code(_payload_get(payload, "stageCode", "stage", "status"))
                started_by = str(_payload_get(payload, "startedBy", "updatedBy", "lastUpdatedBy") or "system").strip()
                notes = _payload_get(payload, "notes")

                if not laptop_id:
                    raise HTTPException(status_code=400, detail="laptopId is required")

                stage = _resolve_stage(cur, stage_id, stage_code)
                stage_id = int(stage["stage_id"])
                stage_code = str(stage["stage_code"])

                cur.execute(
                    f"SELECT id, status FROM {DB_SCHEMA}.laptop_labeling WHERE id=%s LIMIT 1",
                    (laptop_id,),
                )
                laptop_row = cur.fetchone()
                if not laptop_row:
                    raise HTTPException(status_code=404, detail="Laptop not found")

                current_status = _normalize_laptop_status(laptop_row.get("status"))
                if current_status != stage_code:
                    raise HTTPException(
                        status_code=409,
                        detail={
                            "message": "Start stage denied. Select the laptop's current stage only.",
                            "currentStageCode": current_status,
                            "requestedStageCode": stage_code,
                        },
                    )

                cur.execute(
                    f"""
                    SELECT coalesce(max(run_number), 0) + 1 AS next_run
                    FROM {DB_SCHEMA}.laptop_stage_run
                    WHERE laptop_id = %s
                                            AND stage_id = %s
                    """,
                                        (laptop_id, stage_id),
                )
                next_run_row = cur.fetchone() or {}
                next_run = int(next_run_row.get("next_run") or 1)

                cur.execute(
                    f"""
                    INSERT INTO {DB_SCHEMA}.laptop_stage_run
                    (laptop_id, stage_id, stage_code, run_number, outcome, started_by, started_at, notes)
                    VALUES (%s, %s, %s, %s, 'IN_PROGRESS', %s, now(), %s)
                    RETURNING run_id, laptop_id, stage_id, stage_code, run_number, outcome, started_by, started_at
                    """,
                    (laptop_id, stage_id, stage_code, next_run, started_by, notes),
                )
                row = cur.fetchone()
                conn.commit()
                return {
                    "status": "success",
                    "type": type_name,
                    "run": _normalize_rows([row])[0] if row else None,
                }

            if type_name == "submitChecklistResponses":
                run_id = _parse_int(_payload_get(payload, "runId"), "runId")
                responses = payload.get("responses")
                default_responder = str(_payload_get(payload, "respondedBy", "updatedBy", "lastUpdatedBy") or "system").strip()

                if not isinstance(responses, list) or not responses:
                    raise HTTPException(status_code=400, detail="responses must be a non-empty array")

                upserted = 0
                for response in responses:
                    if not isinstance(response, dict):
                        continue
                    item_id = _parse_int(response.get("itemId"), "itemId")
                    result = str(response.get("result") or "").strip().upper()
                    if result not in {"PASS", "FAIL", "NA"}:
                        raise HTTPException(status_code=400, detail="result must be PASS, FAIL, or NA")

                    remark = response.get("remark")
                    evidence_url = response.get("evidenceUrl")
                    sub_checks = response.get("subChecks")
                    if sub_checks is None:
                        sub_checks = []
                    if not isinstance(sub_checks, list):
                        raise HTTPException(status_code=400, detail="subChecks must be an array")
                    responded_by = str(response.get("respondedBy") or default_responder)

                    cur.execute(
                        f"""
                        INSERT INTO {DB_SCHEMA}.checklist_response
                        (run_id, item_id, result, remark, evidence_url, sub_checks_json, responded_by, responded_at)
                        VALUES (%s, %s, %s, %s, %s, %s::jsonb, %s, now())
                        ON CONFLICT (run_id, item_id)
                        DO UPDATE SET
                            result = EXCLUDED.result,
                            remark = EXCLUDED.remark,
                            evidence_url = EXCLUDED.evidence_url,
                            sub_checks_json = EXCLUDED.sub_checks_json,
                            responded_by = EXCLUDED.responded_by,
                            responded_at = now()
                        """,
                        (run_id, item_id, result, remark, evidence_url, json.dumps(sub_checks), responded_by),
                    )
                    upserted += 1

                conn.commit()
                return {"status": "success", "type": type_name, "upserted": upserted, "runId": run_id}

            if type_name == "evaluateStageRun":
                run_id = _parse_int(_payload_get(payload, "runId"), "runId")
                evaluation = _evaluate_run_mandatory_gate(cur, run_id)
                gate_summary = _evaluate_stage_gate_rules(cur, run_id)
                evaluation["gateRules"] = gate_summary.get("rules") or []
                evaluation["gatesPassed"] = bool(gate_summary.get("passed"))
                evaluation["passed"] = bool(evaluation.get("passed")) and evaluation["gatesPassed"]
                conn.commit()
                return {"status": "success", "type": type_name, "evaluation": evaluation}

            if type_name == "completeStageRun":
                run_id = _parse_int(_payload_get(payload, "runId"), "runId")
                completed_by = str(_payload_get(payload, "completedBy", "updatedBy", "lastUpdatedBy") or "system").strip()
                verifier_name = _payload_get(payload, "verifierName")
                notes = _payload_get(payload, "notes")

                evaluation = _evaluate_run_mandatory_gate(cur, run_id)
                gate_summary = _evaluate_stage_gate_rules(cur, run_id)
                evaluation["gateRules"] = gate_summary.get("rules") or []
                evaluation["gatesPassed"] = bool(gate_summary.get("passed"))
                evaluation["passed"] = bool(evaluation.get("passed")) and evaluation["gatesPassed"]
                current_stage_id = int(evaluation["stageId"])
                current_stage_code = str(evaluation["stageCode"])
                laptop_id = str(evaluation["laptopId"])

                if not evaluation["passed"]:
                    fail_outcome = "FAIL"
                    fail_stage = _resolve_transition_stage(cur, current_stage_code, "fail", current_stage_id)
                    fail_stage_id = int(fail_stage["stage_id"]) if fail_stage else current_stage_id
                    fail_stage_code = str(fail_stage["stage_code"]) if fail_stage else current_stage_code
                    cur.execute(
                        f"""
                        UPDATE {DB_SCHEMA}.laptop_stage_run
                        SET outcome = %s,
                            completed_by = %s,
                            verifier_name = %s,
                            completed_at = now(),
                            notes = COALESCE(%s, notes)
                        WHERE run_id = %s
                        """,
                        (fail_outcome, completed_by, verifier_name, notes, run_id),
                    )
                    cur.execute(
                        f"""
                        UPDATE {DB_SCHEMA}.laptop_labeling
                        SET status = %s,
                            last_updated_by = %s,
                            last_updated_on = now()
                        WHERE id = %s
                        """,
                        (fail_stage_code, completed_by, laptop_id),
                    )
                    conn.commit()
                    return {
                        "status": "success",
                        "type": type_name,
                        "runId": run_id,
                        "laptopId": laptop_id,
                        "stageId": current_stage_id,
                        "stageCode": current_stage_code,
                        "outcome": fail_outcome,
                        "nextStageId": fail_stage_id,
                        "nextStageCode": fail_stage_code,
                        "evaluation": evaluation,
                    }

                actor_evaluation = _evaluate_requires_different_actor_gate(
                    cur,
                    run_id,
                    completed_by=completed_by,
                    verifier_name=verifier_name,
                )
                if not actor_evaluation["passed"]:
                    fail_outcome = "FAIL"
                    fail_stage = _resolve_transition_stage(cur, current_stage_code, "fail", current_stage_id)
                    fail_stage_id = int(fail_stage["stage_id"]) if fail_stage else current_stage_id
                    fail_stage_code = str(fail_stage["stage_code"]) if fail_stage else current_stage_code
                    cur.execute(
                        f"""
                        UPDATE {DB_SCHEMA}.laptop_stage_run
                        SET outcome = %s,
                            completed_by = %s,
                            verifier_name = %s,
                            completed_at = now(),
                            notes = COALESCE(%s, notes)
                        WHERE run_id = %s
                        """,
                        (fail_outcome, completed_by, verifier_name, notes, run_id),
                    )
                    cur.execute(
                        f"""
                        UPDATE {DB_SCHEMA}.laptop_labeling
                        SET status = %s,
                            last_updated_by = %s,
                            last_updated_on = now()
                        WHERE id = %s
                        """,
                        (fail_stage_code, completed_by, laptop_id),
                    )
                    conn.commit()
                    return {
                        "status": "success",
                        "type": type_name,
                        "runId": run_id,
                        "laptopId": laptop_id,
                        "stageId": current_stage_id,
                        "stageCode": current_stage_code,
                        "outcome": fail_outcome,
                        "nextStageId": fail_stage_id,
                        "nextStageCode": fail_stage_code,
                        "evaluation": {
                            "mandatory": evaluation,
                            "differentActor": actor_evaluation,
                        },
                    }

                cur.execute(
                    f"""
                    UPDATE {DB_SCHEMA}.laptop_stage_run
                    SET outcome = 'PASS',
                        completed_by = %s,
                        verifier_name = %s,
                        completed_at = now(),
                        notes = COALESCE(%s, notes)
                    WHERE run_id = %s
                    RETURNING laptop_id, stage_id, stage_code
                    """,
                    (completed_by, verifier_name, notes, run_id),
                )
                run_row = cur.fetchone()
                if not run_row:
                    raise HTTPException(status_code=404, detail="runId not found")

                current_stage_id = int(run_row["stage_id"])
                current_stage_code = str(run_row["stage_code"])
                next_stage = _resolve_transition_stage(
                    cur,
                    current_stage_code,
                    "pass",
                    current_stage_id,
                )
                target_stage_id = int(next_stage["stage_id"]) if next_stage else current_stage_id
                target_stage_code = str(next_stage["stage_code"]) if next_stage else current_stage_code

                cur.execute(
                    f"""
                    UPDATE {DB_SCHEMA}.laptop_labeling
                    SET status = %s,
                        last_updated_by = %s,
                        last_updated_on = now()
                    WHERE id = %s
                    """,
                    (target_stage_code, completed_by, run_row["laptop_id"]),
                )

                conn.commit()
                return {
                    "status": "success",
                    "type": type_name,
                    "runId": run_id,
                    "laptopId": run_row["laptop_id"],
                    "stageId": current_stage_id,
                    "stageCode": current_stage_code,
                    "outcome": "PASS",
                    "nextStageId": target_stage_id,
                    "nextStageCode": target_stage_code,
                    "evaluation": {
                        "mandatory": evaluation,
                        "differentActor": actor_evaluation,
                    },
                }

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
                _upsert_laptop_row(cur, payload, payload.get("lastUpdatedBy", "system"))
                conn.commit()
                return {"status": "success", "type": type_name}

            if type_name == "pickup":
                pickup_id = f"PK-{uuid.uuid4().hex[:8].upper()}"
                cur.execute(
                    f"""
                    INSERT INTO {DB_SCHEMA}.pickup
                    (pickup_id, donor_company, poc_name, poc_contact, poc_email,
                     number_of_laptops, pickup_location, pickup_by, status,
                     current_date_time, updated_on)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'Pending', now(), now())
                    """,
                    (
                        pickup_id,
                        payload.get("donorCompany"),
                        payload.get("pocName"),
                        payload.get("pocContact"),
                        payload.get("email"),
                        int(payload.get("numberOfLaptops") or 0),
                        payload.get("pickupLocation"),
                        payload.get("pickupBy"),
                    ),
                )
                conn.commit()
                return {"status": "success", "type": type_name, "pickup_id": pickup_id}

            if type_name == "bulkupload":
                data_list = payload.get("data")
                if not isinstance(data_list, list):
                    raise HTTPException(status_code=400, detail="data must be a JSON array")
                
                last_updated_by = str(_payload_get(payload, "lastUpdatedBy", "updatedBy") or "system").strip()
                
                count = 0
                for item in data_list:
                    if not isinstance(item, dict):
                        continue
                    _upsert_laptop_row(cur, item, last_updated_by)
                    count += 1
                
                conn.commit()
                return {"status": "success", "type": type_name, "count": count}

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
                     laptop_assigned, id_link, income_certificate_link, date_time, doner,
                     purpose_of_usage, how_to_use, expected_impact, additional_info)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, now(), %s, %s, %s, %s, %s)
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
                      purpose_of_usage=EXCLUDED.purpose_of_usage,
                      how_to_use=EXCLUDED.how_to_use,
                      expected_impact=EXCLUDED.expected_impact,
                      additional_info=EXCLUDED.additional_info,
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
                        payload.get("purposeOfUsage") or payload.get("Purpose of using the laptop"),
                        payload.get("howToUse") or payload.get("How the laptop will be used"),
                        payload.get("expectedImpact") or payload.get("Expected impact after receiving the device"),
                        payload.get("additionalInfo") or payload.get("Any additional information required to understand the laptop's intended usage") or payload.get("additional_info"),
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

            if type_name == "createIssueLog":
                laptop_id = str(_payload_get(payload, "laptopId") or "").strip()
                description = str(_payload_get(payload, "description", "issueDescription") or "").strip()
                severity = str(_payload_get(payload, "severity") or "P2").strip().upper()
                reported_by = str(_payload_get(payload, "reportedBy", "updatedBy") or "system").strip()
                run_id_raw = _payload_get(payload, "runId")

                if not laptop_id:
                    raise HTTPException(status_code=400, detail="laptopId is required")
                if not description:
                    raise HTTPException(status_code=400, detail="description is required")
                if severity not in {"P1", "P2", "P3"}:
                    severity = "P2"

                run_id_int: Optional[int] = None
                if run_id_raw is not None:
                    try:
                        run_id_int = int(run_id_raw)
                    except (TypeError, ValueError):
                        pass

                cur.execute(
                    f"""
                    INSERT INTO {DB_SCHEMA}.issue_log
                    (laptop_id, run_id, issue_description, severity, reported_by)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING issue_id, laptop_id, run_id, issue_description, severity,
                              reported_by, reported_at, status
                    """,
                    (laptop_id, run_id_int, description, severity, reported_by),
                )
                row = cur.fetchone()
                conn.commit()
                return {
                    "status": "success",
                    "type": type_name,
                    "issue": _normalize_rows([row])[0] if row else None,
                }

            if type_name == "resolveIssueLog":
                issue_id = _parse_int(_payload_get(payload, "issueId"), "issueId")
                resolution_action = str(_payload_get(payload, "resolutionAction") or "").strip()
                resolved_by = str(_payload_get(payload, "resolvedBy", "updatedBy") or "system").strip()
                new_status = str(_payload_get(payload, "status") or "RESOLVED").strip().upper()

                if not resolution_action:
                    raise HTTPException(status_code=400, detail="resolutionAction is required")
                if new_status not in {"RESOLVED", "CLOSED", "IN_PROGRESS"}:
                    new_status = "RESOLVED"

                cur.execute(
                    f"""
                    UPDATE {DB_SCHEMA}.issue_log
                    SET resolution_action = %s,
                        resolved_at = now(),
                        status = %s
                    WHERE issue_id = %s
                    RETURNING issue_id, laptop_id, status, resolution_action, resolved_at
                    """,
                    (resolution_action, new_status, issue_id),
                )
                row = cur.fetchone()
                if not row:
                    raise HTTPException(status_code=404, detail="issueId not found")
                conn.commit()
                return {
                    "status": "success",
                    "type": type_name,
                    "issue": _normalize_rows([row])[0] if row else None,
                }

            if type_name == "email-webhook":
                sender = str(payload.get("Sender") or "").strip()
                subject = str(payload.get("Subject") or "").strip()
                text_part = str(payload.get("Text-part") or payload.get("TextPart") or "").strip()
                
                parsed_data = _parse_ngo_request_with_ai(text_part)
                email = str(parsed_data.get("email") or sender or "").strip()
                
                cur.execute(
                    f"""
                    INSERT INTO {DB_SCHEMA}.ngo_requests
                    (ngo_name, laptop_quantity, location, use_case, contact_name, email, status)
                    VALUES (%s, %s, %s, %s, %s, %s, 'draft')
                    RETURNING id
                    """,
                    (
                        parsed_data["ngo_name"],
                        parsed_data["laptop_quantity"],
                        parsed_data["location"],
                        parsed_data["use_case"],
                        parsed_data["contact_name"],
                        email,
                    )
                )
                new_id = cur.fetchone()["id"]
                conn.commit()
                return {
                    "status": "success",
                    "type": type_name,
                    "id": new_id,
                    "parsed": parsed_data
                }

    raise HTTPException(status_code=501, detail=f"type '{type_name}' not implemented in RDS backend")


def _query_laptop_stage_snapshot(request: Request) -> Dict[str, Any]:
    laptop_id = (request.query_params.get("laptopId") or "").strip()
    if not laptop_id:
        raise HTTPException(status_code=400, detail="laptopId is required")

    with get_conn() as conn:
        with conn.cursor() as cur:
            # 1. Laptop row + current stage metadata
            cur.execute(
                f"""
                SELECT
                    ll.id AS "laptopId",
                    ll.status AS "currentStageCode",
                    sd.stage_id AS "currentStageId",
                    sd.stage_name AS "currentStageName",
                    sd.display_order AS "currentStageOrder",
                    sd.sla_hours AS "slaHours",
                    sd.responsible_role AS "responsibleRole",
                    sd.verifier_role AS "verifierRole",
                    ll.last_updated_on AS "lastUpdatedOn",
                    ll.last_updated_by AS "lastUpdatedBy",
                    ll.manufacturer_model AS "model",
                    ll.ram AS "ram",
                    ll.rom AS "rom",
                    ll.processor AS "processor",
                    ll.inventory_location AS "inventoryLocation",
                    COALESCE(d.donor_company, ll.donor_company_name) AS "donorCompany"
                FROM {DB_SCHEMA}.laptop_labeling ll
                LEFT JOIN {DB_SCHEMA}.stage_definition sd
                  ON sd.stage_code = ll.status AND sd.is_active = TRUE
                LEFT JOIN {DB_SCHEMA}.{DONOR_TABLE} d ON d.donor_id = ll.donor_id
                WHERE ll.id = %s
                LIMIT 1
                """,
                (laptop_id,),
            )
            laptop_row = cur.fetchone()
            if not laptop_row:
                raise HTTPException(status_code=404, detail="Laptop not found")
            laptop = _normalize_rows([laptop_row])[0]

            current_stage_code = str(laptop.get("currentStageCode") or "")

            # 2. Active IN_PROGRESS run for the current stage
            active_run = None
            pending_mandatory_items: List[Dict[str, Any]] = []
            if current_stage_code:
                cur.execute(
                    f"""
                    SELECT
                        run_id AS "runId",
                        stage_id AS "stageId",
                        stage_code AS "stageCode",
                        run_number AS "runNumber",
                        outcome AS "outcome",
                        started_by AS "startedBy",
                        started_at AS "startedAt",
                        notes AS "notes"
                    FROM {DB_SCHEMA}.laptop_stage_run
                    WHERE laptop_id = %s
                      AND stage_code = %s
                      AND outcome = 'IN_PROGRESS'
                    ORDER BY run_number DESC
                    LIMIT 1
                    """,
                    (laptop_id, current_stage_code),
                )
                run_row = cur.fetchone()
                if run_row:
                    active_run = _normalize_rows([run_row])[0]
                    run_id = active_run["runId"]
                    stage_id_for_query = active_run["stageId"]

                    # 3. Pending mandatory items for this active run
                    cur.execute(
                        f"""
                        SELECT
                            i.item_id AS "itemId",
                            i.item_code AS "itemCode",
                            i.item_text AS "itemText",
                            s.section_code AS "sectionCode",
                            s.section_name AS "sectionName",
                            resp.result AS "result"
                        FROM {DB_SCHEMA}.checklist_section s
                        JOIN {DB_SCHEMA}.checklist_item i
                          ON i.section_id = s.section_id AND i.is_active = TRUE
                        LEFT JOIN {DB_SCHEMA}.checklist_response resp
                          ON resp.run_id = %s AND resp.item_id = i.item_id
                        WHERE s.stage_id = %s
                          AND s.is_active = TRUE
                          AND i.is_mandatory = TRUE
                          AND (resp.response_id IS NULL OR resp.result != 'PASS')
                        ORDER BY s.display_order, i.display_order
                        """,
                        (run_id, stage_id_for_query),
                    )
                    pending_mandatory_items = _normalize_rows(cur.fetchall() or [])

            # 4. Three most recent failed/blocked runs for this laptop
            cur.execute(
                f"""
                SELECT
                    r.run_id AS "runId",
                    r.stage_code AS "stageCode",
                    sd.stage_name AS "stageName",
                    r.run_number AS "runNumber",
                    r.outcome AS "outcome",
                    r.started_by AS "startedBy",
                    r.completed_by AS "completedBy",
                    r.started_at AS "startedAt",
                    r.completed_at AS "completedAt",
                    r.notes AS "notes"
                FROM {DB_SCHEMA}.laptop_stage_run r
                LEFT JOIN {DB_SCHEMA}.stage_definition sd ON sd.stage_code = r.stage_code
                WHERE r.laptop_id = %s
                  AND r.outcome IN ('FAIL', 'BLOCKED')
                ORDER BY r.completed_at DESC NULLS LAST, r.run_id DESC
                LIMIT 3
                """,
                (laptop_id,),
            )
            recent_failures = _normalize_rows(cur.fetchall() or [])

            # 5. Open issue logs for this laptop
            cur.execute(
                f"""
                SELECT
                    issue_id AS "issueId",
                    laptop_id AS "laptopId",
                    run_id AS "runId",
                    issue_description AS "description",
                    severity AS "severity",
                    reported_by AS "reportedBy",
                    reported_at AS "reportedAt",
                    status AS "status"
                FROM {DB_SCHEMA}.issue_log
                WHERE laptop_id = %s
                  AND status IN ('OPEN', 'IN_PROGRESS')
                ORDER BY reported_at DESC
                LIMIT 5
                """,
                (laptop_id,),
            )
            open_issues = _normalize_rows(cur.fetchall() or [])

    return {
        "laptop": laptop,
        "activeRun": active_run,
        "pendingMandatoryItems": pending_mandatory_items,
        "recentFailures": recent_failures,
        "openIssues": open_issues,
    }


def _query_failed_gate_queue() -> List[Dict[str, Any]]:
    sql = f"""
        SELECT DISTINCT ON (ll.id)
            ll.id AS "laptopId",
            ll.status AS "currentStageCode",
            r.run_id AS "runId",
            r.run_number AS "runNumber",
            r.outcome AS "outcome",
            r.stage_code AS "stageCode",
            sd.stage_name AS "stageName",
            r.started_by AS "startedBy",
            r.completed_by AS "completedBy",
            r.completed_at AS "completedAt",
            r.notes AS "notes",
            COALESCE(d.donor_company, ll.donor_company_name) AS "donorCompany",
            ll.manufacturer_model AS "model",
            ll.inventory_location AS "inventoryLocation"
        FROM {DB_SCHEMA}.laptop_labeling ll
        JOIN {DB_SCHEMA}.laptop_stage_run r
          ON r.laptop_id = ll.id
         AND r.stage_code = ll.status
         AND r.outcome IN ('FAIL', 'BLOCKED')
        LEFT JOIN {DB_SCHEMA}.stage_definition sd ON sd.stage_code = ll.status
        LEFT JOIN {DB_SCHEMA}.{DONOR_TABLE} d ON d.donor_id = ll.donor_id
        WHERE NOT EXISTS (
            SELECT 1 FROM {DB_SCHEMA}.laptop_stage_run r2
            WHERE r2.laptop_id = ll.id
              AND r2.stage_code = ll.status
              AND r2.outcome = 'IN_PROGRESS'
        )
        ORDER BY ll.id, r.run_id DESC
    """
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql)
            return _normalize_rows(cur.fetchall() or [])


def _query_issue_logs(request: Request) -> List[Dict[str, Any]]:
    laptop_id = (request.query_params.get("laptopId") or "").strip()
    run_id_raw = request.query_params.get("runId")
    status_filter = (request.query_params.get("status") or "").strip().upper()

    sql = f"""
        SELECT
            issue_id AS "issueId",
            laptop_id AS "laptopId",
            run_id AS "runId",
            issue_description AS "description",
            severity AS "severity",
            reported_by AS "reportedBy",
            reported_at AS "reportedAt",
            resolution_action AS "resolutionAction",
            resolved_at AS "resolvedAt",
            status AS "status"
        FROM {DB_SCHEMA}.issue_log
        WHERE 1=1
    """
    params: List[Any] = []

    if laptop_id:
        sql += " AND laptop_id = %s"
        params.append(laptop_id)
    if run_id_raw:
        sql += " AND run_id = %s"
        params.append(_parse_int(run_id_raw, "runId"))
    if status_filter in {"OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"}:
        sql += " AND status = %s"
        params.append(status_filter)

    sql += " ORDER BY reported_at DESC, issue_id DESC"

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            return _normalize_rows(cur.fetchall() or [])


def _save_public_inquiry(payload: Dict[str, Any]) -> Dict[str, Any]:
    form_type = str(payload.get("formType") or "").strip().lower()
    if form_type not in {"email", "community", "corporate", "government", "contact", "callback", "newsletter"}:
        raise HTTPException(status_code=400, detail="Unsupported public form type")

    with get_conn() as conn:
        with conn.cursor() as cur:
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
                    payload.get("firstName"),
                    payload.get("lastName"),
                    payload.get("companyName"),
                    payload.get("phone"),
                    payload.get("state"),
                    payload.get("city"),
                    payload.get("message"),
                    json.dumps(payload),
                ),
            )
            inquiry_id = cur.fetchone()["id"]
            conn.commit()

    return {"status": "success", "databaseId": inquiry_id}


def _ngo_operation_key(payload: Dict[str, Any], params: Optional[Dict[str, Any]] = None) -> str:
    values = payload if payload else (params or {})
    return str(values.get("id") or values.get("Id") or values.get("month") or "default")


def _save_ngo_operation(operation: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    ngo_id = payload.get("ngoId") or payload.get("userId") or payload.get("id") or payload.get("Id")
    record_key = _ngo_operation_key(payload)
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"""
                INSERT INTO {DB_SCHEMA}.ngo_operation_records
                (operation, ngo_id, record_key, payload)
                VALUES (%s, %s, %s, %s::jsonb)
                ON CONFLICT (operation, ngo_id, record_key)
                DO UPDATE SET payload = EXCLUDED.payload, updated_at = now()
                RETURNING record_id
                """,
                (operation, str(ngo_id) if ngo_id is not None else None, record_key, json.dumps(payload)),
            )
            record_id = cur.fetchone()["record_id"]
            conn.commit()
    return {"status": "success", "type": operation, "recordId": record_id}


def _query_ngo_operation(operation: str, params: Dict[str, Any]) -> Any:
    ngo_id = params.get("ngoId") or params.get("userId") or params.get("id") or params.get("ngoId")
    operation_filter = (
        "operation IN ('MultipleDocsUpload', 'MultipleDocsUpdate', 'NewMultipleDocsUpload', 'updateDocStatus')"
        if operation == "MultipleDocsGet"
        else "operation = %s"
    )
    with get_conn() as conn:
        with conn.cursor() as cur:
            try:
                cur.execute(
                    f"""
                    SELECT payload
                    FROM {DB_SCHEMA}.ngo_operation_records
                    WHERE {operation_filter} AND (%s::TEXT IS NULL OR ngo_id = %s)
                    ORDER BY updated_at DESC, record_id DESC
                    """,
                    ((operation,) if operation != "MultipleDocsGet" else ())
                    + (str(ngo_id) if ngo_id else None, str(ngo_id) if ngo_id else None),
                )
            except Exception as exc:
                # If the table is missing, create it and retry the query.
                # Support both psycopg and psycopg2 error types, and fallback to message check.
                try:
                    from psycopg.errors import UndefinedTable as _UndefinedTable  # type: ignore
                except Exception:
                    try:
                        from psycopg2 import errors as _pg_errors  # type: ignore
                        _UndefinedTable = getattr(_pg_errors, "UndefinedTable", None)
                    except Exception:
                        _UndefinedTable = None

                is_undefined_table = False
                if _UndefinedTable is not None and isinstance(exc, _UndefinedTable):
                    is_undefined_table = True
                elif "does not exist" in str(exc).lower():
                    is_undefined_table = True

                if is_undefined_table:
                    # Create the required table and index if they don't exist, then retry.
                    cur.execute(
                        f"""
                        CREATE TABLE IF NOT EXISTS {DB_SCHEMA}.ngo_operation_records (
                            record_id BIGSERIAL PRIMARY KEY,
                            operation TEXT NOT NULL,
                            ngo_id TEXT,
                            record_key TEXT NOT NULL DEFAULT 'default',
                            payload JSONB NOT NULL,
                            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                            UNIQUE (operation, ngo_id, record_key)
                        );
                        CREATE INDEX IF NOT EXISTS idx_ngo_operation_records_lookup
                            ON {DB_SCHEMA}.ngo_operation_records (operation, ngo_id, updated_at DESC);
                        """
                    )
                    conn.commit()
                    # Retry the original select
                    cur.execute(
                        f"""
                        SELECT payload
                        FROM {DB_SCHEMA}.ngo_operation_records
                        WHERE {operation_filter} AND (%s::TEXT IS NULL OR ngo_id = %s)
                        ORDER BY updated_at DESC, record_id DESC
                        """,
                        ((operation,) if operation != "MultipleDocsGet" else ())
                        + (str(ngo_id) if ngo_id else None, str(ngo_id) if ngo_id else None),
                    )
                else:
                    # Unknown error - re-raise
                    raise

            rows = [row["payload"] for row in cur.fetchall()]
    if operation == "MultipleDocsGet":
        documents: Dict[str, Any] = {}
        for payload in rows:
            for file_item in payload.get("files", []) if isinstance(payload, dict) else []:
                name = file_item.get("category") or file_item.get("name")
                if name:
                    documents[name] = {
                        "link": file_item.get("file") or file_item.get("link") or "",
                        "status": file_item.get("status") or "Pending Verification",
                        "description": file_item.get("description") or "",
                    }
        return documents
    if operation == "manageStatus":
        return rows
    if operation in {"Monthly", "Yearly"}:
        return rows[0] if rows else {"status": "success", "questions": []}
    if operation in {"GetMonthlyReport", "GetYearlyReport"}:
        return {"status": "success", "data": rows}
    return {"status": "success", "data": rows}


@app.post("/evidence-upload")
async def evidence_upload(file: UploadFile = File(...)) -> Dict[str, Any]:
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="file is required")

    settings = _get_s3_settings()
    client = _get_s3_client()

    _, ext = os.path.splitext(os.path.basename(file.filename))
    ext = ext.lower()
    key = f"{settings['prefix']}evidence/{datetime.utcnow().strftime('%Y%m%d')}/{uuid.uuid4().hex}{ext}"

    extra_args: Dict[str, Any] = {}
    if file.content_type:
        extra_args["ContentType"] = file.content_type

    try:
        client.upload_fileobj(file.file, settings["bucket"], key, ExtraArgs=extra_args or None)
        url = _presign_s3_get(client, settings["bucket"], key, settings["expires"])
    except ClientError as exc:
        raise HTTPException(status_code=500, detail=f"S3 upload failed: {exc}") from exc
    finally:
        try:
            await file.close()
        except Exception:
            pass

    return {
        "key": key,
        "url": url,
        "contentType": file.content_type,
    }


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


def _log_email_to_file(to_email: str, subject: str, html_part: str, cc: list = None):
    try:
        import datetime
        import re
        scratch_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "scratch")
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


def _send_email_common(to_email: str, subject: str, html_part: str, cc: list = None, attachments: list = None, to_name: str = "", from_email: str = None, from_name: str = None):
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
    ops_email = os.environ.get("SAMA_OPS_EMAIL", "operations@thesama.in")
    afe_email = os.environ.get("AMAZON_AFE_EMAIL", "afe-team@amazon.com")
    subject = f"[INTERNAL ONLY] AFE Request Approved for {ngo_name}"
    html_part = f"""
        <p>Dear Sama Team,</p>
        <p>This is to confirm that the laptop request from <strong>{ngo_name}</strong> has been internally approved.</p>
        <p><strong>Approved Quantity:</strong> {qty_approved} laptops</p>
        <p><strong>Approver:</strong> {approver_name}</p>
        <p>Sama Operations team will now take ownership, assign a refurbishment completion timeline, and begin the refurbishment process.</p>
        <p>Best regards,<br/>Amazon AFE Team</p>
    """
    _send_email_common(
        to_email=ops_email,
        subject=subject,
        html_part=html_part,
        to_name="Sama Operations",
        from_name="Amazon AFE Team",
        from_email=afe_email
    )


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
        from_email="product@thesama.in"
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


@app.get("/api/afe/inventory-summary")
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

@app.get("/ngo-exec")
def ngo_exec_get(request: Request) -> Any:
    params = dict(request.query_params)
    org_filter = params.get("orgName")
    type_name = params.get("type")

    if type_name in {
        "manageStatus", "Monthly", "Yearly", "GetMonthlyReport", "GetYearlyReport",
        "GetMou", "getMonthlyStatusUpdate"
    }:
        return _query_ngo_operation(type_name, params)

    if type_name in ("donorQuestion", "question", "monthlyquestion", "yearlyQuestion", "donorID"):
        try:
            with get_conn() as conn:
                with conn.cursor() as cur:
                    if type_name == "donorID":
                        cur.execute(f"SELECT donor_id, questions_list_id, donner FROM {DB_SCHEMA}.ngo_data_doner")
                        rows = cur.fetchall()
                        data = []
                        for r in rows:
                            data.append({
                                "Donor id": r["donor_id"],
                                "Questions List ID": r["questions_list_id"],
                                "Donner": r["donner"]
                            })
                        return {"status": "success", "data": data}
                    elif type_name in ("donorQuestion", "question"):
                        cur.execute(f"SELECT questions_id, questions, options, type, name FROM {DB_SCHEMA}.ngo_data_questions ORDER BY cast(questions_id as float)")
                        rows = cur.fetchall()
                        data = []
                        for r in rows:
                            opts = None
                            if r["options"]:
                                opts = [opt.strip() for opt in str(r["options"]).split(";") if opt.strip()]
                            data.append({
                                "id": r["questions_id"],
                                "question": r["questions"],
                                "options": opts,
                                "type": r["type"],
                                "name": r["name"]
                            })
                        return {"status": "success", "data": data}
                    elif type_name == "monthlyquestion":
                        cur.execute(f"SELECT ngoid, question, type FROM {DB_SCHEMA}.ngo_data_monthlyquestion")
                        rows = cur.fetchall()
                        return {"status": "success", "data": rows}
                    elif type_name == "yearlyQuestion":
                        cur.execute(f"SELECT ngoid, question, type FROM {DB_SCHEMA}.ngo_data_yearlyquestion")
                        rows = cur.fetchall()
                        return {"status": "success", "data": rows}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    if params.get("type") == "laptopinfo":
        ngo_id = (params.get("id") or "").strip()
        if not ngo_id:
            raise HTTPException(status_code=400, detail="id is required")

        try:
            with get_conn() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        f"""
                        SELECT organization_name
                        FROM {DB_SCHEMA}.external_registered_ngo
                        WHERE lower(id) = lower(%s)
                        LIMIT 1
                        """,
                        (ngo_id,),
                    )
                    ngo = cur.fetchone()
                    ngo_name = ngo["organization_name"] if ngo else ""

                    cur.execute(
                        f"""
                        SELECT
                            l.id,
                            l.date_committed,
                            l.donor_company_name,
                            l.ram,
                            l.rom,
                            l.manufacturer_model,
                            l.processor,
                            l.condition_status,
                            l.inventory_location,
                            l.status,
                            l.battery_capacity,
                            l.allocated_to,
                            l.assigned_to,
                            l.last_updated_on,
                            l.major_issues,
                            l.minor_issues,
                            l.comment_for_issues,
                            l.batch
                        FROM {DB_SCHEMA}.laptop_labeling l
                                                WHERE trim(coalesce(l.allocated_to, '')) <> ''
                                                    AND lower(l.allocated_to) IN (lower(%s), lower(%s))
                        ORDER BY l.id
                        """,
                                (ngo_id, ngo_name),
                    )
                    rows = cur.fetchall()

            def split_issues(value: Optional[str]) -> List[str]:
                if not value:
                    return []
                return [item.strip() for item in str(value).split(",") if item.strip()]

            laptops = []
            for row in rows:
                laptops.append({
                    "ID": row["id"],
                    "Date": row["date_committed"].isoformat() if row["date_committed"] else "",
                    "Donor Company Name": row["donor_company_name"] or "",
                    "RAM": row["ram"] or "",
                    "ROM": row["rom"] or "",
                    "Manufacturer Model": row["manufacturer_model"] or "",
                    "Processor": row["processor"] or "",
                    "Condition Status": row["condition_status"] or "",
                    "Inventory Location": row["inventory_location"] or "",
                    "Status": row["status"] or "",
                    "Battery Capacity": row["battery_capacity"],
                    "Date of laptop Assignment": row["last_updated_on"].isoformat() if row["last_updated_on"] else "",
                    "MajorIssue": split_issues(row["major_issues"]),
                    "MinorIssue": split_issues(row["minor_issues"]),
                    "Comment for the Issues": row["comment_for_issues"] or "",
                    "Batch": row["batch"] or "",
                })

            return {"status": "success", "laptops": laptops}
        except Exception as db_e:
            print(f"Error loading NGO laptops from DB: {db_e}")
            raise HTTPException(status_code=500, detail="Database query error")

    if params.get("type") == "MultipleDocsGet":
        user_id = (params.get("userId") or "").strip()
        if not user_id:
            raise HTTPException(status_code=400, detail="userId is required")

        try:
            with get_conn() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        f"""
                        SELECT user_id, ngo_name, n_12a_registration, status, discription,
                               n_80g_certification, status_2, discription_2,
                               certificate_of_incorporation_coi, status_3, discription_3,
                               fcra_approval, status_4, discription_4,
                               financial_report_fy_2021_22, status_5, col_17,
                               financial_report_fy_2022_23, status_6, discription_5,
                               financial_report_fy_2023_24, status_7, discription_6,
                               subfolderid
                        FROM {DB_SCHEMA}.ngo_data_ngo_uploaded_docs
                        WHERE lower(user_id) = lower(%s)
                        LIMIT 1
                        """,
                        (user_id,),
                    )
                    row = cur.fetchone()

            if not row:
                stored_documents = _query_ngo_operation("MultipleDocsGet", {"userId": user_id})
                if stored_documents:
                    return {"isDataAvailable": True, "User-Id": user_id, **stored_documents}
                return {"isDataAvailable": False, "User-Id": user_id}

            def document(link: Optional[str], status: Optional[str], description: Optional[str]) -> Dict[str, Any]:
                return {
                    "link": link or "",
                    "status": status or "",
                    "description": description or "",
                }

            return {
                "isDataAvailable": True,
                "User-Id": row["user_id"],
                "NGO Name": row["ngo_name"] or "",
                "subfolderId": row["subfolderid"] or "",
                "12A Registration": document(row["n_12a_registration"], row["status"], row["discription"]),
                "80G Certification": document(row["n_80g_certification"], row["status_2"], row["discription_2"]),
                "Certificate of Incorporation (COI)": document(row["certificate_of_incorporation_coi"], row["status_3"], row["discription_3"]),
                "FCRA Approval": document(row["fcra_approval"], row["status_4"], row["discription_4"]),
                "Financial Report FY 2021-22": document(row["financial_report_fy_2021_22"], row["status_5"], row["col_17"]),
                "Financial Report FY 2022-23": document(row["financial_report_fy_2022_23"], row["status_6"], row["discription_5"]),
                "Financial Report FY 2023-24": document(row["financial_report_fy_2023_24"], row["status_7"], row["discription_6"]),
            }
        except Exception as db_e:
            print(f"Error loading NGO documents from DB: {db_e}")
            raise HTTPException(status_code=500, detail="Database query error")
    
    if params.get("type") == "registration":
        data_json = {"status": "success", "data": []}
        try:
            with get_conn() as conn:
                with conn.cursor() as cur:
                    query = f"""
                        SELECT id, organization_name, registration_number, primary_contact_name, contact_number,
                               email, operating_state, location, years_operating, focus_area, works_with_women,
                               infrastructure, beneficiary_selection, beneficiaries_count, age_group, primary_use,
                               expected_outcome, laptop_tracking, jobs_created, previous_projects, sufficient_staff,
                               impact_report, status, ngo_type, laptop_require, doner, request_type, ngo_requests
                        FROM {DB_SCHEMA}.external_registered_ngo
                        ORDER BY id ASC
                    """
                    cur.execute(query)
                    rows = cur.fetchall()
                    data_list = []
                    for r in rows:
                        data_list.append({
                            "Id": r["id"],
                            "organizationName": r["organization_name"] or "",
                            "registrationNumber": r["registration_number"] or "",
                            "primaryContactName": r["primary_contact_name"] or "",
                            "contactNumber": r["contact_number"] or "",
                            "email": r["email"] or "",
                            "operatingState": r["operating_state"] or "",
                            "location": r["location"],
                            "yearsOperating": r["years_operating"],
                            "focusArea": r["focus_area"],
                            "worksWithWomen": r["works_with_women"],
                            "infrastructure": r["infrastructure"],
                            "beneficiarySelection": r["beneficiary_selection"],
                            "beneficiariesCount": r["beneficiaries_count"],
                            "ageGroup": r["age_group"],
                            "primaryUse": r["primary_use"],
                            "expectedOutcome": r["expected_outcome"],
                            "laptopTracking": r["laptop_tracking"],
                            "jobsCreated": r["jobs_created"],
                            "previousProjects": r["previous_projects"],
                            "sufficientStaff": r["sufficient_staff"],
                            "impactReport": r["impact_report"],
                            "Status": r["status"],
                            "Ngo Type": r["ngo_type"],
                            "Laptop require": r["laptop_require"],
                            "Doner": r["doner"],
                            "requestType": r["request_type"],
                            "NGORequests": json.loads(r["ngo_requests"]) if r["ngo_requests"] else ""
                        })
                    data_json["data"] = data_list
        except Exception as db_e:
            print(f"Error loading registrations from DB: {db_e}")
            raise HTTPException(status_code=500, detail="Database query error")
            
        try:
            with get_conn() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        f"""
                        SELECT id, ngo_name, laptop_quantity, location, use_case, contact_name, email, status, tentative_refurb_completion, donor,
                               partner_type, date_received, attached_email_link, approver_name, approved_quantity,
                               dispatch_location, expected_delivery_days, dispatch_date, delivery_date, last_impact_report_date,
                               operating_state, years_operating, focus_area, infrastructure, beneficiaries_count, age_group, expected_outcome, laptop_tracking
                        FROM {DB_SCHEMA}.ngo_requests
                        ORDER BY id DESC
                        """
                    )
                    draft_rows = cur.fetchall()
                    # Determine the base serial number based on the HIGHEST existing ID
                    max_serial = 0
                    for x in data_json.get("data", []):
                        id_str = str(x.get("Id", ""))
                        if id_str.startswith("SAM-"):
                            try:
                                max_serial = max(max_serial, int(id_str.split("-")[-1]))
                            except ValueError:
                                pass
                    current_serial = max_serial
                    
                    draft_list = []
                    # We sort by id ASC so the oldest request gets the first sequential serial number
                    for r in draft_rows:
                        status_val = r["status"]
                        ngo_name = r["ngo_name"]
                        qty_requested = r["laptop_quantity"]
                        location_val = r["location"]
                        use_case_val = r["use_case"]
                        contact_name_val = r["contact_name"]
                        email_val = r["email"]
                        db_id = r["id"]
                        
                        current_serial += 1
                        display_id = f"SAM-{current_serial}"
                        
                        draft_list.append({
                            "Id": display_id,
                            "displayId": display_id,
                            "db_id": db_id,
                            "organizationName": ngo_name,
                            "Laptop require": qty_requested,
                            "location": location_val,
                            "primaryUse": use_case_val,
                            "primaryContactName": contact_name_val,
                            "email": email_val,
                            "Status": status_val.capitalize() if status_val == "draft" else status_val,
                            "registrationNumber": "",
                            "contactNumber": "",
                            "operatingState": r["operating_state"] or "",
                            "yearsOperating": r["years_operating"] or "",
                            "focusArea": r["focus_area"] or "",
                            "worksWithWomen": "",
                            "infrastructure": r["infrastructure"] or "",
                            "beneficiarySelection": "",
                            "beneficiariesCount": r["beneficiaries_count"] or "",
                            "ageGroup": r["age_group"] or "",
                            "laptopTracking": r["laptop_tracking"] or "",
                            "tentative_refurb_completion": str(r["tentative_refurb_completion"]) if r["tentative_refurb_completion"] else None,
                            "partner_type": r["partner_type"] or "External Partner",
                            "date_received": str(r["date_received"]) if r["date_received"] else None,
                            "attached_email_link": r["attached_email_link"] or "",
                            "approver_name": r["approver_name"] or "",
                            "approved_quantity": r["approved_quantity"] or 0,
                            "dispatch_location": r["dispatch_location"] or "",
                            "expected_delivery_days": r["expected_delivery_days"] or 0,
                            "dispatch_date": str(r["dispatch_date"]) if r["dispatch_date"] else None,
                            "delivery_date": str(r["delivery_date"]) if r["delivery_date"] else None,
                            "last_impact_report_date": str(r["last_impact_report_date"]) if r["last_impact_report_date"] else None,
                        })
                    
                    draft_list.reverse()
                    all_data = draft_list + data_json.get("data", [])
                    
                    if org_filter:
                        data_json["data"] = [x for x in all_data if str(x.get("Id", "")) == org_filter or str(x.get("displayId", "")) == org_filter]
                    else:
                        data_json["data"] = all_data
        except Exception as e:
            print(f"Error merging ngo_requests drafts: {e}")
        return data_json
    else:
        raise HTTPException(
            status_code=501,
            detail=f"NGO operation '{params.get('type') or 'unknown'}' is not implemented in the database backend",
        )
        
        # Remove orgName from params sent to Google API so we always fetch the FULL list.
        # This is required so we can accurately count len(data) for dynamic ID assignment!
        if "orgName" in params:
            del params["orgName"]
            
        timeout = httpx.Timeout(300.0)
        try:
            with httpx.Client(timeout=timeout, follow_redirects=True) as client:
                response = client.get(LEGACY_NGO_API_URL, params=params)
        except httpx.RequestError as e:
            raise HTTPException(status_code=504, detail=f"Upstream API error: {str(e)}")
        
        data_json = None
        try:
            data_json = response.json()
        except Exception:
            try:
                data_json = json.loads(response.text)
            except Exception:
                pass
        if not isinstance(data_json, dict) or "data" not in data_json:
            data_json = {"status": "success", "data": []}
            
        try:
            with get_conn() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        f"""
                        SELECT id, ngo_name, laptop_quantity, location, use_case, contact_name, email, status, tentative_refurb_completion, donor,
                               partner_type, date_received, attached_email_link, approver_name, approved_quantity,
                               dispatch_location, expected_delivery_days, dispatch_date, delivery_date, last_impact_report_date,
                               operating_state, years_operating, focus_area, infrastructure, beneficiaries_count, age_group, expected_outcome, laptop_tracking
                        FROM {DB_SCHEMA}.ngo_requests
                        ORDER BY id DESC
                        """
                    )
                    draft_rows = cur.fetchall()
                    # Determine the base serial number based on the HIGHEST existing ID
                    max_serial = 0
                    for x in data_json.get("data", []):
                        id_str = str(x.get("Id", ""))
                        if id_str.startswith("SAM-"):
                            try:
                                max_serial = max(max_serial, int(id_str.split("-")[-1]))
                            except ValueError:
                                pass
                    current_serial = max_serial
                    
                    draft_list = []
                    # We sort by id ASC so the oldest request gets the first sequential serial number
                    draft_rows = sorted(draft_rows, key=lambda x: x['id'])
                    
                    for r in draft_rows:
                        db_status = str(r['status'] or 'Draft').strip()
                        display_status = db_status.capitalize() if db_status == 'draft' else db_status
                        
                        id_prefix = "DRAFT-"
                        dynamic_display_id = ""
                        
                        if display_status in ["Submitted Request", "Approved", "Dispatched", "Delivered"]:
                            current_serial += 1
                            if display_status == "Submitted Request":
                                dynamic_display_id = f"SAM-D{current_serial}"
                            else:
                                dynamic_display_id = f"SAM-{current_serial}"
                        
                        db_contact = r["contact_name"] or ""
                        if "|" in db_contact:
                            parts = db_contact.split("|", 1)
                            c_name = parts[0].strip()
                            c_num = parts[1].strip()
                        else:
                            c_name, c_num = db_contact, ""
                            
                        db_ngo_name = r["ngo_name"] or ""
                        display_id = dynamic_display_id
                        stored_display_id = None
                        
                        # If it's an additional request for an existing NGO, it has an explicit display ID stored
                        if "||" in db_ngo_name:
                            real_ngo_name, stored_display_id = db_ngo_name.split("||", 1)
                            
                            # Auto-convert DRAFT tags to SAM tags if the request progresses
                            if stored_display_id.startswith("DRAFT-") and display_status in ["Submitted Request", "Approved", "Dispatched", "Delivered"]:
                                draft_num = stored_display_id.replace("DRAFT-", "")
                                if display_status == "Submitted Request":
                                    display_id = f"SAM-D{draft_num}"
                                else:
                                    display_id = f"SAM-{draft_num}"
                            else:
                                display_id = stored_display_id
                                
                            # It doesn't consume a new serial number since it already belongs to an existing NGO,
                            # so we roll back the counter we just incremented.
                            if display_status in ["Submitted Request", "Approved", "Dispatched", "Delivered"]:
                                current_serial -= 1
                        else:
                            real_ngo_name = db_ngo_name
                            
                        actual_id = f"{id_prefix}{r['id']}"
                        
                        # FILTERING LOGIC for detail page
                        if org_filter:
                            if actual_id != org_filter and display_id != org_filter:
                                continue
                            
                        draft_list.append({
                            "Id": actual_id,
                            "displayId": display_id,
                            "organizationName": real_ngo_name,
                            "primaryContactName": c_name,
                            "contactNumber": c_num,
                            "email": r["email"] or "",
                            "location": r["location"] or "",
                            "Status": display_status,
                            "primaryUse": r["use_case"] or "",
                            "expectedOutcome": r["expected_outcome"] or r["use_case"] or "",
                            "Laptop require": r["laptop_quantity"] or 0,
                            "Ngo Type": "",
                            "Doner": r["donor"] or "",
                            "operatingState": r["operating_state"] or "",
                            "yearsOperating": r["years_operating"] or "",
                            "focusArea": r["focus_area"] or "",
                            "infrastructure": r["infrastructure"] or "",
                            "beneficiariesCount": r["beneficiaries_count"] or "",
                            "ageGroup": r["age_group"] or "",
                            "laptopTracking": r["laptop_tracking"] or "",
                            "tentative_refurb_completion": str(r["tentative_refurb_completion"]) if r["tentative_refurb_completion"] else None,
                            "partner_type": r["partner_type"] or "External Partner",
                            "date_received": str(r["date_received"]) if r["date_received"] else None,
                            "attached_email_link": r["attached_email_link"] or "",
                            "approver_name": r["approver_name"] or "",
                            "approved_quantity": r["approved_quantity"] or 0,
                            "dispatch_location": r["dispatch_location"] or "",
                            "expected_delivery_days": r["expected_delivery_days"] or 0,
                            "dispatch_date": str(r["dispatch_date"]) if r["dispatch_date"] else None,
                            "delivery_date": str(r["delivery_date"]) if r["delivery_date"] else None,
                            "last_impact_report_date": str(r["last_impact_report_date"]) if r["last_impact_report_date"] else None,
                        })
                    
                    if org_filter:
                        # Filter the legacy data to only include the requested orgName
                        filtered_legacy = [x for x in data_json.get("data", []) if str(x.get("Id", "")) == org_filter or str(x.get("displayId", "")) == org_filter]
                        
                        # For detail page, maintain chronological order (oldest/main first) and append after legacy data
                        data_json["data"] = filtered_legacy + draft_list
                    else:
                        # For dashboard, reverse so newest appears first
                        draft_list.reverse()
                        data_json["data"] = draft_list + data_json["data"]
        except Exception as e:
            print(f"Error merging ngo_requests drafts: {e}")
        return data_json
        
    if params.get("type") == "donorQuestion":
        return data_json if data_json is not None else {"status": "proxied", "raw": response.text}
        
    return {"status": "proxied", "raw": response.text}

 
@app.post("/ngo-exec")
async def ngo_exec_post(request: Request) -> Any:
    try:
        payload = await request.json()
        if not isinstance(payload, dict):
            payload = {}
    except Exception:
        payload = {}
         
    type_name = _type_from_request(request, payload)
     
    # Intercept new NGO requirements submissions from the web form
    ngo_id = payload.get("id")
    if type_name == "NGO" and not ngo_id:
        org_name = (payload.get("organizationName") or "").strip()
        request_type = payload.get("requestType")
        organization_id = payload.get("organizationId")
        if request_type == "subsequent" and organization_id:
            org_name = f"{org_name}||{organization_id}"
            
        qty = payload.get("orgLaptopRequire")
        try:
            qty_int = int(qty) if qty is not None else 1
        except Exception:
            qty_int = 1
            
        loc_list = payload.get("location")
        if isinstance(loc_list, list):
            rural_urban = ", ".join(loc_list)
        else:
            rural_urban = str(loc_list or "").strip()
            
        op_state = (payload.get("operatingState") or "").strip()
        
        if op_state and rural_urban:
            location = f"{op_state} ({rural_urban})"
        elif op_state:
            location = op_state
        elif rural_urban:
            location = rural_urban
        else:
            location = ""
            
        use_case = payload.get("primaryUse")
        if isinstance(use_case, list):
            use_case = ", ".join(use_case)
        else:
            use_case = str(use_case or "").strip()
            
        contact_name_val = (payload.get("primaryContactName") or "").strip()
        contact_num_val = (payload.get("contactNumber") or "").strip()
        contact_name = f"{contact_name_val} | {contact_num_val}" if contact_num_val else contact_name_val
        
        email = (payload.get("email") or "").strip()
        partner_type = "AFE Partner"
        
        years_operating = str(payload.get("yearsOperating") or "").strip()
        focus_area = str(payload.get("focusArea") or "").strip()
        infrastructure = str(payload.get("infrastructure") or "").strip()
        beneficiaries_count = str(payload.get("beneficiariesCount") or payload.get("numberOfBeneficiaries") or "").strip()
        age_group = str(payload.get("ageGroup") or "").strip()
        expected_outcome = str(payload.get("expectedOutcome") or "").strip()
        laptop_tracking = str(payload.get("laptopTracking") or "").strip()
        
        import base64, uuid, io
        from datetime import datetime
        
        attached_email_link = ""
        base64_file = str(payload.get("file") or "").strip()
        file_name = str(payload.get("fileName") or "impact_report.pdf").strip()
        mime_type = str(payload.get("mimeType") or "application/pdf").strip()
        
        if base64_file:
            try:
                raw_data = base64.b64decode(base64_file)
                settings = _get_s3_settings()
                client = _get_s3_client()
                
                _, ext = os.path.splitext(file_name)
                key = f"{settings['prefix']}ngo_impact_reports/{datetime.utcnow().strftime('%Y%m%d')}/{uuid.uuid4().hex}{ext.lower()}"
                
                extra_args = {}
                if mime_type:
                    extra_args["ContentType"] = mime_type
                    
                client.upload_fileobj(io.BytesIO(raw_data), settings["bucket"], key, ExtraArgs=extra_args or None)
                
                region = os.getenv("AWS_REGION") or os.getenv("AWS_DEFAULT_REGION", "ap-south-1")
                bucket = settings["bucket"]
                attached_email_link = f"https://{bucket}.s3.{region}.amazonaws.com/{key}"
            except Exception as e:
                print(f"Error uploading NGO impact report to S3: {e}")
        
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    f"""
                    INSERT INTO {DB_SCHEMA}.ngo_requests
                    (ngo_name, laptop_quantity, location, use_case, contact_name, email, status, partner_type, date_received,
                     operating_state, years_operating, focus_area, infrastructure, beneficiaries_count, age_group, expected_outcome, laptop_tracking, attached_email_link)
                    VALUES (%s, %s, %s, %s, %s, %s, 'draft', %s, CURRENT_DATE, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                    """,
                    (org_name, qty_int, location, use_case, contact_name, email, partner_type, op_state, years_operating, focus_area, infrastructure, beneficiaries_count, age_group, expected_outcome, laptop_tracking, attached_email_link)
                )
                new_id = cur.fetchone()["id"]
                conn.commit()
                
        # Send the draft submission notification email to Sama Ops and AFE Teams
        try:
            send_afe_draft_submission_email(org_name, email, qty_int, contact_name, location, use_case)
        except Exception as e:
            print(f"Error sending draft submission email: {e}")
                
        return {
            "status": "success",
            "type": type_name,
            "id": f"DRAFT-{new_id}",
            "organizationName": org_name,
            "message": "Web requirements submitted successfully"
        }


    def is_pg_id(nid):
        if not isinstance(nid, str): return False
        if nid.startswith("DRAFT-"): return True
        return False


    # Intercept status changes, timeline updates, and deletions for drafts
    if is_pg_id(ngo_id):
        db_id = int(ngo_id.replace("DRAFT-", "").replace("SAM-D", "").replace("SAM-", ""))
        if type_name == "NGO":
            status_val = payload.get("status")
            approved_qty = payload.get("approved_quantity")
            approver = payload.get("approver_name")
            partner = payload.get("partner_type")
            disp_loc = payload.get("dispatch_location")
            exp_days = payload.get("expected_delivery_days")
            disp_date = payload.get("dispatch_date")
            del_date = payload.get("delivery_date")
            
            with get_conn() as conn:
                with conn.cursor() as cur:
                    update_fields = []
                    params = []
                    
                    if status_val is not None:
                        update_fields.append("status = %s")
                        params.append(status_val)
                        if status_val == "Submitted Request":
                            update_fields.append("partner_type = %s")
                            params.append("AFE Partner")
                            update_fields.append("donor = %s")
                            params.append("Amazon")
                    if approved_qty is not None:
                        update_fields.append("approved_quantity = %s")
                        params.append(approved_qty)
                    if approver is not None:
                        update_fields.append("approver_name = %s")
                        params.append(approver)
                    if partner is not None:
                        update_fields.append("partner_type = %s")
                        params.append(partner)
                    if disp_loc is not None:
                        update_fields.append("dispatch_location = %s")
                        params.append(disp_loc)
                    if exp_days is not None:
                        update_fields.append("expected_delivery_days = %s")
                        params.append(exp_days)
                    if disp_date is not None:
                        if disp_date == "": disp_date = None
                        update_fields.append("dispatch_date = %s")
                        params.append(disp_date)
                    if del_date is not None:
                        if del_date == "": del_date = None
                        update_fields.append("delivery_date = %s")
                        params.append(del_date)
                        
                    if update_fields:
                        query = f"""
                            UPDATE {DB_SCHEMA}.ngo_requests
                            SET {', '.join(update_fields)}
                            WHERE id = %s
                        """
                        params.append(db_id)
                        cur.execute(query, tuple(params))
                        conn.commit()
                    
                    if status_val in {"Approved", "Dispatched", "Delivered"}:
                        cur.execute(
                            f"""
                            SELECT ngo_name, email, laptop_quantity, approver_name, approved_quantity, 
                                   dispatch_location, expected_delivery_days, dispatch_date, delivery_date, attached_email_link
                            FROM {DB_SCHEMA}.ngo_requests 
                            WHERE id = %s
                            """, 
                            (db_id,)
                        )
                        row = cur.fetchone()
                        if row and row.get("email"):
                            final_qty = row["approved_quantity"] or row["laptop_quantity"]
                            if status_val == "Approved":
                                send_afe_internal_approval_email(row["ngo_name"], row["approver_name"] or "AFE Approver", final_qty)
                                send_afe_approval_email(row["ngo_name"], row["email"], final_qty)
                            elif status_val in ["Dispatched", "Delivered"]:
                                # Fetch any laptops allocated to this NGO name
                                laptops_list = []
                                try:
                                    cur.execute(
                                        f"""
                                        SELECT id, manufacturer_model, ram, rom, processor 
                                        FROM {DB_SCHEMA}.laptop_labeling 
                                        WHERE UPPER(allocated_to) = UPPER(%s)
                                        """,
                                        (row["ngo_name"],)
                                    )
                                    for r_lap in cur.fetchall():
                                        laptops_list.append(dict(r_lap))
                                except Exception as e:
                                    print(f"Failed to fetch laptops for email: {e}")
                                    
                                if status_val == "Dispatched":
                                    send_afe_dispatch_email(
                                        row["ngo_name"], 
                                        row["email"], 
                                        final_qty, 
                                        row["dispatch_date"], 
                                        row["dispatch_location"], 
                                        row["expected_delivery_days"]
                                    )
                                    send_afe_serial_number_sheet_email(
                                        row["ngo_name"], 
                                        row["email"], 
                                        laptops_list
                                    )
                                elif status_val == "Delivered":
                                    send_afe_delivery_email(row["ngo_name"], row["email"], final_qty, laptops_list, row["delivery_date"])
            return {"status": "success", "id": ngo_id, "status_updated": status_val}
            
        elif type_name == "NGOTimeline":
            date_val = payload.get("tentative_refurb_completion")
            if date_val == "": date_val = None
            with get_conn() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        f"""
                        UPDATE {DB_SCHEMA}.ngo_requests
                        SET tentative_refurb_completion = %s
                        WHERE id = %s
                        """,
                        (date_val, db_id)
                    )
                    conn.commit()
            return {"status": "success", "id": ngo_id, "timeline_updated": date_val}
            
        elif type_name == "deleteNgo":
            with get_conn() as conn:
                with conn.cursor() as cur:
                    cur.execute(f"DELETE FROM {DB_SCHEMA}.ngo_requests WHERE id = %s", (db_id,))
                    conn.commit()
            return {"status": "success", "id": ngo_id, "deleted": True}
            
        elif type_name == "donorUpdate":
            donor_val = payload.get("donor")
            with get_conn() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        f"""
                        UPDATE {DB_SCHEMA}.ngo_requests
                        SET donor = %s
                        WHERE id = %s
                        """,
                        (donor_val, db_id)
                    )
                    conn.commit()
            return {"status": "success", "id": ngo_id, "donor_updated": donor_val}
            
    # Intercept status changes
    if type_name == "NGO":
        status_val = payload.get("status")
        ngo_id = payload.get("id")
        
        if status_val in {"Approved", "Dispatched", "Delivered"}:
            try:
                with get_conn() as conn:
                    with conn.cursor() as cur:
                        cur.execute(
                            f"""
                            SELECT organization_name, email, laptop_require
                            FROM {DB_SCHEMA}.external_registered_ngo
                            WHERE id = %s
                            """,
                            (str(ngo_id),)
                        )
                        row = cur.fetchone()
                        if row:
                            ngo_name = row["organization_name"] or "NGO Partner"
                            ngo_email = row["email"]
                            qty_requested = row["laptop_require"] or 0
                            
                            if ngo_email:
                                if status_val == "Approved":
                                    send_afe_approval_email(ngo_name, ngo_email, qty_requested)
                                elif status_val == "Dispatched":
                                    send_afe_dispatch_email(ngo_name, ngo_email, qty_requested)
                                elif status_val == "Delivered":
                                    laptops_list = []
                                    try:
                                        with get_conn() as conn:
                                            with conn.cursor() as cur:
                                                cur.execute(
                                                    f"""
                                                    SELECT id, manufacturer_model, ram, rom, processor 
                                                    FROM {DB_SCHEMA}.laptop_labeling 
                                                    WHERE UPPER(allocated_to) = UPPER(%s)
                                                    """,
                                                    (ngo_name,)
                                                )
                                                for r in cur.fetchall():
                                                    laptops_list.append({
                                                        "id": r[0],
                                                        "manufacturer_model": r[1] or "",
                                                        "ram": r[2] or "",
                                                        "rom": r[3] or "",
                                                        "processor": r[4] or ""
                                                    })
                                    except Exception as db_err:
                                        print(f"Failed to fetch laptop serials for {ngo_name} on delivery: {db_err}")
                                    
                                    send_afe_delivery_email(ngo_name, ngo_email, qty_requested, laptops_list)
                            else:
                                print(f"NGO email is empty. Skipping email trigger for status {status_val}.")
                        else:
                            print(f"NGO with ID {ngo_id} not found in registration list.")
            except Exception as e:
                print(f"Failed to process status notification details for {status_val}: {e}")
                
    if type_name in {
        "MultipleDocsUpload", "MultipleDocsUpdate", "NewMultipleDocsUpload", "updateDocStatus",
        "MouUpload", "question", "UpdateMonthly", "UpdateYearly", "Monthly", "Yearly",
        "SendMonthlyReport", "SendYearlyReport", "manageStatus", "addManageStatus",
        "editManageStatus", "deleteManageStatus", "updateStatusHistory", "donorQuestion",
        "Donor", "GetMou", "getMonthlyStatusUpdate", "yearlyQuestion",
    }:
        return _save_ngo_operation(type_name, payload)

    raise HTTPException(
        status_code=501,
        detail=f"NGO operation '{type_name or 'unknown'}' is not implemented in the database backend",
    )


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
    if type_name in {"getDonorList", "getDonorCompanies"}:
        return _query_donor_companies()
    if type_name == "getStageTemplate":
        return _query_stage_template(request)
    if type_name in {"getStageMap", "getStages"}:
        return _query_stage_map(request)
    if type_name == "getLaptopStageRuns":
        return _query_laptop_stage_runs(request)
    if type_name == "getStageRunResponses":
        return _query_stage_run_responses(request)
    if type_name == "getStageGateLogs":
        return _query_stage_gate_logs(request)
    if type_name == "getLaptopStageSnapshot":
        return _query_laptop_stage_snapshot(request)
    if type_name == "getFailedGateQueue":
        return _query_failed_gate_queue()
    if type_name == "getIssueLogs":
        return _query_issue_logs(request)

    raise HTTPException(status_code=501, detail=f"Operation '{type_name}' is not implemented in the database backend")


@app.post("/exec")
async def exec_post(request: Request, background_tasks: BackgroundTasks) -> Any:
    try:
        payload = await request.json()
        if not isinstance(payload, dict):
            payload = {}
    except Exception:
        payload = {}

    type_name = _type_from_request(request, payload)
    if not type_name:
        raise HTTPException(status_code=400, detail="Missing 'type' in query or JSON body")

    if type_name == "publicInquiry":
        return _save_public_inquiry(payload)

    if type_name in MIGRATED_TYPES:
        return _handle_post_type(type_name, payload)

    raise HTTPException(status_code=501, detail=f"Operation '{type_name}' is not implemented in the database backend")


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
    try:
        return await asyncio.wait_for(
            asyncio.to_thread(_handle_user_post_type, payload),
            timeout=10,
        )
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="Login database request timed out")


# =====================================================================
# Phase 3: Automated Communications, RMS Inactivity & AI Parser
# =====================================================================

def _parse_ngo_request_with_ai(email_body: str) -> Dict[str, Any]:
    api_key = os.environ.get("MISTRAL_API_KEY")
    if not api_key:
        print("MISTRAL_API_KEY not configured. Falling back to default parser.")
        return {
            "ngo_name": "Unknown NGO (AI Key Missing)",
            "laptop_quantity": 1,
            "location": "",
            "use_case": "Parsed manually from incoming email",
            "contact_name": "",
        }
    
    model = os.environ.get("MISTRAL_MODEL", "mistral-medium-3-5")
    
    prompt = f"""
    Read the following email body requesting laptops for an NGO, and extract:
    1. The NGO name (as "ngo_name")
    2. The number of laptops requested (as "laptop_quantity", must be an integer, default to 1 if not specified)
    3. The location/city (as "location")
    4. The purpose/use case (as "use_case")
    5. The contact person name (as "contact_name")

    Ensure the output is clean JSON. Do not include markdown wrappers or extra text.

    Email Body:
    \"\"\"{email_body}\"\"\"
    """
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": model,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.1
    }
    
    try:
        response = httpx.post(
            "https://api.mistral.ai/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=30.0
        )
        if response.status_code == 200:
            content = response.json()["choices"][0]["message"]["content"]
            content_clean = re.sub(r"```json\s*", "", content)
            content_clean = re.sub(r"```\s*", "", content_clean).strip()
            parsed = json.loads(content_clean)
            return {
                "ngo_name": parsed.get("ngo_name") or "Unknown NGO",
                "laptop_quantity": int(parsed.get("laptop_quantity") or 1),
                "location": parsed.get("location") or "",
                "use_case": parsed.get("use_case") or "",
                "contact_name": parsed.get("contact_name") or ""
            }
    except Exception as e:
        print(f"Failed to parse email using AI: {e}")
        
    return {
        "ngo_name": "Unknown NGO (AI Failed)",
        "laptop_quantity": 1,
        "location": "",
        "use_case": "Failed to parse automatically",
        "contact_name": ""
    }


def send_rms_inactivity_support_email(ngo_name: str, ngo_email: str, laptop_id: str, limit_days: int):
    ops_email = os.environ.get("SAMA_OPS_EMAIL", "operations@thesama.in")
    afe_email = os.environ.get("AMAZON_AFE_EMAIL", "afe-team@amazon.com")
    
    subject = f"Laptop Inactivity Alert – Support Check-in Required {ngo_name}"
    html_part = f"""
        <p>Dear {ngo_name} Team,</p>
        <p>We hope you are doing well.</p>
        <p>As part of our routine monitoring under the Remote Management System (RMS), we have noticed that one of the laptops distributed to {ngo_name}, Asset Tag/Serial Number: {laptop_id}, has not connected to the internet for over {limit_days} days and has therefore been marked as inactive in our system.</p>
        <p>This could be due to a number of reasons, such as limited connectivity, the device being temporarily out of use, or a technical issue on the device end. We would appreciate it if you could share a quick update on the current status of this laptop within a week.</p>
        <p>If any support is needed on our end, whether technical troubleshooting or otherwise, please feel free to reach out to us.</p>
        <p>Best regards,<br/>Sama Operations Team</p>
    """
    _send_email_common(
        to_email=ngo_email,
        subject=subject,
        html_part=html_part,
        cc=[{"Email": ops_email}, {"Email": afe_email}],
        to_name=ngo_name
    )


async def check_rms_inactivity():
    print("Checking RMS inactivity...")
    limit_days = int(os.environ.get("RMS_INACTIVITY_LIMIT_DAYS", "30"))
    
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"""
                SELECT ll.id, ll.allocated_to, MAX(mc.rms_last_seen) AS rms_last_seen
                FROM {DB_SCHEMA}.laptop_labeling ll
                LEFT JOIN {DB_SCHEMA}.monthly_check_in mc ON mc.laptop_id = ll.id
                WHERE ll.status = 'DISTRIBUTION'
                GROUP BY ll.id, ll.allocated_to
                HAVING COALESCE(MAX(mc.rms_last_seen), ll.last_updated_on) < now() - %s * INTERVAL '1 day'
                """,
                (limit_days,)
            )
            inactive_laptops = cur.fetchall()
            
            if not inactive_laptops:
                print("No inactive laptops found.")
                return
                
            ngos = []
            try:
                cur.execute(
                    f"""
                    SELECT id, organization_name, email
                    FROM {DB_SCHEMA}.external_registered_ngo
                    """
                )
                ngos = [{"Id": r["id"], "organizationName": r["organization_name"], "email": r["email"]} for r in cur.fetchall()]
            except Exception as e:
                print(f"Failed to fetch NGO registrations from DB for email mapping: {e}")
                
            for laptop in inactive_laptops:
                laptop_id = laptop["id"]
                ngo_name = laptop["allocated_to"]
                last_seen = laptop["rms_last_seen"]
                
                cur.execute(
                    f"""
                    SELECT 1 FROM {DB_SCHEMA}.issue_log 
                    WHERE laptop_id = %s 
                      AND status = 'OPEN' 
                      AND issue_description LIKE 'Device Inactive%%'
                    LIMIT 1
                    """,
                    (laptop_id,)
                )
                if cur.fetchone():
                    continue
                    
                desc = f"Device Inactive for {limit_days}+ days. Last seen: {last_seen.strftime('%d/%m/%Y %H:%M') if last_seen else 'Never'}"
                cur.execute(
                    f"""
                    INSERT INTO {DB_SCHEMA}.issue_log (laptop_id, issue_description, severity, status)
                    VALUES (%s, %s, 'P2', 'OPEN')
                    """,
                    (laptop_id, desc)
                )
                conn.commit()
                
                ngo = next((n for n in ngos if str(n.get("organizationName", "")).lower() == str(ngo_name).lower()), None)
                ngo_email = ngo.get("email") if ngo else None
                
                if ngo_email:
                    send_rms_inactivity_support_email(ngo_name, ngo_email, laptop_id, limit_days)
                else:
                    print(f"No email found for NGO {ngo_name}. Logged issue in DB only.")


def send_quarterly_impact_email(ngo_name: str, ngo_email: str, months: int, jotform_url: str):
    ops_email = os.environ.get("SAMA_OPS_EMAIL", "operations@thesama.in")
    afe_email = os.environ.get("AMAZON_AFE_EMAIL", "afe-team@amazon.com")
    
    subject = f"Quarterly Impact Report Submission Reminder – {ngo_name}"
    html_part = f"""
        <p>Dear {ngo_name} Team,</p>
        <p>We hope you are doing well.</p>
        <p>As part of our quarterly review process, we kindly request you to submit the Impact Report for your organization. This report helps us track the usage and impact of the distributed laptops within your programs.</p>
        <p>Please use the link below to submit your report along with the required photos:</p>
        <p><a href="{jotform_url}" target="_blank">Impact report</a></p>
        <p>We would appreciate it if this could be completed within a week. If you have any questions or need assistance while filling out the form, please feel free to reach out to us.</p>
        <p>Thank you for your continued partnership and support.</p>
        <p>Best regards,<br/>Sama Operations Team</p>
    """
    _send_email_common(
        to_email=ngo_email,
        subject=subject,
        html_part=html_part,
        cc=[{"Email": ops_email}, {"Email": afe_email}],
        to_name=ngo_name
    )


async def send_quarterly_impact_reminders():
    print("Checking for quarterly impact reminders...")
    jotform_url = os.environ.get("QUARTERLY_IMPACT_JOTFORM_URL", "https://form.jotform.com/sama-impact-report")
    
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"""
                SELECT r.laptop_id, r.completed_at, ll.allocated_to
                FROM {DB_SCHEMA}.laptop_stage_run r
                JOIN {DB_SCHEMA}.laptop_labeling ll ON ll.id = r.laptop_id
                WHERE r.stage_code = 'DISTRIBUTION' 
                  AND r.completed_at IS NOT NULL
                """
            )
            shipments = cur.fetchall()
            
            if not shipments:
                return
                
            ngos = []
            try:
                cur.execute(
                    f"""
                    SELECT id, organization_name, email
                    FROM {DB_SCHEMA}.external_registered_ngo
                    """
                )
                ngos = [{"Id": r["id"], "organizationName": r["organization_name"], "email": r["email"]} for r in cur.fetchall()]
            except Exception as e:
                print(f"Failed to fetch NGO registrations from DB: {e}")
                
            today = date.today()
            for ship in shipments:
                comp_at = ship["completed_at"]
                if not comp_at:
                    continue
                diff_days = (today - comp_at.date()).days
                
                # Triggers exactly at 3 months (90 days), 6 months (180 days), 9 months (270 days)
                if diff_days in {90, 180, 270}:
                    months = diff_days // 30
                    ngo_name = ship["allocated_to"]
                    ngo = next((n for n in ngos if str(n.get("organizationName", "")).lower() == str(ngo_name).lower()), None)
                    ngo_email = ngo.get("email") if ngo else None
                    
                    if ngo_email:
                        send_quarterly_impact_email(ngo_name, ngo_email, months, jotform_url)


async def check_and_parse_inbound_emails():
    imap_user = os.environ.get("NGO_REQUEST_EMAIL")
    imap_pass = os.environ.get("NGO_REQUEST_EMAIL_PASSWORD")
    if not imap_user or not imap_pass:
        return
        
    import imaplib
    import email
    from email.header import decode_header
    
    try:
        mail = imaplib.IMAP4_SSL("imap.gmail.com", 993)
        mail.login(imap_user, imap_pass)
        mail.select("inbox")
        
        status, messages = mail.search(None, "UNSEEN")
        if status != "OK" or not messages[0]:
            mail.logout()
            return
            
        for num in messages[0].split():
            status, data = mail.fetch(num, "(RFC822)")
            if status != "OK":
                continue
                
            raw_email = data[0][1]
            msg = email.message_from_bytes(raw_email)
            
            subject, encoding = decode_header(msg.get("Subject", ""))[0]
            if isinstance(subject, bytes):
                subject = subject.decode(encoding or "utf-8", errors="ignore")
                
            # Match laptop request keywords
            if "request" not in subject.lower() or "laptop" not in subject.lower():
                continue
                
            sender, encoding = decode_header(msg.get("From", ""))[0]
            if isinstance(sender, bytes):
                sender = sender.decode(encoding or "utf-8", errors="ignore")
                
            body = ""
            if msg.is_multipart():
                for part in msg.walk():
                    content_type = part.get_content_type()
                    content_disposition = str(part.get("Content-Disposition"))
                    if content_type == "text/plain" and "attachment" not in content_disposition:
                        payload_data = part.get_payload(decode=True)
                        body = payload_data.decode(part.get_content_charset() or "utf-8", errors="ignore")
                        break
            else:
                payload_data = msg.get_payload(decode=True)
                body = payload_data.decode(msg.get_content_charset() or "utf-8", errors="ignore")
                
            body = body.strip()
            if not body:
                continue
                
            parsed_data = _parse_ngo_request_with_ai(body)
            email_address = str(parsed_data.get("email") or sender or "").strip()
            email_match = re.search(r"[\w\.-]+@[\w\.-]+", email_address)
            if email_match:
                email_address = email_match.group(0)
                
            with get_conn() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        f"""
                        INSERT INTO {DB_SCHEMA}.ngo_requests
                        (ngo_name, laptop_quantity, location, use_case, contact_name, email, status)
                        VALUES (%s, %s, %s, %s, %s, %s, 'Pending Review')
                        """,
                        (
                            parsed_data["ngo_name"],
                            parsed_data["laptop_quantity"],
                            parsed_data["location"],
                            parsed_data["use_case"],
                            parsed_data["contact_name"],
                            email_address,
                        )
                    )
                    conn.commit()
            print(f"Automatically parsed and saved request draft from {email_address}")
            
            # Mark as read
            mail.store(num, "+FLAGS", "\\Seen")
            
        mail.close()
        mail.logout()
    except Exception as e:
        print(f"Error reading IMAP inbox: {e}")


async def run_email_polling_scheduler():
    print("Email polling scheduler task initiated.")
    while True:
        try:
            await check_and_parse_inbound_emails()
        except Exception as e:
            print(f"Error in email polling scheduler: {e}")
        await asyncio.sleep(60)

async def check_rms_inactivity():
    # Placeholder for scheduled check if needed
    # (Inactivity is mostly driven by the webhook now)
    pass

async def send_quarterly_impact_reminders():
    print("Checking for quarterly impact reminders...")
    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                # Find requests delivered exactly 90 days ago
                cur.execute(f"""
                    SELECT id, ngo_name, email, delivery_date 
                    FROM {DB_SCHEMA}.ngo_requests 
                    WHERE status = 'Delivered' 
                    AND delivery_date IS NOT NULL 
                    AND CURRENT_DATE = (delivery_date + INTERVAL '90 days')
                """)
                due_requests = cur.fetchall()
                
                for req in due_requests:
                    if req.get("email"):
                        # Send the Stage 7 email
                        body = f"Dear {req.get('ngo_name')} Team,\\n\\nAs part of our quarterly review process, we kindly request you to submit the Impact Report for your organization...\\nImpact report: https://www.jotform.com/form/261872559359069"
                        
                        await send_brevo_email(
                            to_email=req.get("email"),
                            to_name=req.get("ngo_name"),
                            subject=f"Quarterly Impact Report Submission Reminder - {req.get('ngo_name')}",
                            html_content=body.replace("\\n", "<br>")
                        )
                        print(f"Sent quarterly reminder to {req.get('ngo_name')}")
    except Exception as e:
        print(f"Failed to send quarterly reminders: {e}")

@app.post("/api/rms-webhook")
async def rms_webhook(request: Request):
    try:
        payload = await request.json()
        asset_tag = payload.get("asset_tag")
        status = payload.get("status")
        
        if not asset_tag:
            raise HTTPException(status_code=400, detail="Missing asset_tag")
            
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(f"""
                    UPDATE {DB_SCHEMA}.laptop_labeling 
                    SET rms_status = %s, last_active_date = CURRENT_TIMESTAMP
                    WHERE id = %s OR serial_number = %s
                """, (status, str(asset_tag), str(asset_tag)))
                conn.commit()
                
        # If marked inactive, trigger the Stage 6 email alert to Ops
        if status and status.upper() == "INACTIVE":
            body = f"Laptop Inactivity Alert for Asset Tag/Serial Number: {asset_tag}. It has not connected to the internet for over 30 days."
            await send_brevo_email(
                to_email="operations@thesama.in",
                to_name="Sama Operations",
                subject=f"Laptop Inactivity Alert - Support Check-in Required",
                html_content=body
            )
            
        return {"status": "success", "message": f"Updated RMS status for {asset_tag}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/rms-stats")
async def get_rms_stats():
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


VALID_INDIAN_STATES = {
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", 
    "West Bengal", "Delhi", "Jammu and Kashmir", "Puducherry", "Ladakh", "Chandigarh", 
    "Dadra and Nagar Haveli and Daman and Diu", "Lakshadweep", "Andaman and Nicobar Islands"
}

def normalize_state_name(raw_state: str) -> str:
    if not raw_state:
        return ""
    s = raw_state.strip().upper()
    if "DELHI" in s:
        return "Delhi"
    if "PONDICHERRY" in s or "PUDUCHERRY" in s:
        return "Puducherry"
    if s.startswith("MAHA"):
        return "Maharashtra"
    if s.startswith("JAM") or "KASHMIR" in s:
        return "Jammu and Kashmir"
    if s.startswith("RAJ"):
        return "Rajasthan"
    if s.startswith("TEL"):
        return "Telangana"
    if s.startswith("KER"):
        return "Kerala"
    if s.startswith("KAR"):
        return "Karnataka"
    if s.startswith("MAD") or s == "MP":
        return "Madhya Pradesh"
    if s.startswith("UTT") or s == "UP":
        if "PRADESH" in s or s == "UP":
            return "Uttar Pradesh"
        else:
            return "Uttarakhand"
    if s.startswith("BIH"):
        return "Bihar"
    if s.startswith("ODI") or s.startswith("ORI"):
        return "Odisha"
    if s.startswith("CHH") or s.startswith("CHI"):
        return "Chhattisgarh"
    if s.startswith("WES") or "BENGAL" in s or s == "WB":
        return "West Bengal"
    if s.startswith("GUJ"):
        return "Gujarat"
    if s.startswith("TAM") or s == "TN":
        return "Tamil Nadu"
    if s.startswith("ASS"):
        return "Assam"
    if s.startswith("HAR"):
        return "Haryana"
    if s.startswith("JHA"):
        return "Jharkhand"
    if s.startswith("PUN"):
        return "Punjab"
    if s.startswith("HIM") or s == "HP":
        return "Himachal Pradesh"
    if s.startswith("ARU"):
        return "Arunachal Pradesh"
    
    title_state = raw_state.strip().title()
    return title_state if title_state in VALID_INDIAN_STATES else ""


@app.post("/api/public/donate")
async def public_donate(payload: dict):
    try:
        first_name = payload.get("firstName", "").strip()
        last_name = payload.get("lastName", "").strip()
        email = payload.get("email", "").strip()
        phone = payload.get("phone", "").strip()
        contribution_type = payload.get("contributionType", "").strip()
        company_name = payload.get("companyName", "").strip()
        donation_type = payload.get("donationType", "").strip()
        number_of_laptops = payload.get("numberOfLaptops")
        message = payload.get("message", "").strip()

        num_laptops = 0
        if number_of_laptops:
            try:
                num_laptops = int(number_of_laptops)
            except Exception:
                num_laptops = 0

        poc_name = f"{first_name} {last_name}".strip()
        donor_company = company_name if contribution_type == "company" else "Individual"
        
        import uuid
        pickup_id = f"PK-{uuid.uuid4().hex[:8].upper()}"

        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(f"""
                    INSERT INTO {DB_SCHEMA}.pickup (
                        pickup_id, donor_company, poc_name, poc_contact, poc_email, 
                        number_of_laptops, pickup_location, status, current_date_time, updated_on
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, now(), now()
                    )
                """, (
                    pickup_id, donor_company, poc_name, phone, email, 
                    num_laptops, message or "Online Submission", "Pending"
                ))
                conn.commit()

        return {"status": "success", "message": "Donation details successfully recorded.", "pickup_id": pickup_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/public/social-impact-stats")
async def get_social_impact_stats():
    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                # Laptops Distributed (including all processed/refurbished/allocated statuses)
                cur.execute(f"""
                    SELECT COUNT(*) 
                    FROM {DB_SCHEMA}.laptop_labeling
                    WHERE (is_deleted_from_sheet = FALSE OR is_deleted_from_sheet IS NULL)
                      AND status IN (
                          'DISTRIBUTED', 
                          'POST_DEPLOYMENT_15D', 
                          'MONTHLY_MONITORING', 
                          'LAPTOP_REFURBISHED', 
                          'ALLOCATED', 
                          'Allocated', 
                          'DISTRIBUTION'
                      )
                """)
                laptops_distributed = cur.fetchone()["count"]

                # Beneficiaries Impacted (from userdetails)
                cur.execute(f"SELECT COUNT(*) as total FROM {DB_SCHEMA}.userdetails")
                beneficiaries_from_users = cur.fetchone()["total"]

                # Females Reached, Schools Reached & Prelim Students (from preliminary)
                cur.execute(f"""
                    SELECT 
                        COALESCE(SUM(number_of_student), 0) as prelim_students,
                        COALESCE(SUM(number_of_female_student), 0) as females_reached,
                        COALESCE(SUM(number_of_school), 0) as schools_reached
                    FROM {DB_SCHEMA}.preliminary
                """)
                preliminary_stats = cur.fetchone()
                
                # Total beneficiaries = individual users + prelim students
                beneficiaries_impacted = beneficiaries_from_users + preliminary_stats["prelim_students"]

                # Calculate dynamic environmental metrics based on 4131 laptops baseline
                plastic = round(laptops_distributed * 0.295933, 1)
                aluminium = round(laptops_distributed * 0.118373, 1)
                copper = round(laptops_distributed * 0.059186, 1)
                gold = round(laptops_distributed * 0.000004914, 4)
                silver = round(laptops_distributed * 0.00004914, 3)
                resource_waste = round(plastic + aluminium + copper + gold + silver, 1)

                lead = round(laptops_distributed * 1.381021, 1)
                mercury = round(laptops_distributed * 0.098644, 1)
                cadmium = round(laptops_distributed * 0.019728, 1)
                chromium = round(laptops_distributed * 0.197288, 1)
                toxic_waste = round(lead + mercury + cadmium + chromium, 1)

                carbon_footprint = round(laptops_distributed * 0.078915, 1)

                # Calculate states impacted dynamically
                cur.execute(f"SELECT states FROM {DB_SCHEMA}.preliminary")
                states_rows = cur.fetchall()
                unique_states = set()
                for row in states_rows:
                    if row["states"]:
                        for s in row["states"].split(","):
                            cleaned = s.strip()
                            if cleaned:
                                if cleaned.lower() in ("jammu and kashmir", "jammu & kashmir"):
                                    cleaned = "Jammu & Kashmir"
                                elif cleaned.lower() == "mp":
                                    cleaned = "MP"
                                elif cleaned.lower() == "up":
                                    cleaned = "UP"
                                unique_states.add(cleaned)
                states_impacted = len(unique_states)
                states_list = ", ".join(sorted(list(unique_states)))

        return {
            "laptopsDistributed": laptops_distributed,
            "beneficiariesImpacted": beneficiaries_impacted,
            "femalesReached": preliminary_stats["females_reached"],
            "schoolsReached": preliminary_stats["schools_reached"],
            "statesImpacted": states_impacted,
            "statesList": states_list,
            "Resource Waste Reduction": resource_waste,
            "Plastic": plastic,
            "Aluminium": aluminium,
            "Copper": copper,
            "Gold": gold,
            "Silver": silver,
            "Toxic Waste Seepage Reduction": toxic_waste,
            "Lead": lead,
            "Mercury": mercury,
            "Cadmium": cadmium,
            "Chromium": chromium,
            "Carbon Footprint Reduction": carbon_footprint
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/public/donor-stats")
async def get_donor_stats(orgName: Optional[str] = None, startDate: Optional[str] = None, endDate: Optional[str] = None):
    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                org_filter_sql = ""
                params = []
                if orgName:
                    org_filter_sql = "AND (LOWER(TRIM(d.donor_company)) = LOWER(TRIM(%s)) OR LOWER(TRIM(ll.donor_company_name)) = LOWER(TRIM(%s)))"
                    params.extend([orgName, orgName])

                date_filter_sql = ""
                date_params = []
                if startDate and endDate:
                    # Append 23:59:59 to endDate to include the entire day
                    date_filter_sql = "AND ll.last_updated_on BETWEEN %s AND %s"
                    date_params.extend([f"{startDate} 00:00:00", f"{endDate} 23:59:59"])

                cur.execute(f"""
                    SELECT COUNT(*) 
                    FROM {DB_SCHEMA}.laptop_labeling ll
                    LEFT JOIN {DB_SCHEMA}.{DONOR_TABLE} d ON d.donor_id = ll.donor_id
                    WHERE (ll.is_deleted_from_sheet = FALSE OR ll.is_deleted_from_sheet IS NULL)
                    {org_filter_sql} {date_filter_sql}
                """, params + date_params)
                total_laptops = cur.fetchone()["count"]

                cur.execute(f"""
                    SELECT COUNT(*) 
                    FROM {DB_SCHEMA}.laptop_labeling ll
                    LEFT JOIN {DB_SCHEMA}.{DONOR_TABLE} d ON d.donor_id = ll.donor_id
                    WHERE (ll.is_deleted_from_sheet = FALSE OR ll.is_deleted_from_sheet IS NULL)
                      AND ll.status IN ('LAPTOP_REFURBISHED', 'QC_CHECK', 'TO_BE_DISPATCH', 'ALLOCATED', 'DISTRIBUTED', 'POST_DEPLOYMENT_15D', 'MONTHLY_MONITORING')
                      {org_filter_sql} {date_filter_sql}
                """, params + date_params)
                refurbished_count = cur.fetchone()["count"]

                cur.execute(f"""
                    SELECT ll.status, COUNT(*) 
                    FROM {DB_SCHEMA}.laptop_labeling ll
                    LEFT JOIN {DB_SCHEMA}.{DONOR_TABLE} d ON d.donor_id = ll.donor_id
                    WHERE (ll.is_deleted_from_sheet = FALSE OR ll.is_deleted_from_sheet IS NULL)
                      {org_filter_sql} {date_filter_sql}
                    GROUP BY ll.status
                """, params + date_params)
                
                pipeline = {}
                for row in cur.fetchall():
                    status = row["status"]
                    if status:
                        pipeline[status] = row["count"]

                cur.execute(f"""
                    SELECT COUNT(*) 
                    FROM {DB_SCHEMA}.laptop_labeling ll
                    LEFT JOIN {DB_SCHEMA}.{DONOR_TABLE} d ON d.donor_id = ll.donor_id
                    WHERE (ll.is_deleted_from_sheet = FALSE OR ll.is_deleted_from_sheet IS NULL)
                      AND ll.status IN ('DISTRIBUTED', 'POST_DEPLOYMENT_15D', 'MONTHLY_MONITORING')
                      AND ll.last_updated_on >= NOW() - INTERVAL '15 days'
                      {org_filter_sql} {date_filter_sql}
                """, params + date_params)
                active_usage_count = cur.fetchone()["count"]

                pipeline_ui = {
                    "pickupRequested": pipeline.get("PICKUP_REQUESTED", 0),
                    "inTransit": pipeline.get("IN_TRANSIT", 0),
                    "received": (
                        total_laptops - pipeline.get("PICKUP_REQUESTED", 0) - pipeline.get("IN_TRANSIT", 0)
                    ),
                    "onlyLaptopReceived": pipeline.get("LAPTOP_RECEIVED", 0),
                    "notWorking": pipeline.get("NOT_WORKING", 0),
                    "refurbishmentStarted": pipeline.get("REFURBISHMENT_TESTING", 0) + pipeline.get("REFURBISHMENT_STARTED", 0),
                    "refurbished": (
                        pipeline.get("LAPTOP_REFURBISHED", 0) + 
                        pipeline.get("QC_CHECK", 0) + 
                        pipeline.get("TO_BE_DISPATCH", 0) + 
                        pipeline.get("ALLOCATED", 0)
                    ),
                    "distributed": (
                        pipeline.get("DISTRIBUTED", 0) + 
                        pipeline.get("POST_DEPLOYMENT_15D", 0) + 
                        pipeline.get("MONTHLY_MONITORING", 0)
                    ),
                    "activeUsage": active_usage_count
                }

                pre_filter_sql = ""
                user_filter_sql = ""
                if orgName:
                    pre_filter_sql = "WHERE LOWER(TRIM(doner)) = LOWER(TRIM(%s))"
                    user_filter_sql = "WHERE LOWER(TRIM(doner)) = LOWER(TRIM(%s))"

                cur.execute(f"SELECT COALESCE(SUM(number_of_student), 0) FROM {DB_SCHEMA}.preliminary {pre_filter_sql}", [orgName] if orgName else [])
                prelim_student_count = cur.fetchone()["coalesce"]

                cur.execute(f"SELECT COALESCE(SUM(number_of_female_student), 0) FROM {DB_SCHEMA}.preliminary {pre_filter_sql}", [orgName] if orgName else [])
                females_reached = cur.fetchone()["coalesce"]

                cur.execute(f"SELECT COALESCE(SUM(number_of_school), 0) FROM {DB_SCHEMA}.preliminary {pre_filter_sql}", [orgName] if orgName else [])
                schools_reached = cur.fetchone()["coalesce"]

                cur.execute(f"SELECT COUNT(*) FROM {DB_SCHEMA}.userdetails {user_filter_sql}", [orgName] if orgName else [])
                user_student_count = cur.fetchone()["count"]

                active_beneficiaries = prelim_student_count + user_student_count

                ngos = []
                cur.execute(f"""
                    SELECT id, organization_name AS ngo_name, status, location, doner AS donor
                    FROM {DB_SCHEMA}.external_registered_ngo
                    WHERE status = 'Approved'
                """)
                for r in cur.fetchall():
                    ngos.append({
                        "id": str(r["id"]),
                        "ngo_name": r["ngo_name"],
                        "status": r["status"],
                        "location": r["location"] or "Unknown",
                        "donor": r["donor"]
                    })

                ngo_partners = []
                for ngo in ngos:
                    ngo_id_str = str(ngo["id"])
                    ngo_name_str = ngo["ngo_name"]
                    
                    if orgName and ngo["donor"] and orgName.lower() != ngo["donor"].lower():
                        continue

                    cur.execute(f"""
                        SELECT COUNT(*) 
                        FROM {DB_SCHEMA}.laptop_labeling
                        WHERE LOWER(TRIM(allocated_to)) = LOWER(TRIM(%s))
                          AND (is_deleted_from_sheet = FALSE OR is_deleted_from_sheet IS NULL)
                          {date_filter_sql.replace("ll.last_updated_on", "last_updated_on")}
                    """, [ngo_name_str] + date_params)
                    ngo_laptops = cur.fetchone()["count"]

                    cur.execute(f"""
                        SELECT COUNT(*) 
                        FROM {DB_SCHEMA}.userdetails
                        WHERE LOWER(TRIM(ngo)) = LOWER(TRIM(%s))
                    """, (ngo_name_str,))
                    ngo_users_count = cur.fetchone()["count"]

                    cur.execute(f"""
                        SELECT COALESCE(SUM(number_of_student), 0) 
                        FROM {DB_SCHEMA}.preliminary
                        WHERE LOWER(TRIM(ngoid)) = LOWER(TRIM(%s))
                    """, (ngo_name_str,))
                    ngo_prelim_count = cur.fetchone()["coalesce"]

                    total_ngo_beneficiaries = ngo_users_count + ngo_prelim_count

                    cur.execute(f"""
                        SELECT MAX(last_delivery_date) 
                        FROM {DB_SCHEMA}.laptop_labeling
                        WHERE LOWER(TRIM(allocated_to)) = LOWER(TRIM(%s))
                          AND status = 'DISTRIBUTED'
                          AND (is_deleted_from_sheet = FALSE OR is_deleted_from_sheet IS NULL)
                    """, (ngo_name_str,))
                    last_del = cur.fetchone()["max"]

                    cur.execute(f"""
                        SELECT id AS "ID", 
                               COALESCE(donor_company_name, '') AS "Donor Company Name",
                               manufacturer_model AS "Manufacturer Model",
                               status AS "Status",
                               working AS "Working"
                        FROM {DB_SCHEMA}.laptop_labeling
                        WHERE LOWER(TRIM(allocated_to)) = LOWER(TRIM(%s))
                          AND (is_deleted_from_sheet = FALSE OR is_deleted_from_sheet IS NULL)
                          {date_filter_sql.replace("ll.last_updated_on", "last_updated_on")}
                    """, [ngo_name_str] + date_params)
                    laptop_details = [dict(r) for r in cur.fetchall()]

                    ngo_partners.append({
                        "id": ngo_id_str,
                        "name": ngo_name_str,
                        "status": ngo["status"],
                        "location": ngo["location"] or "Unknown",
                        "laptops": ngo_laptops,
                        "laptopDetails": laptop_details,
                        "beneficiaries": total_ngo_beneficiaries,
                        "lastDelivery": last_del.strftime("%d/%m/%Y") if last_del else "N/A",
                        "Doner": ngo["donor"]
                    })

                # 7. Query recent activities in the last 24 hours
                cur.execute(f"""
                    SELECT 
                        ll.status,
                        ll.allocated_to,
                        ll.last_updated_by,
                        ll.last_updated_on
                    FROM {DB_SCHEMA}.laptop_labeling ll
                    LEFT JOIN {DB_SCHEMA}.{DONOR_TABLE} d ON d.donor_id = ll.donor_id
                    WHERE ll.last_updated_on >= NOW() - INTERVAL '24 hours'
                      AND (ll.is_deleted_from_sheet = FALSE OR ll.is_deleted_from_sheet IS NULL)
                      {org_filter_sql}
                    ORDER BY ll.last_updated_on DESC
                """, params)
                recent_laptops = cur.fetchall()

                activities_map = {}
                for rl in recent_laptops:
                    status = rl["status"] or "Unknown"
                    status_map = {
                        "laptop_received": "Laptop Received",
                        "not_working": "Not Working",
                        "refurbishment_testing": "Refurbishment Started",
                        "refurbishment_started": "Refurbishment Started",
                        "laptop_refurbished": "Laptop Refurbished",
                        "qc_check": "Laptop Refurbished",
                        "to_be_dispatch": "To be dispatch",
                        "ready": "To be dispatch",
                        "in_transit": "In Transit",
                        "allocated": "Allocated",
                        "distributed": "Distributed",
                        "distribution": "Distributed",
                        "pickup_requested": "Pickup Request"
                    }
                    status_normalized = status_map.get(status.lower(), status)
                    allocated_to = rl["allocated_to"] or "Unassigned"
                    updated_by = rl["last_updated_by"] or "System"
                    last_updated = rl["last_updated_on"]

                    key = f"{status_normalized}-{allocated_to}" if status_normalized in ("Allocated", "Distributed") else status_normalized
                    
                    if key not in activities_map:
                        activities_map[key] = {
                            "status": status_normalized,
                            "allocatedTo": allocated_to if status_normalized in ("Allocated", "Distributed") else None,
                            "count": 0,
                            "lastUpdated": last_updated.isoformat(),
                            "id": allocated_to[0].upper() if allocated_to else "?",
                            "updatedBy": updated_by
                        }
                    activities_map[key]["count"] += 1
                    if last_updated.isoformat() > activities_map[key]["lastUpdated"]:
                        activities_map[key]["lastUpdated"] = last_updated.isoformat()

                recent_activities_list = list(activities_map.values())

                cur.execute(f"""
                    SELECT 
                        pickup_id,
                        donor_company,
                        current_date_time
                    FROM {DB_SCHEMA}.pickup
                    WHERE current_date_time >= NOW() - INTERVAL '24 hours'
                """)
                recent_pickups = cur.fetchall()
                for rp in recent_pickups:
                    donor = rp["donor_company"] or "Unknown Donor"
                    if orgName and donor.lower() != orgName.lower():
                        continue
                    recent_activities_list.append({
                        "status": "Pickup Request",
                        "allocatedTo": donor,
                        "count": 1,
                        "lastUpdated": rp["current_date_time"].isoformat(),
                        "id": rp["pickup_id"],
                        "message": f"New pickup request by {donor}",
                        "updatedBy": "System"
                    })

                recent_activities_list.sort(key=lambda x: x["lastUpdated"], reverse=True)

                cur.execute(f"""
                    SELECT DISTINCT COALESCE(d.donor_company, ll.donor_company_name) AS donor_name
                    FROM {DB_SCHEMA}.laptop_labeling ll
                    LEFT JOIN {DB_SCHEMA}.{DONOR_TABLE} d ON d.donor_id = ll.donor_id
                    WHERE COALESCE(d.donor_company, ll.donor_company_name) IS NOT NULL
                      AND COALESCE(d.donor_company, ll.donor_company_name) != ''
                """)
                unique_orgs = [row["donor_name"] for row in cur.fetchall() if row.get("donor_name")]

        return {
            "totalLaptops": total_laptops,
            "refurbishedCount": refurbished_count,
            "activeBeneficiaries": active_beneficiaries,
            "femalesReached": females_reached,
            "schoolsReached": schools_reached,
            "pipeline": pipeline_ui,
            "ngoPartners": ngo_partners,
            "recentActivities": recent_activities_list,
            "uniqueOrganizations": unique_orgs
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/public/state-wise-sheet")
async def get_state_wise_sheet():
    try:
        # Re-use the exact same logic as live-map-stats
        name_to_id = {}
        id_to_states = {}
        try:
            with get_conn() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        f"""
                        SELECT id, organization_name, operating_state
                        FROM {DB_SCHEMA}.external_registered_ngo
                        """
                    )
                    rows = cur.fetchall()
                    for r in rows:
                        org_name = r["organization_name"]
                        ngo_id = r["id"]
                        if org_name and ngo_id:
                            name_to_id[org_name.strip().lower()] = ngo_id
                            state = r["operating_state"]
                            if state:
                                id_to_states[ngo_id] = [normalize_state_name(s.strip()) for s in state.split(",") if s.strip()]
        except Exception as e:
            print(f"Error fetching NGO names for CSV download: {e}")

        with get_conn() as conn:
            with conn.cursor() as cur:
                # Overwrite states/students with preliminary table data if exists
                cur.execute(f"SELECT ngoid, states, number_of_student FROM {DB_SCHEMA}.preliminary")
                prelim_rows = cur.fetchall()
                
                id_to_prelim_students = {}
                for row in prelim_rows:
                    ngoid = row.get("ngoid")
                    states_str = row.get("states")
                    students = row.get("number_of_student")
                    if states_str:
                        id_to_states[ngoid] = [normalize_state_name(s.strip()) for s in states_str.split(",") if s.strip()]
                    if students:
                        id_to_prelim_students[ngoid] = students

                # Fetch only successfully refurbished laptops per NGO name
                cur.execute(f"""
                    SELECT allocated_to, COUNT(id) 
                    FROM {DB_SCHEMA}.laptop_labeling 
                    WHERE status IN (
                        'LAPTOP_REFURBISHED', 'QC_CHECK', 'TO_BE_DISPATCH', 
                        'ALLOCATED', 'DISTRIBUTED', 'POST_DEPLOYMENT', 'MONTHLY_MONITORING'
                    )
                      AND allocated_to IS NOT NULL 
                      AND allocated_to != '' 
                    GROUP BY allocated_to
                """)
                ngo_laptops = {row["allocated_to"].strip().lower(): row["count"] for row in cur.fetchall()}
                
                id_laptops = {}
                for name, count in ngo_laptops.items():
                    ngo_id = name_to_id.get(name)
                    if ngo_id:
                        id_laptops[ngo_id] = id_laptops.get(ngo_id, 0) + count


        id_to_name = {nid: name.title() for name, nid in name_to_id.items()}

        csv_rows = []
        for ngo_id, laptops in id_laptops.items():
            states = id_to_states.get(ngo_id, [])
            states = [s for s in states if s in VALID_INDIAN_STATES]
            if not states:
                states = ["Maharashtra"]  # Fallback state
            
            ngo_name = id_to_name.get(ngo_id, "Unknown NGO")
            people = id_to_prelim_students.get(ngo_id, 0)
            
            state_laptops = laptops // len(states) if states else 0
            state_people = people // len(states) if states else 0
            
            for state in states:
                csv_rows.append([
                    ngo_id,
                    ngo_name,
                    state,
                    state_laptops,
                    state_people
                ])

        csv_rows.sort(key=lambda r: (r[2], r[1]))

        import csv
        import io
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["NGO ID", "NGO Name", "State", "Laptops Donated", "Students Reached"])
        for row in csv_rows:
            writer.writerow(row)
            
        csv_content = output.getvalue()
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=state_wise_donations.csv"}
        )
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.get("/api/public/live-map-stats")
async def get_public_live_map_stats():
    try:
        # 1. Fetch NGO ID mapping and operatingState fallback from Google Sheet registration API
        name_to_id = {}
        id_to_states = {}
        id_to_beneficiaries = {}
        try:
            with get_conn() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        f"""
                        SELECT id, organization_name, operating_state, beneficiaries_count, laptop_require
                        FROM {DB_SCHEMA}.external_registered_ngo
                        """
                    )
                    rows = cur.fetchall()
                    for r in rows:
                        org_name = r["organization_name"]
                        ngo_id = r["id"]
                        if org_name and ngo_id:
                            name_to_id[org_name.strip().lower()] = ngo_id
                            
                            state = r["operating_state"]
                            if state:
                                id_to_states[ngo_id] = [normalize_state_name(s.strip()) for s in state.split(",") if s.strip()]
                                
                            beneficiaries = r["beneficiaries_count"] or (r["laptop_require"] or 0) * 13
                            try:
                                id_to_beneficiaries[ngo_id] = int(beneficiaries)
                            except Exception:
                                id_to_beneficiaries[ngo_id] = 0
        except Exception as e:
            print(f"Error fetching NGO names for map stats: {e}")

        with get_conn() as conn:
            with conn.cursor() as cur:
                # Get exact database target counts (sync status list with social impact cards)
                cur.execute(f"""
                    SELECT COUNT(id) AS count 
                    FROM {DB_SCHEMA}.laptop_labeling 
                    WHERE (is_deleted_from_sheet = FALSE OR is_deleted_from_sheet IS NULL)
                      AND status IN (
                          'DISTRIBUTED', 
                          'POST_DEPLOYMENT_15D', 
                          'MONTHLY_MONITORING', 
                          'LAPTOP_REFURBISHED', 
                          'ALLOCATED', 
                          'Allocated', 
                          'DISTRIBUTION'
                      )
                """)
                row_dev = cur.fetchone()
                target_devices = row_dev.get("count") if row_dev else 0

                cur.execute(f"SELECT COUNT(*) as total FROM {DB_SCHEMA}.userdetails")
                userdetails_count = cur.fetchone()["total"]

                cur.execute(f"SELECT SUM(number_of_student) AS sum FROM {DB_SCHEMA}.preliminary")
                row_pep = cur.fetchone()
                target_people = (row_pep.get("sum") if row_pep and row_pep.get("sum") is not None else 0) + userdetails_count

                cur.execute(f"SELECT COUNT(DISTINCT allocated_to) AS count FROM {DB_SCHEMA}.laptop_labeling WHERE allocated_to IS NOT NULL AND allocated_to != ''")
                row_ngo = cur.fetchone()
                target_ngos = row_ngo.get("count") if row_ngo else 0

                # Overwrite states/students with preliminary table data if exists
                cur.execute(f"SELECT ngoid, states, number_of_student FROM {DB_SCHEMA}.preliminary")
                prelim_rows = cur.fetchall()
                
                id_to_prelim_students = {}
                for row in prelim_rows:
                    ngoid = row.get("ngoid")
                    states_str = row.get("states")
                    students = row.get("number_of_student")
                    
                    if states_str:
                        id_to_states[ngoid] = [normalize_state_name(s.strip()) for s in states_str.split(",") if s.strip()]
                    if students:
                        id_to_prelim_students[ngoid] = students

                # Fetch distributed laptops per NGO name (expanded statuses list)
                cur.execute(f"""
                    SELECT allocated_to, COUNT(id) 
                    FROM {DB_SCHEMA}.laptop_labeling 
                    WHERE status IN (
                        'DISTRIBUTED', 
                        'POST_DEPLOYMENT_15D', 
                        'MONTHLY_MONITORING', 
                        'LAPTOP_REFURBISHED', 
                        'ALLOCATED', 
                        'Allocated', 
                        'DISTRIBUTION'
                    )
                      AND allocated_to IS NOT NULL 
                      AND allocated_to != '' 
                    GROUP BY allocated_to
                """)
                ngo_laptops = {row["allocated_to"].strip().lower(): row["count"] for row in cur.fetchall()}
                
                id_laptops = {}
                for name, count in ngo_laptops.items():
                    ngo_id = name_to_id.get(name)
                    if ngo_id:
                        id_laptops[ngo_id] = id_laptops.get(ngo_id, 0) + count

                # Aggregate initial stats by state
                stats_map = {}
                for ngo_id, laptops in id_laptops.items():
                    states = id_to_states.get(ngo_id, [])
                    if not states:
                        states = ["Maharashtra"]  # Fallback state
                    N = len(states)
                    students = id_to_prelim_students.get(ngo_id) or id_to_beneficiaries.get(ngo_id, 0)
                    
                    for state in states:
                        if state not in stats_map:
                            stats_map[state] = {
                                "devices_donated": 0,
                                "people_reached": 0,
                                "ngo_partners": set()
                            }
                        stats_map[state]["devices_donated"] += int(laptops / N)
                        stats_map[state]["people_reached"] += int(students / N)
                        stats_map[state]["ngo_partners"].add(ngo_id)

                # Proportional scaling to match targets exactly
                sum_laptops = sum(s["devices_donated"] for s in stats_map.values())
                sum_people = sum(s["people_reached"] for s in stats_map.values())

                laptops_scale = target_devices / sum_laptops if sum_laptops else 1.0
                people_scale = target_people / sum_people if sum_people else 1.0

                for state, v in stats_map.items():
                    v["devices_donated"] = int(v["devices_donated"] * laptops_scale)
                    v["people_reached"] = int(v["people_reached"] * people_scale)

                # Correct rounding differences on the largest state (usually Maharashtra)
                if stats_map:
                    diff_laptops = target_devices - sum(s["devices_donated"] for s in stats_map.values())
                    diff_people = target_people - sum(s["people_reached"] for s in stats_map.values())
                    max_state = max(stats_map.keys(), key=lambda k: stats_map[k]["devices_donated"])
                    stats_map[max_state]["devices_donated"] += diff_laptops
                    stats_map[max_state]["people_reached"] += diff_people

                # Format response list
                data_list = []
                for state, v in stats_map.items():
                    data_list.append({
                        "state": state,
                        "devices_donated": v["devices_donated"],
                        "people_reached": v["people_reached"],
                        "ngo_partners": len(v["ngo_partners"])
                    })
                    
                return {
                    "status": "success",
                    "data": data_list,
                    "national": {
                        "devices_donated": target_devices,
                        "people_reached": target_people,
                        "ngo_partners": target_ngos
                    }
                }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/public/impact-stats")
async def get_public_impact_stats():
    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(f"""
                    SELECT 
                        COALESCE(address_state, 'Unknown') as state,
                        COUNT(laptop_assigned) as devices_donated,
                        SUM(COALESCE(CAST(NULLIF(expected_impact, '') AS INTEGER), 0)) as people_reached,
                        COUNT(DISTINCT ngo) as ngo_partners
                    FROM {DB_SCHEMA}.userdetails
                    GROUP BY address_state;
                """)
                rows = cur.fetchall()
                
                stats_by_state = []
                for r in rows:
                    stats_by_state.append({
                        "state": r.get("state"),
                        "devices_donated": r.get("devices_donated", 0),
                        "people_reached": r.get("people_reached", 0),
                        "ngo_partners": r.get("ngo_partners", 0)
                    })
                    
                return {"status": "success", "data": stats_by_state}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/public/corporate-impact")
async def get_public_corporate_impact(doner: str = "Amazon"):
    """Return the corporate dashboard's nested report data from PostgreSQL."""
    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    f"""
                    SELECT r.ngoid, r.month, r.number_of_teachers_trained,
                           r.number_of_school_visits, r.number_of_sessions_conducted,
                           r.number_of_modules_completed, n.operating_state
                    FROM {DB_SCHEMA}.report r
                    LEFT JOIN {DB_SCHEMA}.external_registered_ngo n ON n.id = r.ngoid
                    WHERE (%s = '' OR lower(coalesce(n.doner, '')) = lower(%s))
                    ORDER BY r.ngoid, r.month
                    """,
                    (doner, doner),
                )
                result: Dict[str, Any] = {}
                for row in cur.fetchall():
                    partner = str(row["ngoid"] or "Unknown")
                    month = str(row["month"] or "Unknown")
                    states = [s.strip() for s in str(row["operating_state"] or "Unknown").split(",") if s.strip()]
                    metrics = {
                        "Number of Teachers Trained": row["number_of_teachers_trained"] or 0,
                        "Number of School Visits": row["number_of_school_visits"] or 0,
                        "Number of Sessions Conducted": row["number_of_sessions_conducted"] or 0,
                        "Number of Modules Completed": row["number_of_modules_completed"] or 0,
                    }
                    result.setdefault(partner, {}).setdefault(month, {})
                    for state in states:
                        result[partner][month][state] = metrics
                return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def run_daily_background_scheduler():
    print("Background scheduler task initiated.")
    while True:
        try:
            await check_rms_inactivity()
            await asyncio.to_thread(asyncio.run, send_quarterly_impact_reminders())
        except Exception as e:
            print(f"Error in background scheduler iteration: {e}")
        # Run every 24 hours (86400 seconds)
        await asyncio.sleep(86400)


async def run_frequent_background_scheduler():
    print("Frequent background scheduler task initiated.")
    while True:
        try:
            print("Starting background laptop sync...")
            import sys
            # Run sync.py as a subprocess
            process = await asyncio.create_subprocess_exec(
                sys.executable, "sync.py",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await process.communicate()
            if process.returncode != 0:
                print(f"Background sync failed: {stderr.decode()}")
            else:
                print("Background sync completed successfully.")
        except Exception as e:
            print(f"Error in frequent background scheduler: {e}")
        # Run every 5 minutes (300 seconds)
        await asyncio.sleep(300)


@app.on_event("startup")
async def start_background_jobs():
    background_jobs_enabled = os.getenv("ENABLE_BACKGROUND_JOBS", "true").strip().lower() in {
        "1", "true", "yes", "on"
    }
    if not background_jobs_enabled:
        print("Background jobs disabled.")
        return
    asyncio.create_task(run_daily_background_scheduler())
    asyncio.create_task(run_frequent_background_scheduler())
    # asyncio.create_task(run_email_polling_scheduler())
@app.post("/jotform-webhook")
async def jotform_webhook(request: Request):
    try:
        payload = await request.json()
    except Exception:
        form_data = await request.form()
        payload = dict(form_data)
        
    print(f"JotForm webhook received payload: {payload}")
    
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
