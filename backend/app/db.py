from __future__ import annotations

import os
from contextlib import contextmanager
from typing import Iterator

import psycopg
from psycopg.rows import dict_row


DATABASE_URL = os.getenv("DATABASE_URL", "")
DB_SCHEMA = os.getenv("DB_SCHEMA", "sama_ops")


@contextmanager
def get_conn() -> Iterator[psycopg.Connection]:
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL is not set")
    with psycopg.connect(DATABASE_URL, row_factory=dict_row) as conn:
        yield conn
