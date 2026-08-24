import os
import csv
import psycopg

db_url = "postgresql://ops_sama:n715gO6wv=SamaOps@db-pg.cosodeda78lq.ap-south-1.rds.amazonaws.com:5432/sama?sslmode=require"

def get_columns(cur, schema, table):
    cur.execute(f"""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = %s AND table_name = %s
    """, (schema, table))
    return [r[0] for r in cur.fetchall()]

def import_user_roles():
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
                    for u in users:
                        cur.execute(f"DELETE FROM {schema}.user_profile_userrole WHERE LOWER(email) = LOWER(%s)", (u["email"],))
                        valid_u = {k: v for k, v in u.items() if k in cols}
                        col_names = ", ".join(valid_u.keys())
                        placeholders = ", ".join(f"%({k})s" for k in valid_u.keys())
                        cur.execute(f"INSERT INTO {schema}.user_profile_userrole ({col_names}) VALUES ({placeholders})", valid_u)
        print(f"Synced {len(users)} user roles to schema {schema}!")

def import_registrations():
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
                    for r in regs:
                        cur.execute(f"DELETE FROM {schema}.user_profile_registration WHERE LOWER(email) = LOWER(%s)", (r["email"],))
                        valid_r = {k: v for k, v in r.items() if k in cols}
                        col_names = ", ".join(valid_r.keys())
                        placeholders = ", ".join(f"%({k})s" for k in valid_r.keys())
                        cur.execute(f"INSERT INTO {schema}.user_profile_registration ({col_names}) VALUES ({placeholders})", valid_r)
        print(f"Synced {len(regs)} registrations to schema {schema}!")

if __name__ == "__main__":
    import_user_roles()
    import_registrations()
