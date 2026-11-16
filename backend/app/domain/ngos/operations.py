"""Generic NGO operation records (documents, reports, MOUs, statuses)."""

from __future__ import annotations

import json
from typing import Any, Dict, Optional

from ...core.db import DB_SCHEMA, get_conn


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
