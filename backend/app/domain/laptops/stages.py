"""Laptop stage workflow engine: stage resolution, checklist gates and stage-run queries."""

from __future__ import annotations

import json
import re
from typing import Any, Dict, List, Optional

from fastapi import HTTPException, Request

from ...common.payload import (
    _count_urls_from_text,
    _is_unknown_value,
    _normalize_rows,
    _normalize_stage_code,
    _normalize_stage_id,
    _parse_int,
)
from ...core.config import DONOR_TABLE
from ...core.db import DB_SCHEMA, get_conn
from ...domain.laptops.vocabulary import (
    STAGE1_DASHBOARD_REQUIRED_FIELDS,
    STAGE2_DASHBOARD_ITEM_CODE,
    STAGE2_FUNCTIONAL_TEST_ITEM_CODES,
    STAGE2_RMS_ITEM_CODE,
    STAGE_STATUS_VALUES,
    STAGE_TRANSITIONS,
)
from ...integrations.storage import _resolve_s3_evidence


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

    violations: List[str] = []

    if requires_different_actor:
        # Enforce rule: If this specific stage failed previously, the person who failed it CANNOT run it again.
        cur.execute(
            f"""
            SELECT COALESCE(r.completed_by, r.started_by) AS actor
            FROM {DB_SCHEMA}.laptop_stage_run r
            WHERE r.laptop_id = %s
              AND r.stage_id = %s
              AND r.outcome = 'FAIL'
            ORDER BY r.run_id DESC
            LIMIT 1
            """,
            (laptop_id, row["stage_id"]),
        )
        last_failed_run = cur.fetchone()
        if last_failed_run:
            failed_actor = str(last_failed_run.get("actor") or "").strip()
            if failed_actor:
                if completed_actor and completed_actor.lower() == failed_actor.lower():
                    violations.append(
                        f"completedBy ({completed_actor}) must differ from the person who previously failed this stage ({failed_actor})"
                    )
                if verifier_actor and verifier_actor.lower() == failed_actor.lower():
                    violations.append(
                        f"verifierName ({verifier_actor}) must differ from the person who previously failed this stage ({failed_actor})"
                    )

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
    # Check if this laptop is a macbook
    cur.execute(
        f"""
        SELECT l.manufacturer_model
        FROM {DB_SCHEMA}.laptop_stage_run r
        JOIN {DB_SCHEMA}.laptop_labeling l ON l.id = r.laptop_id
        WHERE r.run_id = %s
        """,
        (run_id,)
    )
    model_row = cur.fetchone()
    is_macbook = False
    if model_row and model_row.get("manufacturer_model"):
        model = str(model_row.get("manufacturer_model")).lower()
        is_macbook = "macbook" in model or "apple" in model

    cur.execute(
        f"""
        SELECT
            r.run_id,
            r.stage_id,
            r.stage_code,
            r.laptop_id,
            count(*) FILTER (WHERE i.is_mandatory AND NOT (%(is_macbook)s = TRUE AND (i.item_text ILIKE '%%RMS%%' OR i.item_text ILIKE '%%HDMI%%'))) AS mandatory_total,
            count(*) FILTER (WHERE i.is_mandatory AND NOT (%(is_macbook)s = TRUE AND (i.item_text ILIKE '%%RMS%%' OR i.item_text ILIKE '%%HDMI%%')) AND resp.result = 'PASS') AS mandatory_passed,
            count(*) FILTER (WHERE i.is_mandatory AND NOT (%(is_macbook)s = TRUE AND (i.item_text ILIKE '%%RMS%%' OR i.item_text ILIKE '%%HDMI%%')) AND resp.result = 'FAIL') AS mandatory_failed,
            count(*) FILTER (WHERE i.is_mandatory AND NOT (%(is_macbook)s = TRUE AND (i.item_text ILIKE '%%RMS%%' OR i.item_text ILIKE '%%HDMI%%')) AND (resp.response_id IS NULL OR resp.result = 'NA')) AS mandatory_missing
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
        WHERE r.run_id = %(run_id)s
        GROUP BY r.run_id, r.stage_id, r.stage_code, r.laptop_id
        """,
        {"run_id": run_id, "is_macbook": is_macbook}
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
    if item_code in (STAGE2_RMS_ITEM_CODE, "PORT_TEST_DONE") and result in ("SKIP", "SKIPPED", "SKIPPED_MAC"):
        cur.execute(f"""
            SELECT l.manufacturer_model
            FROM {DB_SCHEMA}.laptop_stage_run r
            JOIN {DB_SCHEMA}.laptop_labeling l ON l.id = r.laptop_id
            WHERE r.run_id = %s
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
