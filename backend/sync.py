import os
import sys
import json
import httpx
import asyncio
from dotenv import load_dotenv
import psycopg
from psycopg.rows import dict_row
import csv

sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))
from db import DB_SCHEMA

load_dotenv()

from datetime import datetime

import re

def parse_date(date_str):
    if not date_str:
        return None
    date_str = str(date_str).strip()
    try:
        # If it's already ISO format, just return it
        if "T" in date_str:
            # Google Sheets (US locale) swaps month and day when users type DD-MM-YYYY manually if DD <= 12.
            # So July 12 (12-07) becomes Dec 7 (2026-12-07T...). We need to swap them back!
            dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
            try:
                # Swap month and day to fix the locale issue
                corrected_dt = dt.replace(month=dt.day, day=dt.month)
                return corrected_dt.isoformat()
            except ValueError:
                # Just in case swapping creates an invalid date like Feb 30th
                return dt.isoformat()
        # Try DD-MM-YYYY HH:mm:ss
        return datetime.strptime(date_str, "%d-%m-%Y %H:%M:%S").isoformat()
    except ValueError:
        pass
    # Try DD-MM-YYYY
    try:
        return datetime.strptime(date_str, "%d-%m-%Y").isoformat()
    except ValueError:
        pass
    
    # Check if it looks like a valid ISO string starting with 20
    match = re.search(r'(20\d\d-\d\d-\d\dT.*)', date_str)
    if match:
        return match.group(1)
        
    match = re.search(r'(20\d\d-\d\d-\d\d)', date_str)
    if match:
        return match.group(1)
        
    return None

def clean_number(val):
    if not val: return None
    val = str(val).strip().replace("%", "").replace(",", "")
    try:
        return int(float(val))
    except (ValueError, TypeError):
        return None

async def sync():
    url = "https://docs.google.com/spreadsheets/d/16t_EqujkDWTDtVNKZvyHGuUsFt1tGqnTvmMCgz49d2Q/export?format=csv&gid=0"
    db_url = os.environ.get("DATABASE_URL")
    
    print(f"Fetching CSV from {url}...")
    
    async with httpx.AsyncClient(timeout=120.0, follow_redirects=True) as client:
        response = await client.get(url)
        content = response.text
        
    reader = csv.DictReader(content.splitlines())
    data = list(reader)
    
    print(f"Fetched {len(data)} laptops from CSV. Syncing to DB in reverse order...")
    
    data.reverse()
    
    success_count = 0
    params_list = []
    
    for item in data:
        for k, v in item.items():
            if isinstance(v, str) and (v.strip() == "" or v.strip() == "-"):
                item[k] = None
                
        item["Manufacturing Date"] = parse_date(item.get("Manufacturing Date"))
        item["Last Updated On"] = parse_date(item.get("Last Updated On"))
        item["Battery Capacity"] = clean_number(item.get("Battery Capacity"))
        item["laptop weight"] = clean_number(item.get("laptop weight"))
        
        cond_status = item.get("Condition Status")
        if isinstance(cond_status, str):
            cond_status = cond_status.strip().upper().replace(" ", "_")
            if cond_status == "NEED_REPAIR":
                cond_status = "NEEDS_REPAIR"
            item["Condition Status"] = cond_status
            
        status = item.get("Status")
        if isinstance(status, str):
            item["Status"] = status.strip().upper().replace(" ", "_")
            
        working = item.get("Working")
        if isinstance(working, str):
            working = working.strip().upper().replace(" ", "_")
            item["Working"] = working
            
        params = {
            "id": item.get("ID") or item.get("id"),
            "donor_company_name": item.get("Donor Company Name"),
            "ram": item.get("RAM"),
            "rom": item.get("ROM"),
            "manufacturer_model": item.get("Manufacturer Model"),
            "processor": item.get("Processor"),
            "manufacturing_date": item.get("Manufacturing Date"),
            "condition_status": item.get("Condition Status"),
            "major_issues": item.get("Major Issues"),
            "minor_issues": item.get("Minor Issues"),
            "other_issues": item.get("Other Issues"),
            "inventory_location": item.get("Inventory Location"),
            "laptop_weight": item.get("laptop weight"),
            "mac_address": item.get("Mac address"),
            "battery_capacity": item.get("Battery Capacity"),
            "comment_for_issues": item.get("Comment for the Issues"),
            "working": item.get("Working"),
            "status": item.get("Status"),
            "assigned_to": item.get("Assigned To"),
            "allocated_to": item.get("Allocated To"),
            "last_updated_on": item.get("Last Updated On"),
            "last_updated_by": item.get("Last Updated By"),
            "batch": item.get("Batch"),
        }
        params_list.append(params)
        
    query = f"""
        INSERT INTO {DB_SCHEMA}.laptop_labeling (
            id, donor_id, ram, rom, manufacturer_model,
            processor, manufacturing_date, condition_status, major_issues,
            minor_issues, other_issues, inventory_location, laptop_weight,
            mac_address, battery_capacity, comment_for_issues, working,
            status, assigned_to, allocated_to, last_updated_on, last_updated_by, batch
        ) VALUES (
            %(id)s, (SELECT donor_id FROM {DB_SCHEMA}.donor WHERE donor_company ILIKE %(donor_company_name)s LIMIT 1), %(ram)s, %(rom)s, %(manufacturer_model)s,
            %(processor)s, %(manufacturing_date)s, %(condition_status)s, %(major_issues)s,
            %(minor_issues)s, %(other_issues)s, %(inventory_location)s, %(laptop_weight)s,
            %(mac_address)s, %(battery_capacity)s, %(comment_for_issues)s, %(working)s,
            %(status)s, %(assigned_to)s, %(allocated_to)s, %(last_updated_on)s, %(last_updated_by)s, %(batch)s
        )
        ON CONFLICT (id) DO UPDATE SET
            donor_id = EXCLUDED.donor_id,
            ram = EXCLUDED.ram,
            rom = EXCLUDED.rom,
            manufacturer_model = EXCLUDED.manufacturer_model,
            processor = EXCLUDED.processor,
            manufacturing_date = EXCLUDED.manufacturing_date,
            condition_status = EXCLUDED.condition_status,
            major_issues = EXCLUDED.major_issues,
            minor_issues = EXCLUDED.minor_issues,
            other_issues = EXCLUDED.other_issues,
            inventory_location = EXCLUDED.inventory_location,
            laptop_weight = EXCLUDED.laptop_weight,
            mac_address = EXCLUDED.mac_address,
            battery_capacity = EXCLUDED.battery_capacity,
            comment_for_issues = EXCLUDED.comment_for_issues,
            working = EXCLUDED.working,
            status = EXCLUDED.status,
            assigned_to = EXCLUDED.assigned_to,
            allocated_to = EXCLUDED.allocated_to,
            last_updated_on = EXCLUDED.last_updated_on,
            last_updated_by = EXCLUDED.last_updated_by,
            batch = EXCLUDED.batch
    """
    
    print("Executing batch insert...")
    success_count = 0
    chunk_size = 500
    
    with psycopg.connect(db_url, row_factory=dict_row) as conn:
        for i in range(0, len(params_list), chunk_size):
            chunk = params_list[i:i + chunk_size]
            try:
                with conn.transaction():
                    with conn.cursor() as cur:
                        cur.executemany(query, chunk)
                success_count += len(chunk)
            except Exception as e:
                # Fallback to row-by-row for this chunk
                for params in chunk:
                    try:
                        with conn.transaction():
                            with conn.cursor() as cur:
                                cur.execute(query, params)
                        success_count += 1
                    except Exception as row_e:
                        print(f"Error on {params.get('id')}: {row_e}")
        valid_ids = list(str(p["id"]) for p in params_list if p.get("id"))
        if valid_ids:
            with conn.transaction():
                with conn.cursor() as cur:
                    # Soft delete extra laptops
                    cur.execute(f"UPDATE {DB_SCHEMA}.laptop_labeling SET is_deleted_from_sheet = TRUE WHERE NOT (id = ANY(%s))", (valid_ids,))
                    deleted_count = cur.rowcount
                    # Ensure active laptops are not soft deleted (in case they were added back)
                    cur.execute(f"UPDATE {DB_SCHEMA}.laptop_labeling SET is_deleted_from_sheet = FALSE WHERE id = ANY(%s)", (valid_ids,))
            print(f"Hidden {deleted_count} extra laptops not in Google Sheet.")
                
    print(f"Successfully synced {success_count} laptops to the database!")

async def sync_audit():
    url = "https://docs.google.com/spreadsheets/d/16t_EqujkDWTDtVNKZvyHGuUsFt1tGqnTvmMCgz49d2Q/export?format=csv&gid=1086804433"
    db_url = os.environ.get("DATABASE_URL")
    
    print(f"Fetching Audit CSV from {url}...")
    
    async with httpx.AsyncClient(timeout=120.0, follow_redirects=True) as client:
        response = await client.get(url)
        content = response.text
        
    reader = csv.DictReader(content.splitlines())
    data = list(reader)
    
    # Fetch valid laptop IDs to avoid foreign key constraint violations
    print("Fetching valid laptop IDs from DB...")
    with psycopg.connect(db_url, row_factory=dict_row) as conn:
        with conn.cursor() as cur:
            cur.execute(f"SELECT id FROM {DB_SCHEMA}.laptop_labeling")
            # Map lowercased + stripped ID to the exact original DB ID (including spaces and casing)
            valid_laptop_ids = {}
            for row in cur.fetchall():
                raw_id = row.get("id")
                if raw_id:
                    valid_laptop_ids[str(raw_id).strip().lower()] = str(raw_id)

    params_list = []
    skipped_count = 0
    for item in data:
        laptop_id_raw = str(item.get("ID") or item.get("id") or "").strip()
        laptop_id_lookup = laptop_id_raw.lower()
        if not laptop_id_raw or laptop_id_lookup not in valid_laptop_ids:
            skipped_count += 1
            continue
            
        exact_db_id = valid_laptop_ids[laptop_id_lookup]

        updated_on_raw = item.get("Updated On")
        parsed_dt = None
        if updated_on_raw:
            updated_on_raw = updated_on_raw.strip()
            # Try parse DD-MM-YYYY HH:MM:SS
            for fmt in ("%d-%m-%Y %H:%M:%S", "%Y-%m-%d %H:%M:%S", "%d/%m/%Y %H:%M:%S", "%Y/%m/%d %H:%M:%S"):
                try:
                    parsed_dt = datetime.strptime(updated_on_raw, fmt).isoformat()
                    break
                except ValueError:
                    continue
        
        # If it contains "T" or has other formats
        if not parsed_dt and updated_on_raw and "T" in updated_on_raw:
            parsed_dt = updated_on_raw
            
        params = {
            "id": exact_db_id,
            "field": item.get("Field") or item.get("field"),
            "from_value": item.get("From ") or item.get("From") or item.get("from"),
            "to_value": item.get("To") or item.get("to"),
            "updated_by": item.get("Updated By") or item.get("updated_by"),
            "updated_on": parsed_dt
        }
        params_list.append(params)

    print(f"Prepared {len(params_list)} valid audit records. Skipped {skipped_count} invalid IDs.")
            
    query = f"""
        INSERT INTO {DB_SCHEMA}.audit_for_laptops (
            id, field, from_value, to_value, updated_by, updated_on
        ) VALUES (
            %(id)s, %(field)s, %(from_value)s, %(to_value)s, %(updated_by)s, %(updated_on)s
        )
    """
    
    print("Clearing and reloading audit table...")
    with psycopg.connect(db_url, row_factory=dict_row) as conn:
        with conn.transaction():
            with conn.cursor() as cur:
                # Wipes existing to reload clean copy
                cur.execute(f"TRUNCATE TABLE {DB_SCHEMA}.audit_for_laptops RESTART IDENTITY CASCADE;")
                
        # Batch insert in chunks of 5000
        chunk_size = 5000
        success_count = 0
        for i in range(0, len(params_list), chunk_size):
            chunk = params_list[i:i + chunk_size]
            with conn.transaction():
                with conn.cursor() as cur:
                    cur.executemany(query, chunk)
            success_count += len(chunk)
            
    print(f"Successfully synced {success_count} audit records to the database!")

async def sync_preliminary():
    legacy_url = os.getenv("LEGACY_LAPTOP_API_URL")
    db_url = os.environ.get("DATABASE_URL")
    if not legacy_url:
        print("Skipping preliminary sync: LEGACY_LAPTOP_API_URL is not configured.")
        return
        
    print("Fetching preliminary NGO requests from Apps Script...")
    async with httpx.AsyncClient(timeout=120.0, follow_redirects=True) as client:
        response = await client.get(legacy_url, params={"type": "getpre"})
        if response.status_code != 200:
            print(f"Failed to fetch preliminary data: {response.status_code}")
            return
        data = response.json()
        
    params_list = []
    for item in data:
        courses_list = item.get("Courses") or []
        course_parts = []
        for c in courses_list:
            if isinstance(c, dict):
                name = c.get("name") or ""
                duration = c.get("duration") or ""
                if duration:
                    course_parts.append(f"{name}: {duration}")
                else:
                    course_parts.append(name)
            else:
                course_parts.append(str(c))
        course_str = ", ".join(course_parts)
        
        states_list = item.get("States") or []
        states_str = ", ".join(states_list) if isinstance(states_list, list) else str(states_list)
        
        params = {
            "id": item.get("Id"),
            "ngoid": item.get("NgoId"),
            "number_of_school": clean_number(item.get("Number of school")),
            "number_of_teacher": clean_number(item.get("Number of teacher")),
            "number_of_student": clean_number(item.get("Number of student")),
            "number_of_female_student": clean_number(item.get("Number of Female student")),
            "states": states_str,
            "course": course_str,
            "unit": item.get("Unit"),
            "doner": item.get("Doner"),
            "request_type": item.get("requestType"),
            "ngo_prelim_requests": json.dumps(item.get("NGOPrelimRequests") or {})
        }
        params_list.append(params)
        
    query = f"""
        INSERT INTO {DB_SCHEMA}.preliminary (
            id, ngoid, number_of_school, number_of_teacher, number_of_student, 
            number_of_female_student, states, course, unit, doner, request_type, ngo_prelim_requests
        ) VALUES (
            %(id)s, %(ngoid)s, %(number_of_school)s, %(number_of_teacher)s, %(number_of_student)s,
            %(number_of_female_student)s, %(states)s, %(course)s, %(unit)s, %(doner)s, %(request_type)s, %(ngo_prelim_requests)s
        )
    """
    
    print(f"Reloading preliminary table with {len(params_list)} rows...")
    with psycopg.connect(db_url, row_factory=dict_row) as conn:
        with conn.transaction():
            with conn.cursor() as cur:
                cur.execute(f"TRUNCATE TABLE {DB_SCHEMA}.preliminary RESTART IDENTITY CASCADE;")
                cur.executemany(query, params_list)
                
    print("Successfully synced preliminary table!")

async def main_sync():
    await sync()
    await sync_audit()
    await sync_preliminary()

if __name__ == "__main__":
    asyncio.run(main_sync())
