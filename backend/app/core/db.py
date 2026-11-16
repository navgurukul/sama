"""PostgreSQL connections.

get_conn() yields a connection whose rows are dicts. On a clean exit the
transaction is committed; on an exception it is rolled back.

With DB_POOL_ENABLED=true connections come from a per-process pool instead of
being opened for every call, which saves a TCP and TLS handshake to RDS per
query. Pool settings:

DB_POOL_MIN_SIZE   connections kept open per process (default 1)
DB_POOL_MAX_SIZE   upper limit per process (default 10)
DB_POOL_TIMEOUT    seconds to wait for a free connection (default 30)
"""

from __future__ import annotations

import atexit
import os
import threading
from contextlib import contextmanager
from typing import Iterator

import psycopg
from dotenv import load_dotenv
from psycopg.rows import dict_row

from .paths import BACKEND_DIR

load_dotenv(os.path.join(BACKEND_DIR, ".env"))

DB_SCHEMA = os.getenv("DB_SCHEMA", "sama_ops")

_pool = None
_pool_lock = threading.Lock()


def _database_url() -> str:
    database_url = os.getenv("DATABASE_URL", "")
    if not database_url:
        raise RuntimeError("DATABASE_URL is not set")
    return database_url


def _connect_timeout() -> int:
    return int(os.getenv("DB_CONNECT_TIMEOUT", "10"))


def pool_enabled() -> bool:
    return os.getenv("DB_POOL_ENABLED", "false").strip().lower() in {"1", "true", "yes", "on"}


def _reset_connection(conn: psycopg.Connection) -> None:
    # Restore defaults in case a caller changed them, so the next borrower
    # gets the same connection a fresh psycopg.connect() would give.
    conn.row_factory = dict_row
    if conn.autocommit:
        conn.autocommit = False


def _get_pool():
    """Create this process's pool on first use (uvicorn workers each get their own)."""
    global _pool
    if _pool is None:
        with _pool_lock:
            if _pool is None:
                from psycopg_pool import ConnectionPool

                _pool = ConnectionPool(
                    _database_url(),
                    min_size=int(os.getenv("DB_POOL_MIN_SIZE", "1")),
                    max_size=int(os.getenv("DB_POOL_MAX_SIZE", "10")),
                    timeout=float(os.getenv("DB_POOL_TIMEOUT", "30")),
                    kwargs={"row_factory": dict_row, "connect_timeout": _connect_timeout()},
                    check=ConnectionPool.check_connection,
                    reset=_reset_connection,
                    name="sama",
                    open=True,
                )
                # Close before interpreter shutdown, when the pool's threads can still be joined.
                atexit.register(close_pool)
    return _pool


def close_pool() -> None:
    global _pool
    with _pool_lock:
        if _pool is not None:
            _pool.close()
            _pool = None


@contextmanager
def get_conn() -> Iterator[psycopg.Connection]:
    if pool_enabled():
        with _get_pool().connection() as conn:
            yield conn
        return

    with psycopg.connect(
        _database_url(),
        row_factory=dict_row,
        connect_timeout=_connect_timeout(),
    ) as conn:
        yield conn
