import psycopg

conn = psycopg.connect('postgresql://ops_sama:n715gO6wv=SamaOps@db-pg.cosodeda78lq.ap-south-1.rds.amazonaws.com:5432/sama?sslmode=require')
cur = conn.cursor()

cur.execute("""
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema='sama_ops_test'
""")
rows = cur.fetchall()

tables = {}
for r in rows:
    table, col, dtype = r
    if table not in tables:
        tables[table] = []
    tables[table].append(col)

for table, cols in tables.items():
    print(f"Table: {table}")
    print(f"Columns: {', '.join(cols)}")
    print("-" * 20)
