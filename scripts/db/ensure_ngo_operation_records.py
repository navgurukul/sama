#!/usr/bin/env python3
"""
Ensure ngo_operation_records table exists and insert a sample 'donorQuestion' payload if missing.

Usage:
  export DATABASE_URL="postgres://user:pass@host:5432/dbname"
  export DB_SCHEMA="sama_ops_test"   # optional, defaults to sama_ops_test
  python3 scripts/db/ensure_ngo_operation_records.py

Or pass CLI args:
  python3 scripts/db/ensure_ngo_operation_records.py --database-url "..." --schema sama_ops_test

This script is idempotent and safe for dev environments. It uses CREATE TABLE IF NOT EXISTS
and only inserts the sample payload if a global (ngo_id IS NULL) donorQuestion record is not present.
"""

from __future__ import annotations
import argparse
import os
import json
import sys


def _connect(database_url: str):
    """Try to connect using psycopg (psycopg3) or psycopg2. Return a connection object."""
    try:
        import psycopg as pg  # type: ignore
        conn = pg.connect(database_url)
        return conn
    except Exception:
        pass
    try:
        import psycopg2 as pg2  # type: ignore
        conn = pg2.connect(database_url)
        return conn
    except Exception as exc:
        print("ERROR: Could not connect to the database. Install psycopg or psycopg2 and ensure DATABASE_URL is correct.")
        raise


SAMPLE_PAYLOAD = [
    {"type":"text","name":"organizationName","question":"What is the name of the organization? *","required":True},
    {"type":"text","name":"registrationNumber","question":"What is the NGO's official registration number? *","required":True},
    {"type":"text","name":"primaryContactName","question":"Please provide the full name of the primary contact person for your NGO *","required":True},
    {"type":"text","name":"contactNumber","question":"Please provide the mobile number of the concerned person *","required":True},
    {"type":"text","name":"email","question":"Please provide an email address of the concerned person. *","required":True},
    {"type":"select","name":"operatingState","question":"In which state is your organization currently operating? *","options":["Maharashtra","Karnataka","Delhi","Other"],"required":True},
    {"type":"checkbox","name":"location","question":"What is your organization's location of operation?","options":["Urban","Rural","Semi-Urban"]},
    {"type":"radio","name":"yearsOperating","question":"How many years has your organization been working? *","options":["Less than 2 years","2 - 5 years","5 - 10 years","10+ years"],"required":True},
    {"type":"radioWithOther","name":"focusArea","question":"What is the primary focus area of your organization? *","options":["Education","Employment/Job placement","Digital literacy","Women empowerment","Other"],"required":True},
    {"type":"radio","name":"worksWithWomen","question":"Does your NGO primarily work with underprivileged women? *","options":["Yes","No","Partially (Some projects focus on this)"],"required":True},
    {"type":"radioWithOther","name":"infrastructure","question":"What infrastructure is available for laptop use? *","options":["Dedicated computer lab","Beneficiaries will use laptops at home","Shared space with Wi-Fi","No specific infrastructure in place","Other"],"required":True},
    {"type":"checkbox","name":"beneficiarySelection","question":"How does your NGO identify beneficiaries for laptop distribution?","options":["Economic background","Educational background","Employment status","Other"]},
    {"type":"text","name":"numberOfBeneficiaries","question":"How many beneficiaries does your NGO plan to serve with the laptops? *","required":False},
    {"type":"radioWithOther","name":"ageGroup","question":"What is the age group of the beneficiaries? *","options":["18-22","22-30","30+","Other"],"required":True},
    {"type":"checkbox","name":"primaryUse","question":"What will be the primary use of the laptops?","options":["Education","Employment","Entrepreneurship","Other"]},
    {"type":"radioWithOther","name":"expectedOutcome","question":"What are the expected outcomes from the use of the laptops? *","options":["Securing full-time employment","Securing part-time employment or freelance work","Completing education or certifications","Starting a business","No specific outcome","Other"],"required":True},
    {"type":"radioWithOther","name":"laptopTracking","question":"How do you plan to track the usage of the laptops? *","options":["Regular beneficiary feedback","Progress reports from beneficiaries","Monitoring online course completion","Employment verification","Other"],"required":True},
    {"type":"radio","name":"jobsCreated","question":"How many jobs do you anticipate creating in the next year through the use of the laptops? *","options":["1 - 10","10 - 20","20 - 30","30 - 50","50+"],"required":True},
    {"type":"radioWithOther","name":"previousProjects","question":"Has your NGO previously undertaken similar projects? *","options":["Yes, multiple similar projects","Yes, but on a smaller scale","No, this is our first project of this kind","Other"],"required":True},
    {"type":"radioWithOther","name":"sufficientStaff","question":"Does your NGO have sufficient staff to support beneficiaries in utilizing the laptops? *","options":["Yes, dedicated staff for digital literacy/employment","Yes, but shared staff with other projects","No, we will need external support","Other"],"required":True},
    {"type":"text","name":"orgLaptopRequire","question":"How many laptops does your organisation require? *","required":True},
    {"type":"fileUpload","name":"impactReport","question":"Please share any impact reports or documentation related to your previous projects.","required":False}
]


def main():
    parser = argparse.ArgumentParser(description="Ensure ngo_operation_records exists and optionally insert a sample donorQuestion payload.")
    parser.add_argument("--database-url", help="Postgres DATABASE_URL (overrides env DATABASE_URL)")
    parser.add_argument("--schema", help="DB schema to use (default: sana_ops_test or DB_SCHEMA env)")
    args = parser.parse_args()

    database_url = args.database_url or os.environ.get("DATABASE_URL")
    if not database_url:
        print("ERROR: DATABASE_URL not provided. Set DATABASE_URL env or pass --database-url.")
        sys.exit(1)

    schema = args.schema or os.environ.get("DB_SCHEMA") or "sama_ops_test"

    conn = None
    try:
        conn = _connect(database_url)
        with conn:
            with conn.cursor() as cur:
                print(f"Ensuring table {schema}.ngo_operation_records exists...")
                cur.execute(f"""
                    CREATE TABLE IF NOT EXISTS {schema}.ngo_operation_records (
                        record_id BIGSERIAL PRIMARY KEY,
                        operation TEXT NOT NULL,
                        ngo_id TEXT,
                        record_key TEXT NOT NULL DEFAULT 'default',
                        payload JSONB NOT NULL,
                        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                        UNIQUE (operation, ngo_id, record_key)
                    );
                """)
                cur.execute(f"""
                    CREATE INDEX IF NOT EXISTS idx_ngo_operation_records_lookup
                        ON {schema}.ngo_operation_records (operation, ngo_id, updated_at DESC);
                """)
                # commit creation
                try:
                    conn.commit()
                except Exception:
                    # Some DB drivers auto-commit
                    pass

                # Check whether a global donorQuestion exists
                cur.execute(
                    f"SELECT 1 FROM {schema}.ngo_operation_records WHERE operation = %s AND (ngo_id IS NULL OR ngo_id = '') LIMIT 1",
                    ("donorQuestion",),
                )
                exists = cur.fetchone() is not None
                if exists:
                    print("A global donorQuestion record already exists. No insert required.")
                else:
                    print("Inserting sample donorQuestion payload as global default...")
                    cur.execute(
                        f"INSERT INTO {schema}.ngo_operation_records (operation, ngo_id, record_key, payload) VALUES (%s, %s, %s, %s::jsonb) RETURNING record_id",
                        ("donorQuestion", None, "default", json.dumps(SAMPLE_PAYLOAD)),
                    )
                    try:
                        new_id = cur.fetchone()[0]
                        conn.commit()
                        print(f"Inserted sample donorQuestion record_id={new_id}")
                    except Exception:
                        # If driver doesn't return fetchone for RETURNING, just commit
                        try:
                            conn.commit()
                        except Exception:
                            pass
                        print("Inserted sample donorQuestion payload (commit may have been performed)")

        print("Done. The donorQuestion endpoint should now return schema (if frontend calls it).")
    except Exception as e:
        print("ERROR:", e)
        sys.exit(2)
    finally:
        try:
            if conn:
                conn.close()
        except Exception:
            pass


if __name__ == '__main__':
    main()
