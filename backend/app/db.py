from __future__ import annotations

import os
from contextlib import contextmanager
from typing import Iterator

import psycopg
from psycopg.rows import dict_row
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env"))

DB_SCHEMA = os.getenv("DB_SCHEMA", "sama_ops")


@contextmanager
def get_conn() -> Iterator[psycopg.Connection]:
    database_url = os.getenv("DATABASE_URL", "")
    if not database_url:
        raise RuntimeError("DATABASE_URL is not set")
    connect_timeout = int(os.getenv("DB_CONNECT_TIMEOUT", "10"))
    with psycopg.connect(
        database_url,
        row_factory=dict_row,
        connect_timeout=connect_timeout,
    ) as conn:
        yield conn
