#!/usr/bin/env python3
"""One-command DB setup for local Postgres or RDS.

This orchestrates the existing reusable scripts:
- scripts/db/bootstrap_schema.py
- scripts/db/seed_sample_data.py

Examples:
  python scripts/db/setup/setup_new_db.py --database-url "postgresql://user:pass@host:5432/db?sslmode=require" --schema sama_ops --reset --truncate
  python scripts/db/setup/setup_new_db.py --database-url "postgresql://user:pass@host:5432/db?sslmode=require" --schema sama_ops --skip-seed
"""

from __future__ import annotations

import argparse
import os
import subprocess
import sys
from pathlib import Path
from typing import List


ROOT = Path(__file__).resolve().parents[3]
BOOTSTRAP = ROOT / "scripts" / "db" / "bootstrap_schema.py"
SEED = ROOT / "scripts" / "db" / "seed_sample_data.py"
LOAD_WORKBOOK = ROOT / "scripts" / "db" / "setup" / "load_workbook_sheets.py"


def _run(cmd: List[str]) -> None:
    print("\n> " + " ".join(cmd))
    subprocess.run(cmd, check=True)


def main() -> int:
    parser = argparse.ArgumentParser(description="Set up a new DB schema and optionally seed workbook data.")
    parser.add_argument(
        "--database-url",
        default=os.getenv("DATABASE_URL", ""),
        help="Postgres/RDS connection URL. Defaults to env DATABASE_URL.",
    )
    parser.add_argument(
        "--schema",
        default=os.getenv("DB_SCHEMA", "sama_ops"),
        help="Target schema name. Default: sama_ops",
    )
    parser.add_argument(
        "--workbook",
        default=str(ROOT / "Dev Laptop Data.xlsx"),
        help="Workbook path for seeding. Default: <repo>/Dev Laptop Data.xlsx",
    )
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Drop managed tables first, then recreate them.",
    )
    parser.add_argument(
        "--truncate",
        action="store_true",
        help="Truncate managed tables before seeding.",
    )
    parser.add_argument(
        "--skip-bootstrap",
        action="store_true",
        help="Skip schema bootstrap and only run seed.",
    )
    parser.add_argument(
        "--skip-seed",
        action="store_true",
        help="Skip seed and only create schema/tables/indexes.",
    )
    parser.add_argument(
        "--extra-workbook",
        action="append",
        default=[],
        help="Additional workbook(s) to ingest where each subsheet becomes a table. Repeatable flag.",
    )
    parser.add_argument(
        "--extra-reset",
        action="store_true",
        help="Drop and recreate extra workbook tables before loading.",
    )
    parser.add_argument(
        "--extra-truncate",
        action="store_true",
        help="Truncate extra workbook tables before loading.",
    )

    args = parser.parse_args()

    if not args.database_url:
        print("Error: --database-url is required (or set DATABASE_URL).", file=sys.stderr)
        return 2

    if not BOOTSTRAP.exists():
        print(f"Error: bootstrap script not found at {BOOTSTRAP}", file=sys.stderr)
        return 2
    if not SEED.exists():
        print(f"Error: seed script not found at {SEED}", file=sys.stderr)
        return 2
    if args.extra_workbook and not LOAD_WORKBOOK.exists():
        print(f"Error: workbook loader script not found at {LOAD_WORKBOOK}", file=sys.stderr)
        return 2

    print("Starting DB setup")
    print(f"- schema: {args.schema}")
    print(f"- bootstrap: {'no' if args.skip_bootstrap else 'yes'}")
    print(f"- seed: {'no' if args.skip_seed else 'yes'}")
    print(f"- extra workbooks: {len(args.extra_workbook)}")

    try:
        if not args.skip_bootstrap:
            bootstrap_cmd = [
                sys.executable,
                str(BOOTSTRAP),
                "--database-url",
                args.database_url,
                "--schema",
                args.schema,
            ]
            if args.reset:
                bootstrap_cmd.append("--reset")
            _run(bootstrap_cmd)

        if not args.skip_seed:
            seed_cmd = [
                sys.executable,
                str(SEED),
                "--database-url",
                args.database_url,
                "--schema",
                args.schema,
                "--workbook",
                args.workbook,
            ]
            if args.truncate:
                seed_cmd.append("--truncate")
            _run(seed_cmd)

        for workbook in args.extra_workbook:
            workbook_path = Path(workbook)
            if not workbook_path.is_absolute():
                workbook_path = ROOT / workbook_path

            extra_cmd = [
                sys.executable,
                str(LOAD_WORKBOOK),
                "--database-url",
                args.database_url,
                "--schema",
                args.schema,
                "--workbook",
                str(workbook_path),
                "--table-prefix",
                workbook_path.stem,
            ]
            if args.extra_reset:
                extra_cmd.append("--reset")
            if args.extra_truncate:
                extra_cmd.append("--truncate")
            _run(extra_cmd)

        print("\nDB setup finished successfully.")
        return 0
    except subprocess.CalledProcessError as exc:
        print(f"\nDB setup failed. Exit code: {exc.returncode}", file=sys.stderr)
        return exc.returncode


if __name__ == "__main__":
    raise SystemExit(main())
