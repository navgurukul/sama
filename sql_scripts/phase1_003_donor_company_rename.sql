-- Phase 1.3: Donor display column rename
-- Goal:
-- 1) Use donor_company as canonical display field
-- 2) Keep donor_key as dedupe key
-- 3) Remove company_name helper field

BEGIN;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'sama_ops'
          AND table_name = 'donor'
          AND column_name = 'donor_name'
    )
    AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'sama_ops'
          AND table_name = 'donor'
          AND column_name = 'donor_company'
    ) THEN
        ALTER TABLE sama_ops.donor
            RENAME COLUMN donor_name TO donor_company;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'sama_ops'
          AND table_name = 'donor'
          AND column_name = 'company_name'
    ) THEN
        ALTER TABLE sama_ops.donor
            DROP COLUMN company_name;
    END IF;
END $$;

COMMIT;