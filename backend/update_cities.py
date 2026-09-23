import csv
import sys
import os

# Add the backend dir to sys.path
sys.path.append("/Users/sama/Desktop/Sama Digital Foundation/sama/backend")

from app.main import get_conn, DB_SCHEMA

csv_file = "/Users/sama/Desktop/Sama Digital Foundation/school_upload_template (1) - Sheet2 (1).csv"

def main():
    with get_conn() as conn:
        with conn.cursor() as cur:
            updated_count = 0
            with open(csv_file, newline='', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    udise = row.get("School UDISE", "").strip()
                    city = row.get("City", "").strip()
                    
                    if udise and city:
                        cur.execute(f"UPDATE {DB_SCHEMA}.schools SET city = %s WHERE udise = %s", (city, udise))
                        updated_count += cur.rowcount
            
            conn.commit()
    print(f"Successfully updated city for {updated_count} schools.")

if __name__ == '__main__':
    main()
