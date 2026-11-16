"""Request and row helpers shared by every domain: type dispatch, value normalisation."""

from __future__ import annotations

import re
from typing import Any, Dict, List, Optional

from fastapi import HTTPException, Request

from ..domain.laptops.vocabulary import CONDITION_STATUS_VALUES, UNKNOWN_VALUE_MARKERS


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
