-- Phase 1.8: Normalize and constrain laptop_labeling.condition_status
-- Scope:
-- 1) Normalize free-text condition statuses to canonical values
-- 2) Enforce DB-level enum-like CHECK constraint

BEGIN;

UPDATE sama_ops.laptop_labeling
SET
    condition_status = CASE
        WHEN condition_status IS NULL
        OR TRIM(condition_status) = '' THEN NULL
        WHEN UPPER(TRIM(condition_status)) LIKE 'GOOD%' THEN 'GOOD'
        WHEN UPPER(TRIM(condition_status)) LIKE 'BAD%' THEN 'BAD'
        WHEN UPPER(TRIM(condition_status)) LIKE '%REPAIR%'
        OR UPPER(TRIM(condition_status)) LIKE '%NEED%' THEN 'NEEDS_REPAIR'
        ELSE NULL
    END;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'ck_laptop_labeling_condition_status_enum'
    ) THEN
        ALTER TABLE sama_ops.laptop_labeling
            ADD CONSTRAINT ck_laptop_labeling_condition_status_enum
            CHECK (
                condition_status IS NULL
                OR condition_status IN ('GOOD', 'BAD', 'NEEDS_REPAIR')
            );
    END IF;
END $$;

COMMIT;