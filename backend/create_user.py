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
            # 1. Drop old tables cascadingly to avoid corrupt columns
            cur.execute(f"DROP TABLE IF EXISTS {db_schema}.user_profile_registration CASCADE")
            cur.execute(f"DROP TABLE IF EXISTS {db_schema}.user_profile_userrole CASCADE")
            print("Dropped old tables successfully.")

            # 2. Re-create registration table fresh
            cur.execute(f"""
                CREATE TABLE {db_schema}.user_profile_registration (
                    name VARCHAR(255),
                    email VARCHAR(255) PRIMARY KEY,
                    password VARCHAR(255),
                    status VARCHAR(50),
                    role VARCHAR(50),
                    reason TEXT
                )
            """)
            print("Created table user_profile_registration.")

            # 3. Re-create userrole table fresh
            cur.execute(f"""
                CREATE TABLE {db_schema}.user_profile_userrole (
                    name VARCHAR(255),
                    email VARCHAR(255) PRIMARY KEY,
                    password VARCHAR(255),
                    role VARCHAR(50),
                    ngo_id VARCHAR(255),
                    type VARCHAR(255),
                    doner VARCHAR(255)
                )
            """)
            print("Created table user_profile_userrole.")

            # 4. Create the default admin user 'sahil@thesama.in'
            email = "sahil@thesama.in"
            password = "sahil123"
            name = "Sahil"
            role = "Sama Executive"
            
            cur.execute(f"""
                INSERT INTO {db_schema}.user_profile_registration (name, email, password, status, role, reason)
                VALUES (%s, %s, %s, 'approved', %s, '')
            """, (name, email, password, role))
            
            cur.execute(f"""
                INSERT INTO {db_schema}.user_profile_userrole (name, email, password, role, ngo_id, type, doner)
                VALUES (%s, %s, %s, %s, '', '', '')
            """, (name, email, password, role))
            
            conn.commit()
            print(f"Successfully created user {email} with role '{role}' and password '{password}'!")

            # 5. Fetch and print all users
            cur.execute(f"SELECT name, email, password, role FROM {db_schema}.user_profile_userrole")
            users = cur.fetchall()
            print("\n--- Current Registered Users in DB ---")
            for u in users:
                print(f"Name: {u['name']} | Email: {u['email']} | Password: {u['password']} | Role: {u['role']}")
            print("--------------------------------------")

if __name__ == "__main__":
    main()
