# New DB Setup (Reusable)

This folder provides one-command setup for a fresh DB (local Postgres or AWS RDS):

1. Create schema/tables/indexes
2. Seed data from Excel workbook

It reuses these existing scripts:
- `scripts/db/bootstrap_schema.py`
- `scripts/db/seed_sample_data.py`

It also supports additional workbooks where each subsheet is loaded into its own table.

For generic workbook ingestion, all generated columns are created as nullable `text`, so blank cells are stored as `NULL`.

## Prerequisites

Install Python dependencies in your venv:

```powershell
pip install psycopg[binary] openpyxl
```

## Quick Start (Windows PowerShell)

Use full RDS/Postgres connection URL:

```powershell
python scripts/db/setup/setup_new_db.py --database-url "postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require" --schema sama_ops --reset --truncate
```

Or via PowerShell wrapper:

```powershell
./scripts/db/setup/setup_new_db.ps1 -DatabaseUrl "postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require" -Schema sama_ops -Reset -Truncate
```

## Common Modes

### 1) Fresh DB from scratch

```powershell
python scripts/db/setup/setup_new_db.py --database-url "postgresql://..." --schema sama_ops --reset --truncate
```

### 2) Create schema only (no data load)

```powershell
python scripts/db/setup/setup_new_db.py --database-url "postgresql://..." --schema sama_ops --skip-seed
```

### 3) Seed only (schema already exists)

```powershell
python scripts/db/setup/setup_new_db.py --database-url "postgresql://..." --schema sama_ops --truncate --skip-bootstrap
```

### 4) Use custom workbook path

```powershell
python scripts/db/setup/setup_new_db.py --database-url "postgresql://..." --schema sama_ops --workbook "C:/path/to/Dev Laptop Data.xlsx" --truncate
```

## Parameters

- `--database-url`: required unless `DATABASE_URL` env var is set
- `--schema`: default `sama_ops`
- `--workbook`: default `<repo>/Dev Laptop Data.xlsx`
- `--reset`: drop/recreate managed tables before bootstrap
- `--truncate`: truncate managed tables before seeding
- `--skip-bootstrap`: run only seed stage
- `--skip-seed`: run only bootstrap stage
- `--extra-workbook`: additional workbook(s) to ingest (repeatable)
- `--extra-reset`: drop/recreate tables for extra workbook ingestion
- `--extra-truncate`: truncate tables for extra workbook ingestion

## Notes

- For RDS, include `?sslmode=require` in URL when required.
- `--reset` is destructive for managed tables in that schema.
- If seeding fails, run bootstrap only first and then seed only to isolate issues.

## Loading extra workbook(s): each subsheet -> table

Generic loader:

```powershell
python scripts/db/setup/load_workbook_sheets.py --database-url "postgresql://..." --schema sama_ops --workbook "User-Roles.xlsx" --table-prefix user_roles --reset
```

For `User-Roles.xlsx`, this creates:
- `sama_ops.user_roles_registration`
- `sama_ops.user_roles_userrole`

Run everything together (base schema + laptop seed + extra workbook):

```powershell
python scripts/db/setup/setup_new_db.py --database-url "postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require" --schema sama_ops --reset --truncate --extra-workbook "User-Roles.xlsx" --extra-reset
```
