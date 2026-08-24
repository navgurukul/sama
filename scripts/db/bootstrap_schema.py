#!/usr/bin/env python3
"""Create sheet-first SAMA schemas and tables in PostgreSQL.

Designed to be reproducible across local Postgres and AWS RDS.

Usage examples:
  python scripts/db/bootstrap_schema.py --database-url postgresql://user:pass@localhost:5432/sama
  python scripts/db/bootstrap_schema.py --database-url "$DATABASE_URL" --schema sama_ops
  python scripts/db/bootstrap_schema.py --database-url "$DATABASE_URL" --schema sama_ops --reset
"""

from __future__ import annotations

import argparse
import os
import re
import sys
from typing import Iterable, List


def _connect(database_url: str):
    """Return (connection, execute_fn, close_fn) supporting psycopg3 or psycopg2."""
    try:
        import psycopg  # type: ignore

        conn = psycopg.connect(database_url)

        def execute_sql(sql: str) -> None:
            with conn.cursor() as cur:
                cur.execute(sql)

        def close() -> None:
            conn.close()

        return conn, execute_sql, close
    except Exception:
        pass

    try:
        import psycopg2  # type: ignore

        conn = psycopg2.connect(database_url)

        def execute_sql(sql: str) -> None:
            with conn.cursor() as cur:
                cur.execute(sql)

        def close() -> None:
            conn.close()

        return conn, execute_sql, close
    except Exception as exc:
        raise RuntimeError(
            "No PostgreSQL driver found. Install one of: 'pip install psycopg[binary]' or 'pip install psycopg2-binary'."
        ) from exc


def _validate_identifier(name: str, label: str) -> str:
    if not re.match(r"^[A-Za-z_][A-Za-z0-9_]*$", name):
        raise ValueError(f"Invalid {label}: {name!r}. Use letters, numbers, and underscore only.")
    return name


def _base_tables(schema: str) -> List[str]:
    s = schema
    return [
        f"""
        CREATE TABLE IF NOT EXISTS {s}.laptop_labeling (
          id text PRIMARY KEY,
          date_committed timestamptz,
          donor_company_name text,
          ram text,
          rom text,
          manufacturer_model text,
          processor text,
          manufacturing_date date,
          condition_status text,
          minor_issues text,
          major_issues text,
          other_issues text,
          inventory_location text,
          laptop_weight text,
          mac_address text,
          status text,
          working text,
          battery_capacity numeric,
          allocated_to text,
          last_updated_on timestamptz,
          last_updated_by text,
          assigned_to text,
          inspection_files text,
          activitywatch_pdf text,
          activity_date timestamptz,
          afk_time text,
          usage_hours numeric,
          off_times integer,
          last_delivery_date timestamptz,
          refurbishment_date timestamptz,
          batch text,
          comment_for_issues text
        );
        """,
        f"""
        CREATE TABLE IF NOT EXISTS {s}.userdetails (
          id bigint PRIMARY KEY,
          ngo text,
          name text,
          email text,
          contact_number text,
          address text,
          address_state text,
          id_proof_type text,
          id_proof_number text,
          qualification text,
          occupation text,
          date_of_birth date,
          use_case text,
          family_members_count integer,
          guardian_occupation text,
          family_annual_income numeric,
          status text,
          laptop_assigned text,
          id_link text,
          income_certificate_link text,
          date_time timestamptz,
          doner text,
          assigned_at timestamptz
        );
        """,
        f"""
        CREATE TABLE IF NOT EXISTS {s}.pickup (
          pickup_id text PRIMARY KEY,
          donor_company text,
          poc_name text,
          poc_contact text,
          poc_email text,
          number_of_laptops integer,
          pickup_location text,
          pickup_by text,
          current_date_time timestamptz,
          status text,
          confirm_pickup_date timestamptz,
          updated_on timestamptz,
          updated_by text
        );
        """,
        f"""
        CREATE TABLE IF NOT EXISTS {s}.audit_for_laptops (
          audit_id bigserial PRIMARY KEY,
          id text REFERENCES {s}.laptop_labeling(id),
          field text,
          from_value text,
          to_value text,
          updated_by text,
          updated_on timestamptz
        );
        """,
        f"""
        CREATE TABLE IF NOT EXISTS {s}.preliminary (
          id bigint PRIMARY KEY,
          ngoid text,
          number_of_school integer,
          number_of_teacher integer,
          number_of_student integer,
          number_of_female_student integer,
          states text,
          course text,
          unit text,
          doner text,
          request_type text,
          ngo_prelim_requests text
        );
        """,
        f"""
        CREATE TABLE IF NOT EXISTS {s}.report (
          id bigint PRIMARY KEY,
          ngoid text,
          month text,
          number_of_teachers_trained integer,
          number_of_school_visits integer,
          number_of_sessions_conducted integer,
          number_of_modules_completed integer,
          total_students_intent_rating_per_module numeric,
          status text
        );
        """,
        f"""
        CREATE TABLE IF NOT EXISTS {s}.laptop_user_map (
          map_id bigserial PRIMARY KEY,
          laptop_id text REFERENCES {s}.laptop_labeling(id),
          user_id bigint REFERENCES {s}.userdetails(id),
          issued_date date
        );
        """,
        f"""
        CREATE TABLE IF NOT EXISTS {s}.metrics_base (
          metric_id bigserial PRIMARY KEY,
          field text,
          multiplier text,
          col_3 text,
          col_4 text,
          data_to_be_displayed_on_dashboard text
        );
        """,
        f"""
        CREATE TABLE IF NOT EXISTS {s}.infection (
          serial_number text PRIMARY KEY,
          date date,
          summary text,
          log text
        );
        """,
        f"""
        CREATE TABLE IF NOT EXISTS {s}.average_days_count (
          id text,
          pickup_requested_date date,
          distributed_date date,
          days_difference integer,
          calculated_on date
        );
        """,
        f"""
        CREATE TABLE IF NOT EXISTS {s}.external_registered_ngo (
          id text PRIMARY KEY,
          doner text
        );
        """,
    ]


def _control_tables(schema: str) -> List[str]:
    s = schema
    return [
        f"""
        CREATE TABLE IF NOT EXISTS {s}.laptop_event_log (
          event_id bigserial PRIMARY KEY,
          laptop_id text NOT NULL REFERENCES {s}.laptop_labeling(id),
          event_type text,
          field_name text,
          old_value text,
          new_value text,
          actor text,
          event_time timestamptz NOT NULL DEFAULT now(),
          reason text
        );
        """,
        f"""
        CREATE TABLE IF NOT EXISTS {s}.laptop_versions (
          version_id bigserial PRIMARY KEY,
          laptop_id text NOT NULL REFERENCES {s}.laptop_labeling(id),
          version_no bigint NOT NULL,
          snapshot_json jsonb NOT NULL,
          changed_by text,
          changed_at timestamptz NOT NULL DEFAULT now(),
          change_reason text,
          UNIQUE (laptop_id, version_no)
        );
        """,
        f"""
        CREATE TABLE IF NOT EXISTS {s}.laptop_stage_runs (
          stage_run_id bigserial PRIMARY KEY,
          laptop_id text NOT NULL REFERENCES {s}.laptop_labeling(id),
          stage_name text NOT NULL,
          run_status text NOT NULL,
          started_by text,
          started_at timestamptz,
          completed_by text,
          completed_at timestamptz
        );
        """,
        f"""
        CREATE TABLE IF NOT EXISTS {s}.laptop_checklist_responses (
          response_id bigserial PRIMARY KEY,
          stage_run_id bigint NOT NULL REFERENCES {s}.laptop_stage_runs(stage_run_id) ON DELETE CASCADE,
          checklist_item text NOT NULL,
          response_value text,
          responded_by text,
          responded_at timestamptz,
          remark text
        );
        """,
        f"""
        CREATE TABLE IF NOT EXISTS {s}.qc_checks (
          qc_check_id bigserial PRIMARY KEY,
          laptop_id text NOT NULL REFERENCES {s}.laptop_labeling(id),
          stage_run_id bigint REFERENCES {s}.laptop_stage_runs(stage_run_id) ON DELETE SET NULL,
          qc_layer text,
          qc_result text,
          defect_type text,
          checked_by text,
          checked_at timestamptz,
          remark text
        );
        """,
        f"""
        CREATE TABLE IF NOT EXISTS {s}.issue_feedback (
          issue_id bigserial PRIMARY KEY,
          laptop_id text NOT NULL REFERENCES {s}.laptop_labeling(id),
          issue_source text,
          issue_category text,
          severity text,
          reported_by text,
          reported_at timestamptz,
          resolution_action text,
          resolved_at timestamptz
        );
        """,
    ]


def _indexes(schema: str) -> List[str]:
    s = schema
    return [
        f"CREATE INDEX IF NOT EXISTS idx_{s}_laptop_id ON {s}.laptop_labeling(id);",
        f"CREATE INDEX IF NOT EXISTS idx_{s}_laptop_mac ON {s}.laptop_labeling(mac_address);",
        f"CREATE INDEX IF NOT EXISTS idx_{s}_laptop_status ON {s}.laptop_labeling(status);",
        f"CREATE INDEX IF NOT EXISTS idx_{s}_laptop_working ON {s}.laptop_labeling(working);",
        f"CREATE INDEX IF NOT EXISTS idx_{s}_laptop_assigned_to ON {s}.laptop_labeling(assigned_to);",
        f"CREATE INDEX IF NOT EXISTS idx_{s}_laptop_allocated_to ON {s}.laptop_labeling(allocated_to);",
        f"CREATE INDEX IF NOT EXISTS idx_{s}_laptop_updated_on ON {s}.laptop_labeling(last_updated_on DESC);",
        f"CREATE INDEX IF NOT EXISTS idx_{s}_audit_id ON {s}.audit_for_laptops(id);",
        f"CREATE INDEX IF NOT EXISTS idx_{s}_audit_updated_on ON {s}.audit_for_laptops(updated_on DESC);",
        f"CREATE INDEX IF NOT EXISTS idx_{s}_user_email ON {s}.userdetails(email);",
        f"CREATE INDEX IF NOT EXISTS idx_{s}_user_contact ON {s}.userdetails(contact_number);",
        f"CREATE INDEX IF NOT EXISTS idx_{s}_event_laptop_time ON {s}.laptop_event_log(laptop_id, event_time DESC);",
        f"CREATE INDEX IF NOT EXISTS idx_{s}_versions_laptop_no ON {s}.laptop_versions(laptop_id, version_no DESC);",
        f"CREATE INDEX IF NOT EXISTS idx_{s}_stage_laptop_name ON {s}.laptop_stage_runs(laptop_id, stage_name);",
        f"CREATE INDEX IF NOT EXISTS idx_{s}_checklist_stage_run ON {s}.laptop_checklist_responses(stage_run_id);",
        f"CREATE INDEX IF NOT EXISTS idx_{s}_qc_laptop_layer ON {s}.qc_checks(laptop_id, qc_layer);",
        f"CREATE INDEX IF NOT EXISTS idx_{s}_feedback_laptop_time ON {s}.issue_feedback(laptop_id, reported_at DESC);",
        f"""
        DO $$
        BEGIN
          BEGIN
            CREATE EXTENSION IF NOT EXISTS pg_trgm;
          EXCEPTION WHEN insufficient_privilege THEN
            RAISE NOTICE 'pg_trgm extension was not created due to privileges';
          END;

          IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
            EXECUTE 'CREATE INDEX IF NOT EXISTS idx_{s}_laptop_id_trgm ON {s}.laptop_labeling USING gin (id gin_trgm_ops)';
            EXECUTE 'CREATE INDEX IF NOT EXISTS idx_{s}_laptop_mac_trgm ON {s}.laptop_labeling USING gin (mac_address gin_trgm_ops)';
            EXECUTE 'CREATE INDEX IF NOT EXISTS idx_{s}_laptop_major_issues_trgm ON {s}.laptop_labeling USING gin (major_issues gin_trgm_ops)';
            EXECUTE 'CREATE INDEX IF NOT EXISTS idx_{s}_laptop_minor_issues_trgm ON {s}.laptop_labeling USING gin (minor_issues gin_trgm_ops)';
            EXECUTE 'CREATE INDEX IF NOT EXISTS idx_{s}_laptop_assigned_to_trgm ON {s}.laptop_labeling USING gin (assigned_to gin_trgm_ops)';
            EXECUTE 'CREATE INDEX IF NOT EXISTS idx_{s}_user_email_trgm ON {s}.userdetails USING gin (email gin_trgm_ops)';
            EXECUTE 'CREATE INDEX IF NOT EXISTS idx_{s}_user_contact_trgm ON {s}.userdetails USING gin (contact_number gin_trgm_ops)';
          END IF;
        END $$;
        """,
    ]


def _drop_order(schema: str) -> Iterable[str]:
    s = schema
    tables = [
        "laptop_checklist_responses",
        "qc_checks",
        "issue_feedback",
        "laptop_stage_runs",
        "laptop_versions",
        "laptop_event_log",
        "laptop_user_map",
        "audit_for_laptops",
        "average_days_count",
        "report",
        "preliminary",
        "pickup",
        "metrics_base",
        "infection",
        "external_registered_ngo",
        "userdetails",
        "laptop_labeling",
    ]
    for t in tables:
        yield f"DROP TABLE IF EXISTS {s}.{t} CASCADE;"


def bootstrap(database_url: str, schema: str, reset: bool) -> None:
    schema = _validate_identifier(schema, "schema name")
    conn, execute_sql, close = _connect(database_url)

    try:
        execute_sql(f"CREATE SCHEMA IF NOT EXISTS {schema};")

        if reset:
            for stmt in _drop_order(schema):
                execute_sql(stmt)

        for stmt in _base_tables(schema):
            execute_sql(stmt)

        for stmt in _control_tables(schema):
            execute_sql(stmt)

        for stmt in _indexes(schema):
            execute_sql(stmt)

        conn.commit()
        print(f"Schema bootstrap completed successfully in schema: {schema}")
    except Exception:
        conn.rollback()
        raise
    finally:
        close()


def main() -> int:
    parser = argparse.ArgumentParser(description="Bootstrap SAMA sheet-first schema in PostgreSQL.")
    parser.add_argument(
        "--database-url",
        default=os.getenv("DATABASE_URL", ""),
        help="PostgreSQL connection URL. Defaults to env DATABASE_URL.",
    )
    parser.add_argument(
        "--schema",
        default=os.getenv("DB_SCHEMA", "sama_ops"),
        help="Target schema name. Default: sama_ops",
    )
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Drop managed tables in target schema before recreating.",
    )

    args = parser.parse_args()

    if not args.database_url:
        print("Error: --database-url is required (or set DATABASE_URL).", file=sys.stderr)
        return 2

    try:
        bootstrap(args.database_url, args.schema, args.reset)
        return 0
    except Exception as exc:
        print(f"Bootstrap failed: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
