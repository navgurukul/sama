import psycopg, os
from dotenv import load_dotenv

load_dotenv("backend/.env")
db_url = os.environ.get("DATABASE_URL")

with psycopg.connect(db_url) as conn:
    with conn.cursor() as cur:
        cur.execute("""
            SELECT laptop_id, stage_code, outcome, completed_by, completed_at
            FROM sama_ops.laptop_stage_run
            WHERE completed_by ILIKE '%shweta%'
            ORDER BY completed_at DESC LIMIT 5;
        """)
        for row in cur.fetchall():
            print(row)
