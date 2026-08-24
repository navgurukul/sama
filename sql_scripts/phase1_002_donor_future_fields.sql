-- Phase 1.2: Add future donor fields from design doc
-- Requested key fields: company_name, poc_name, poc_contact, poc_email
-- All new fields are nullable for forward compatibility.

BEGIN;

ALTER TABLE sama_ops.donor
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS poc_name TEXT,
ADD COLUMN IF NOT EXISTS poc_contact TEXT,
ADD COLUMN IF NOT EXISTS poc_email TEXT;

-- Backfill company_name for existing rows from donor_name so current records remain usable.
UPDATE sama_ops.donor
SET
    company_name = donor_name
WHERE
    company_name IS NULL;

COMMIT;