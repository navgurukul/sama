import os
import sys

# Manually load environment variables from backend/.env
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
if not os.path.exists(env_path):
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend", ".env")

if os.path.exists(env_path):
    print(f"Loading environment from: {env_path}")
    with open(env_path, "r") as f:
        for line in f:
            line_str = line.strip()
            if "=" in line_str and not line_str.startswith("#"):
                parts = line_str.split("=", 1)
                os.environ[parts[0].strip()] = parts[1].strip()
else:
    print("Warning: .env file not found!")

import psycopg
from psycopg.rows import dict_row

def main():
    db_schema = os.getenv("DB_SCHEMA", "sama_ops")
    database_url = os.getenv("DATABASE_URL", "")
    
    if not database_url:
        print("DATABASE_URL not configured!")
        sys.exit(1)
        
    print(f"Connecting to database with schema: {db_schema}")
    
    with psycopg.connect(database_url, row_factory=dict_row) as conn:
        with conn.cursor() as cur:
            # 1. Create registration table if not exists, and make sure all columns are there
            cur.execute(f"""
                CREATE TABLE IF NOT EXISTS {db_schema}.user_profile_registration (
                    email VARCHAR(255) PRIMARY KEY
                )
            """)
            cur.execute(f"ALTER TABLE {db_schema}.user_profile_registration ADD COLUMN IF NOT EXISTS name VARCHAR(255)")
            cur.execute(f"ALTER TABLE {db_schema}.user_profile_registration ADD COLUMN IF NOT EXISTS password VARCHAR(255)")
            cur.execute(f"ALTER TABLE {db_schema}.user_profile_registration ADD COLUMN IF NOT EXISTS status VARCHAR(50)")
            cur.execute(f"ALTER TABLE {db_schema}.user_profile_registration ADD COLUMN IF NOT EXISTS role VARCHAR(50)")
            cur.execute(f"ALTER TABLE {db_schema}.user_profile_registration ADD COLUMN IF NOT EXISTS reason TEXT")
            print("Table user_profile_registration verified and updated.")

            # 2. Create userrole table if not exists, and make sure all columns are there
            cur.execute(f"""
                CREATE TABLE IF NOT EXISTS {db_schema}.user_profile_userrole (
                    email VARCHAR(255) PRIMARY KEY
                )
            """)
            cur.execute(f"ALTER TABLE {db_schema}.user_profile_userrole ADD COLUMN IF NOT EXISTS name VARCHAR(255)")
            cur.execute(f"ALTER TABLE {db_schema}.user_profile_userrole ADD COLUMN IF NOT EXISTS password VARCHAR(255)")
            cur.execute(f"ALTER TABLE {db_schema}.user_profile_userrole ADD COLUMN IF NOT EXISTS role VARCHAR(50)")
            cur.execute(f"ALTER TABLE {db_schema}.user_profile_userrole ADD COLUMN IF NOT EXISTS ngo_id VARCHAR(255)")
            cur.execute(f"ALTER TABLE {db_schema}.user_profile_userrole ADD COLUMN IF NOT EXISTS type VARCHAR(255)")
            cur.execute(f"ALTER TABLE {db_schema}.user_profile_userrole ADD COLUMN IF NOT EXISTS doner VARCHAR(255)")
            print("Table user_profile_userrole verified and updated.")

            # 3. Create/Upsert the user 'sahil@thesama.in'
            email = "sahil@thesama.in"
            password = "sahil123"
            name = "Sahil"
            role = "Sama Executive"
            
            cur.execute(f"""
                INSERT INTO {db_schema}.user_profile_registration (name, email, password, status, role, reason)
                VALUES (%s, %s, %s, 'approved', %s, '')
                ON CONFLICT (email) DO UPDATE 
                SET name = EXCLUDED.name,
                    password = EXCLUDED.password, 
                    status = 'approved',
                    role = EXCLUDED.role
            """, (name, email, password, role))
            
            cur.execute(f"""
                INSERT INTO {db_schema}.user_profile_userrole (name, email, password, role, ngo_id, type, doner)
                VALUES (%s, %s, %s, %s, '', '', '')
                ON CONFLICT (email) DO UPDATE 
                SET name = EXCLUDED.name,
                    password = EXCLUDED.password,
                    role = EXCLUDED.role
            """, (name, email, password, role))
            
            conn.commit()
            print(f"Successfully created user {email} with role '{role}' and password '{password}'!")

            # 4. Fetch and print all users
            cur.execute(f"SELECT name, email, password, role FROM {db_schema}.user_profile_userrole")
            users = cur.fetchall()
            print("\n--- Current Registered Users in DB ---")
            for u in users:
                print(f"Name: {u['name']} | Email: {u['email']} | Password: {u['password']} | Role: {u['role']}")
            print("--------------------------------------")

if __name__ == "__main__":
    main()
