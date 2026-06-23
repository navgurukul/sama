-- Phase 1.1: Donor normalization and donor_id migration
-- Scope in this script:
-- 1) Create donor master table
-- 2) Seed donor from existing laptop_labeling donor values (normalized to ALL CAPS)
-- 3) Backfill laptop_labeling.donor_id
-- 4) Replace laptop_labeling.donor_company_name with donor_id text (as requested)
-- 5) Add FK + index

BEGIN;

CREATE TABLE IF NOT EXISTS sama_ops.donor (
    donor_id BIGSERIAL PRIMARY KEY,
    donor_name TEXT NOT NULL,
    donor_key TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'sama_ops'
          AND table_name = 'laptop_labeling'
          AND column_name = 'donor_id'
    ) THEN
        ALTER TABLE sama_ops.laptop_labeling
            ADD COLUMN donor_id BIGINT;
    END IF;
END $$;

WITH
    raw_donor AS (
        SELECT DISTINCT
            donor_company_name AS donor_raw
        FROM sama_ops.laptop_labeling
        WHERE
            COALESCE(TRIM(donor_company_name), '') <> ''
    ),
    normalized AS (
        SELECT
            donor_raw,
            UPPER(
                REGEXP_REPLACE(
                    donor_raw,
                    '[^A-Za-z0-9]+',
                    '',
                    'g'
                )
            ) AS donor_key_raw,
            UPPER(
                TRIM(
                    REGEXP_REPLACE(donor_raw, '\\s+', ' ', 'g')
                )
            ) AS donor_name_raw
        FROM raw_donor
    ),
    canonical AS (
        SELECT
            donor_raw,
            CASE
                WHEN donor_key_raw IN ('AMAZON', 'AMAZONNG') THEN 'AMAZON'
                WHEN donor_key_raw IN ('TIGERANALYTICS') THEN 'TIGER ANALYTICS'
                WHEN donor_key_raw IN ('SGANALYTICS') THEN 'SG ANALYTICS'
                ELSE donor_name_raw
            END AS donor_name,
            CASE
                WHEN donor_key_raw IN ('AMAZON', 'AMAZONNG') THEN 'AMAZON'
                WHEN donor_key_raw IN ('TIGERANALYTICS') THEN 'TIGERANALYTICS'
                WHEN donor_key_raw IN ('SGANALYTICS') THEN 'SGANALYTICS'
                ELSE donor_key_raw
            END AS donor_key
        FROM normalized
    )
INSERT INTO
    sama_ops.donor (donor_name, donor_key)
SELECT DISTINCT
    donor_name,
    donor_key
FROM canonical
ON CONFLICT (donor_key) DO
UPDATE
SET
    donor_name = EXCLUDED.donor_name;

WITH
    normalized AS (
        SELECT id, UPPER(
                REGEXP_REPLACE(
                    donor_company_name, '[^A-Za-z0-9]+', '', 'g'
                )
            ) AS donor_key_raw
        FROM sama_ops.laptop_labeling
        WHERE
            COALESCE(TRIM(donor_company_name), '') <> ''
    ),
    resolved AS (
        SELECT
            n.id,
            CASE
                WHEN n.donor_key_raw IN ('AMAZON', 'AMAZONNG') THEN 'AMAZON'
                WHEN n.donor_key_raw IN ('TIGERANALYTICS') THEN 'TIGERANALYTICS'
                WHEN n.donor_key_raw IN ('SGANALYTICS') THEN 'SGANALYTICS'
                ELSE n.donor_key_raw
            END AS donor_key
        FROM normalized n
    )
UPDATE sama_ops.laptop_labeling l
SET
    donor_id = d.donor_id
FROM resolved r
    JOIN sama_ops.donor d ON d.donor_key = r.donor_key
WHERE
    l.id = r.id;

-- Replace donor_company_name value with donor_id text, keeping column for compatibility.
UPDATE sama_ops.laptop_labeling
SET
    donor_company_name = donor_id::text
WHERE
    donor_id IS NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_laptop_labeling_donor_id'
    ) THEN
        ALTER TABLE sama_ops.laptop_labeling
            ADD CONSTRAINT fk_laptop_labeling_donor_id
            FOREIGN KEY (donor_id)
            REFERENCES sama_ops.donor(donor_id)
            ON UPDATE RESTRICT
            ON DELETE RESTRICT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_sama_ops_laptop_labeling_donor_id ON sama_ops.laptop_labeling (donor_id);

COMMIT;