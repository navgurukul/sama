import os
import csv
import argparse
import psycopg

db_url = os.environ.get("DATABASE_URL")

if not db_url:
    raise RuntimeError("DATABASE_URL is required")

def get_columns(cur, schema, table):
    cur.execute(f"""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = %s AND table_name = %s
    """, (schema, table))
    return [r[0] for r in cur.fetchall()]

def import_user_roles(replace=False):
    csv_file = "user_roles - Sheet1.csv"
    if not os.path.exists(csv_file):
        print(f"Error: {csv_file} not found. Please export UserRole tab as CSV and save it as '{csv_file}'.")
        return

    print("Importing User Roles...")
    users = []
    with open(csv_file, mode='r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if not row.get("Email"):
                continue
            users.append({
                "name": row.get("Name") or "",
                "email": row.get("Email").strip(),
                "password": row.get("Password") or "",
                "role": row.get("Role") or "",
                "ngo_id": row.get("Ngo Id") or "",
                "type": row.get("Type") or "",
                "doner": row.get("Doner") or "",
                "stage_roles": "{}"
            })

    for schema in ["sama_ops", "sama_ops_test"]:
        with psycopg.connect(db_url) as conn:
            with conn.transaction():
                with conn.cursor() as cur:
                    cols = get_columns(cur, schema, "user_profile_userrole")
                    if replace:
                        cur.execute(f"TRUNCATE TABLE {schema}.user_profile_userrole")
                    for u in users:
                        valid_u = {k: v for k, v in u.items() if k in cols}
                        col_names = ", ".join(valid_u.keys())
                        placeholders = ", ".join(f"%({k})s" for k in valid_u.keys())
                        cur.execute(f"INSERT INTO {schema}.user_profile_userrole ({col_names}) VALUES ({placeholders})", valid_u)
        print(f"Synced {len(users)} user roles to schema {schema}!")

def import_registrations(replace=False):
    csv_file = "registrations - registrations.csv"
    if not os.path.exists(csv_file):
        print(f"Error: {csv_file} not found. Please export Registration tab as CSV and save it as '{csv_file}'.")
        return

    print("Importing Registrations...")
    regs = []
    with open(csv_file, mode='r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if not row.get("Email"):
                continue
            regs.append({
                "name": row.get("Name") or "",
                "email": row.get("Email").strip(),
                "password": row.get("Password") or "",
                "status": row.get("Status") or "Approved",
                "role": row.get("Role") or "",
                "reason": row.get("Reason") or ""
            })

    for schema in ["sama_ops", "sama_ops_test"]:
        with psycopg.connect(db_url) as conn:
            with conn.transaction():
                with conn.cursor() as cur:
                    cols = get_columns(cur, schema, "user_profile_registration")
                    if replace:
                        cur.execute(f"TRUNCATE TABLE {schema}.user_profile_registration")
                    for r in regs:
                        valid_r = {k: v for k, v in r.items() if k in cols}
                        col_names = ", ".join(valid_r.keys())
                        placeholders = ", ".join(f"%({k})s" for k in valid_r.keys())
                        cur.execute(f"INSERT INTO {schema}.user_profile_registration ({col_names}) VALUES ({placeholders})", valid_r)
        print(f"Synced {len(regs)} registrations to schema {schema}!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--replace",
        action="store_true",
        help="Replace only the two user tables with the CSV snapshots, preserving duplicate rows",
    )
    args = parser.parse_args()
    import_user_roles(replace=args.replace)
    import_registrations(replace=args.replace)
