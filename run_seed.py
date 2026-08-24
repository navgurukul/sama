import os
import subprocess

env = {}
env_path = 'backend/.env'

if os.path.exists(env_path):
    with open(env_path, 'r') as f:
        for line in f:
            if '=' in line and not line.strip().startswith('#'):
                k, v = line.split('=', 1)
                env[k.strip()] = v.strip()

db_url = env.get('DATABASE_URL')
if not db_url:
    print("Error: DATABASE_URL not found in backend/.env")
    exit(1)

subprocess.run([
    'python', 
    'scripts/db/seed_sample_data.py', 
    '--database-url', db_url, 
    '--schema', 'sama_ops_test'
])
