"""Write operations behind the legacy /exec POST types (laptops, pickups, stage runs)."""

from __future__ import annotations

import json
import uuid
from datetime import date, datetime, timedelta
from typing import Any, Dict, Optional

from fastapi import HTTPException

from ...common.payload import (
    _normalize_condition_status,
    _normalize_laptop_status,
    _normalize_rows,
    _normalize_stage_code,
    _normalize_stage_id,
    _parse_int,
    _payload_get,
)
from ...core.db import DB_SCHEMA, get_conn
from ...domain.donors import _get_or_create_donor_id
from ...domain.laptops.stages import (
    _evaluate_requires_different_actor_gate,
    _evaluate_run_mandatory_gate,
    _evaluate_stage_gate_rules,
    _resolve_stage,
    _resolve_transition_stage,
)
from ...integrations.llm import _parse_ngo_request_with_ai


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
    
    # Intercept "Not Working" -> "Working" change to automatically route back to "Laptop Received"
    cur.execute(f"SELECT working, status FROM {DB_SCHEMA}.laptop_labeling WHERE id = %s", (laptop_id,))
    existing_row = cur.fetchone()
    
    def is_truthy(val):
        if val is None:
            return False
        return str(val).strip().lower() in ("true", "1", "yes", "y", "working")
        
    def is_explicit_not_working(val):
        if val is None:
            return False
        return str(val).strip().lower() in ("false", "0", "no", "n", "not working", "not_working")
        
    new_working_raw = _payload_get(item, "working", "Working")

    if existing_row:
        old_working = existing_row["working"]
        old_status = existing_row["status"]
        
        # If it was marked as NOT working previously (by working field or status), but is being marked AS working now
        if (is_explicit_not_working(old_working) or old_status == "NOT_WORKING") and is_truthy(new_working_raw):
            status_value = "LAPTOP_RECEIVED"
            item["status"] = "LAPTOP_RECEIVED" # Update item dictionary so it persists if used later
        # If it is being explicitly marked as "Not Working"
        elif is_explicit_not_working(new_working_raw):
            status_value = "NOT_WORKING"
            item["status"] = "NOT_WORKING"
    else:
        # If it is a brand new laptop (no existing row) and it is explicitly marked as "Not Working"
        if is_explicit_not_working(new_working_raw):
            status_value = "NOT_WORKING"
            item["status"] = "NOT_WORKING"

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
            (lambda v: None if v == "" else v)(_payload_get(item, "laptopWeight", "laptop weight", "Laptop Weight", "laptop_weight")),
            other_issues,
            _payload_get(item, "macAddress", "Mac address", "Mac Address", "mac_address"),
            (lambda v: None if v == "" else v)(_payload_get(item, "batteryCapacity", "Battery Capacity", "battery_capacity")),
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
                    if result not in {"PASS", "FAIL", "NA", "SKIP"}:
                        raise HTTPException(status_code=400, detail="result must be PASS, FAIL, NA, or SKIP")

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
