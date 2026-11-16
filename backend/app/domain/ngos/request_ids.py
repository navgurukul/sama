"""Stable public IDs ("SAM-<n>") for NGO requests in ngo_requests.

These IDs used to be recomputed on every read as "highest SAM number among
registered NGOs + the request's position in ngo_requests". Users and
beneficiaries store them, so deleting a request renumbered every later one and
pointed stored references at the wrong NGO.

Each request now keeps its ID in ngo_requests.display_id:
- The first backfill gives every existing request exactly the ID it had under
  the old rule, so stored references keep their meaning.
- Later requests get the next number after the highest ID ever issued (kept in
  ngo_request_id_state), which is what the old rule produced as long as nothing
  was deleted.
- IDs are never reused or shifted, even when the newest request is deleted.

If the column cannot be created (for example, missing privileges), callers fall
back to the old computation and behaviour is unchanged.
"""

from __future__ import annotations

from typing import Any, Dict, Iterable, Optional

from ...core.db import DB_SCHEMA, get_conn

PREFIX = "SAM-"
_LOCK_KEY = "sama.ngo_requests.display_id"
_column_ready = False


def serial_of(value: Any) -> Optional[int]:
    """Number in a "SAM-<n>" ID, parsed the way the dashboard always has."""
    text = str(value or "")
    if not text.startswith(PREFIX):
        return None
    try:
        return int(text.split("-")[-1])
    except ValueError:
        return None


def max_serial(ids: Iterable[Any]) -> int:
    return max((n for n in (serial_of(i) for i in ids) if n is not None), default=0)


def _ensure_column(cur: Any) -> None:
    """Create the column, index and state table if missing.

    Checks the catalog first: ALTER TABLE takes an exclusive lock even when the
    column already exists, which would wait on any open reader of ngo_requests.
    """
    global _column_ready
    if _column_ready:
        return
    cur.execute(
        """
        SELECT
            EXISTS (SELECT 1 FROM information_schema.columns
                    WHERE table_schema = %(s)s AND table_name = 'ngo_requests' AND column_name = 'display_id') AS has_column,
            EXISTS (SELECT 1 FROM pg_indexes
                    WHERE schemaname = %(s)s AND indexname = 'uq_ngo_requests_display_id') AS has_index,
            EXISTS (SELECT 1 FROM information_schema.tables
                    WHERE table_schema = %(s)s AND table_name = 'ngo_request_id_state') AS has_state
        """,
        {"s": DB_SCHEMA},
    )
    found = cur.fetchone()
    if not (found["has_column"] and found["has_index"] and found["has_state"]):
        # Give up quickly rather than queue behind long-running readers; callers fall back.
        cur.execute("SET LOCAL lock_timeout = '5s'")
        if not found["has_column"]:
            cur.execute(f"ALTER TABLE {DB_SCHEMA}.ngo_requests ADD COLUMN IF NOT EXISTS display_id TEXT")
        if not found["has_index"]:
            cur.execute(
                f"CREATE UNIQUE INDEX IF NOT EXISTS uq_ngo_requests_display_id "
                f"ON {DB_SCHEMA}.ngo_requests (display_id) WHERE display_id IS NOT NULL"
            )
        if not found["has_state"]:
            cur.execute(
                f"""
                CREATE TABLE IF NOT EXISTS {DB_SCHEMA}.ngo_request_id_state (
                    singleton BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (singleton),
                    last_serial INTEGER NOT NULL
                )
                """
            )
    _column_ready = True


def _assign_missing(cur: Any) -> None:
    """Give an ID to every request that has none. Caller holds the advisory lock."""
    cur.execute(f"SELECT id, display_id FROM {DB_SCHEMA}.ngo_requests ORDER BY id ASC")
    rows = cur.fetchall()
    cur.execute(f"SELECT last_serial FROM {DB_SCHEMA}.ngo_request_id_state")
    state = cur.fetchone()
    cur.execute(f"SELECT id FROM {DB_SCHEMA}.external_registered_ngo")
    external_max = max_serial(r["id"] for r in cur.fetchall())

    if state is None and not any(r["display_id"] for r in rows):
        # First backfill: reproduce the old position-based IDs exactly.
        assignments = [(f"{PREFIX}{external_max + pos}", r["id"]) for pos, r in enumerate(rows, start=1)]
        last_serial = external_max + len(rows)
    else:
        last_serial = max(
            state["last_serial"] if state else 0,
            external_max,
            max_serial(r["display_id"] for r in rows),
        )
        assignments = []
        for r in rows:
            if not r["display_id"]:
                last_serial += 1
                assignments.append((f"{PREFIX}{last_serial}", r["id"]))

    cur.executemany(
        f"UPDATE {DB_SCHEMA}.ngo_requests SET display_id = %s WHERE id = %s AND display_id IS NULL",
        assignments,
    )
    cur.execute(
        f"""
        INSERT INTO {DB_SCHEMA}.ngo_request_id_state (singleton, last_serial) VALUES (TRUE, %s)
        ON CONFLICT (singleton) DO UPDATE SET last_serial = GREATEST(
            {DB_SCHEMA}.ngo_request_id_state.last_serial, EXCLUDED.last_serial
        )
        """,
        (last_serial,),
    )


def load_display_ids() -> Optional[Dict[Any, str]]:
    """Map ngo_requests.id to its stored public ID, assigning any missing ones.

    Returns None when stored IDs are unavailable, so callers keep the old rule.
    Call it before opening a transaction that reads ngo_requests: it uses its
    own connection and may need to write.
    """
    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                _ensure_column(cur)
                cur.execute(
                    f"SELECT EXISTS (SELECT 1 FROM {DB_SCHEMA}.ngo_requests WHERE display_id IS NULL) AS missing, "
                    f"EXISTS (SELECT 1 FROM {DB_SCHEMA}.ngo_request_id_state) AS tracked"
                )
                status = cur.fetchone()
                if status["missing"] or not status["tracked"]:
                    cur.execute("SELECT pg_advisory_xact_lock(hashtext(%s))", (_LOCK_KEY,))
                    _assign_missing(cur)
                cur.execute(f"SELECT id, display_id FROM {DB_SCHEMA}.ngo_requests")
                ids = {r["id"]: r["display_id"] for r in cur.fetchall()}
                conn.commit()
                return ids
    except Exception as exc:
        print(f"Stored NGO request IDs unavailable, using computed IDs: {exc}")
        return None


def find_request_id(display_id: str) -> Optional[Any]:
    """ngo_requests.id for a stored public ID; None if not found or unavailable."""
    ids = load_display_ids()
    if ids is None:
        raise LookupError("stored NGO request IDs are unavailable")
    wanted = display_id.strip()
    return next((db_id for db_id, value in ids.items() if value == wanted), None)
