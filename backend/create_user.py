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
            # 1. Create registration table if not exists
            cur.execute(f"""
                CREATE TABLE IF NOT EXISTS {db_schema}.user_profile_registration (
                    name VARCHAR(255),
                    email VARCHAR(255) PRIMARY KEY,
                    password VARCHAR(255),
                    status VARCHAR(50),
                    role VARCHAR(50),
                    reason TEXT
                )
            """)
            print("Table user_profile_registration created or verified.")

            # 2. Create userrole table if not exists
            cur.execute(f"""
                CREATE TABLE IF NOT EXISTS {db_schema}.user_profile_userrole (
                    name VARCHAR(255),
                    email VARCHAR(255) PRIMARY KEY,
                    password VARCHAR(255),
                    role VARCHAR(50),
                    ngo_id VARCHAR(255),
                    type VARCHAR(255),
                    doner VARCHAR(255)
                )
            """)
            print("Table user_profile_userrole created or verified.")

            # 3. Create/Upsert the user 'sahil@thesama.in'
            email = "sahil@thesama.in"
            password = "sahil123"
            name = "Sahil"
            role = "Sama Executive"
            
            # Insert or update in registration
            cur.execute(f"""
                INSERT INTO {db_schema}.user_profile_registration (name, email, password, status, role, reason)
                VALUES (%s, %s, %s, 'approved', %s, '')
                ON CONFLICT (email) DO UPDATE 
                SET password = EXCLUDED.password, 
                    status = 'approved',
                    role = EXCLUDED.role
            """, (name, email, password, role))
            
            # Insert or update in userrole
            cur.execute(f"""
                INSERT INTO {db_schema}.user_profile_userrole (name, email, password, role, ngo_id, type, doner)
                VALUES (%s, %s, %s, %s, '', '', '')
                ON CONFLICT (email) DO UPDATE 
                SET password = EXCLUDED.password,
                    role = EXCLUDED.role
            """, (name, email, password, role))
            
            conn.commit()
            print(f"Successfully created user {email} with role '{role}' and password '{password}'!")

if __name__ == "__main__":
    main()
