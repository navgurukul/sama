import psycopg
import os

db_url = "postgresql://ops_sama:M725uVj1K6Z5m2x2r0@db-pg.c7yemscsmy90.ap-south-1.rds.amazonaws.com:5432/sama?sslmode=require"
with psycopg.connect(db_url) as conn:
    with conn.cursor() as cur:
        cur.execute("SELECT column_name FROM information_schema.columns WHERE table_schema = 'sama_ops' AND table_name = 'laptop_labeling';")
        cols = [row[0] for row in cur.fetchall()]
        print(cols)
