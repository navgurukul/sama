"""Donor name normalisation and donor master lookups."""

from __future__ import annotations

import re
from typing import Optional

from ..core.config import DONOR_TABLE
from ..core.db import DB_SCHEMA


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
