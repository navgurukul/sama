"""Track and apply the numbered SQL migrations in sql_scripts/.

Applied files are recorded in <schema>.schema_migrations. The default command
only reports status; nothing changes unless --apply or --baseline is given.

  python scripts/db/migrate.py                         # show applied and pending files
  python scripts/db/migrate.py --baseline phase1_021   # record files up to and including
                                                       # this prefix as already applied
  python scripts/db/migrate.py --apply                 # run pending files in order

Use --baseline once on a database where the existing scripts were applied by
hand, so they are never run twice.
"""

from __future__ import annotations

import argparse
import hashlib
import os
import sys
from pathlib import Path

import psycopg

REPO_DIR = Path(__file__).resolve().parents[2]
MIGRATIONS_DIR = REPO_DIR / "sql_scripts"


def migration_files() -> list[Path]:
    return sorted(MIGRATIONS_DIR.glob("phase*_*.sql"))


def checksum(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def ensure_table(conn: psycopg.Connection, schema: str) -> None:
    conn.execute(f"CREATE SCHEMA IF NOT EXISTS {schema}")
    conn.execute(
        f"""
        CREATE TABLE IF NOT EXISTS {schema}.schema_migrations (
            filename TEXT PRIMARY KEY,
            checksum TEXT NOT NULL,
            applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            baseline BOOLEAN NOT NULL DEFAULT FALSE
        )
        """
    )


def applied(conn: psycopg.Connection, schema: str) -> dict[str, str]:
    rows = conn.execute(f"SELECT filename, checksum FROM {schema}.schema_migrations").fetchall()
    return {name: digest for name, digest in rows}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--database-url", default=os.getenv("DATABASE_URL", ""))
    parser.add_argument("--schema", default=os.getenv("DB_SCHEMA", "sama_ops"))
    action = parser.add_mutually_exclusive_group()
    action.add_argument("--apply", action="store_true", help="run pending migrations")
    action.add_argument("--baseline", metavar="PREFIX", help="mark files up to PREFIX as applied without running them")
    args = parser.parse_args()

    if not args.database_url:
        print("DATABASE_URL is not set", file=sys.stderr)
        return 2

    files = migration_files()
    with psycopg.connect(args.database_url, autocommit=True) as conn:
        if args.apply or args.baseline:
            ensure_table(conn, args.schema)
        exists = conn.execute(
            "SELECT 1 FROM information_schema.tables WHERE table_schema = %s AND table_name = 'schema_migrations'",
            (args.schema,),
        ).fetchone()
        done = applied(conn, args.schema) if exists else {}

        if args.baseline:
            for path in files:
                if path.name not in done:
                    conn.execute(
                        f"INSERT INTO {args.schema}.schema_migrations (filename, checksum, baseline) VALUES (%s, %s, TRUE)",
                        (path.name, checksum(path)),
                    )
                    print(f"baselined {path.name}")
                if path.name.startswith(args.baseline):
                    break
            return 0

        pending = [p for p in files if p.name not in done]
        for name, digest in done.items():
            path = MIGRATIONS_DIR / name
            if path.exists() and checksum(path) != digest:
                print(f"warning: {name} changed after it was applied")

        if not args.apply:
            print(f"applied: {len(done)}  pending: {len(pending)}")
            for path in pending:
                print(f"  pending {path.name}")
            return 0

        for path in pending:
            print(f"applying {path.name}")
            conn.execute(path.read_text())
            conn.execute(
                f"INSERT INTO {args.schema}.schema_migrations (filename, checksum) VALUES (%s, %s)",
                (path.name, checksum(path)),
            )
    return 0


if __name__ == "__main__":
    sys.exit(main())
