# DB Bootstrap (Local + RDS)

This folder contains a reproducible Python bootstrap script for the ERD in `docs/rds-sheet-first-migration-strategy.md`.

## Files

- `bootstrap_schema.py`: Creates schema, tables, FKs, and indexes.

## One-command setup for new DBs

Use the reusable setup wrapper in `scripts/db/setup` to run bootstrap + seed in one command.

- Guide: `scripts/db/setup/README.md`
- Orchestrator: `scripts/db/setup/setup_new_db.py`
- PowerShell wrapper: `scripts/db/setup/setup_new_db.ps1`

## Requirements

Install one PostgreSQL driver:

```bash
pip install psycopg[binary]
```

Alternative:

```bash
pip install psycopg2-binary
```

## Usage

1. Set connection URL

```bash
set DATABASE_URL=postgresql://username:password@localhost:5432/sama
```

2. Run bootstrap

```bash
python scripts/db/bootstrap_schema.py --schema sama_ops
```

3. Optional full reset (drop and recreate)

```bash
python scripts/db/bootstrap_schema.py --schema sama_ops --reset
```

4. Re-apply schema script anytime after updates to add new indexes safely

```bash
python scripts/db/bootstrap_schema.py --schema sama_ops
```

## RDS usage

Use the same command and switch only the connection URL:

```bash
set DATABASE_URL=postgresql://username:password@<rds-endpoint>:5432/<database>
python scripts/db/bootstrap_schema.py --schema sama_ops
```

## What gets created

Base tables:
- `laptop_labeling`
- `userdetails`
- `pickup`
- `audit_for_laptops`
- `preliminary`
- `report`
- `laptop_user_map`
- `metrics_base`
- `infection`
- `average_days_count`
- `external_registered_ngo`

Control/traceability tables:
- `laptop_event_log`
- `laptop_versions`
- `laptop_stage_runs`
- `laptop_checklist_responses`
- `qc_checks` (includes optional `stage_run_id` linkage)
- `issue_feedback`

## Performance notes for large datasets

- The schema bootstrap now creates additional btree indexes for common filters and sorting.
- It also tries to create optional `pg_trgm` indexes (GIN) to speed up `%...%` `ILIKE` searches.
- On restricted databases, if `pg_trgm` extension creation is not allowed, bootstrap continues with btree indexes.

## Seed sample data from workbook

This inserts sample entries into all base tables plus control/traceability tables using `Dev Laptop Data.xlsx`.

```bash
python scripts/db/seed_sample_data.py --database-url "%DATABASE_URL%" --schema sama_ops --truncate
```

If your workbook is in a different path:

```bash
python scripts/db/seed_sample_data.py --database-url "%DATABASE_URL%" --schema sama_ops --workbook "path/to/Dev Laptop Data.xlsx" --truncate
```

Quick row count check:

```bash
psql "%DATABASE_URL%" -c "
select 'laptop_labeling' table_name, count(*) from sama_ops.laptop_labeling
union all select 'pickup', count(*) from sama_ops.pickup
union all select 'userdetails', count(*) from sama_ops.userdetails
union all select 'preliminary', count(*) from sama_ops.preliminary
union all select 'report', count(*) from sama_ops.report
union all select 'metrics_base', count(*) from sama_ops.metrics_base
union all select 'infection', count(*) from sama_ops.infection
union all select 'audit_for_laptops', count(*) from sama_ops.audit_for_laptops
union all select 'average_days_count', count(*) from sama_ops.average_days_count
union all select 'laptop_user_map', count(*) from sama_ops.laptop_user_map
union all select 'external_registered_ngo', count(*) from sama_ops.external_registered_ngo
union all select 'laptop_event_log', count(*) from sama_ops.laptop_event_log
union all select 'laptop_versions', count(*) from sama_ops.laptop_versions
union all select 'laptop_stage_runs', count(*) from sama_ops.laptop_stage_runs
union all select 'laptop_checklist_responses', count(*) from sama_ops.laptop_checklist_responses
union all select 'qc_checks', count(*) from sama_ops.qc_checks
union all select 'issue_feedback', count(*) from sama_ops.issue_feedback
;"
```
