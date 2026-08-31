import psycopg2
import os
from dotenv import load_dotenv

load_dotenv("backend/.env")
db_url = os.environ.get("DATABASE_URL")

with open("sql_scripts/phase1_020_audit_trigger.sql", "r") as f:
    sql = f.read()

with psycopg2.connect(db_url) as conn:
    with conn.cursor() as cur:
        cur.execute(sql)
        conn.commit()

print("SQL script executed successfully!")
