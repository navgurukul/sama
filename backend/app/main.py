from __future__ import annotations

import json
import os
import re
import uuid
from datetime import date, datetime, timedelta
from typing import Any, Dict, List, Optional

import boto3
import httpx
from botocore.exceptions import ClientError
from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .db import DB_SCHEMA, get_conn


LEGACY_LAPTOP_API_URL = os.getenv("LEGACY_LAPTOP_API_URL", "").strip()
USER_PROFILE_TABLE_PREFIX = os.getenv("USER_PROFILE_TABLE_PREFIX", "user_profile").strip() or "user_profile"
USER_REGISTRATION_TABLE = f"{USER_PROFILE_TABLE_PREFIX}_registration"
USER_ROLE_TABLE = f"{USER_PROFILE_TABLE_PREFIX}_userrole"
DONOR_TABLE = os.getenv("DONOR_TABLE", "donor").strip() or "donor"

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
}


STAGE_STATUS_VALUES = {
    "LAPTOP_RECEIVED",
    "REFURBISHMENT_TESTING",
    "QC_CHECK",
    "DISTRIBUTION",
    "POST_DEPLOYMENT_15D",
    "MONTHLY_MONITORING",
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
    "LAPTOP_RECEIVED": {"pass": "REFURBISHMENT_TESTING", "fail": "LAPTOP_RECEIVED"},
    "REFURBISHMENT_TESTING": {"pass": "QC_CHECK", "fail": "REFURBISHMENT_TESTING"},
    "QC_CHECK": {"pass": "DISTRIBUTION", "fail": "REFURBISHMENT_TESTING"},
    "DISTRIBUTION": {"pass": "POST_DEPLOYMENT_15D", "fail": "DISTRIBUTION"},
    "POST_DEPLOYMENT_15D": {"pass": "MONTHLY_MONITORING", "fail": "POST_DEPLOYMENT_15D"},
    "MONTHLY_MONITORING": {"fail": "MONTHLY_MONITORING"},
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
    if event_key not in {"pass", "fail"}:
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
        for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%m/%d/%Y", "%Y/%m/%d", "%d/%m/%Y"):
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


def _handle_post_type(payload: Dict[str, Any]) -> Dict[str, Any]:
    type_name = payload.get("type")

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
