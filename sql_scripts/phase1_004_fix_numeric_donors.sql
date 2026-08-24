-- Phase 1.4: Repair numeric donor pollution caused by donor_id text backfill
-- This script:
-- 1) Remaps laptop_labeling.donor_id from numeric-fake donor rows to real donor rows
-- 2) Restores laptop_labeling.donor_company_name to readable donor company names
-- 3) Deletes unreferenced numeric-fake donor rows

BEGIN;

WITH
    numeric_donor AS (
        SELECT
            donor_id AS bad_donor_id,
            donor_company
        FROM sama_ops.donor
        WHERE
            donor_company ~ '^[0-9]+$'
    ),
    remap AS (
        SELECT n.bad_donor_id, CAST(n.donor_company AS BIGINT) AS target_donor_id
        FROM numeric_donor n
            JOIN sama_ops.donor t ON t.donor_id = CAST(n.donor_company AS BIGINT)
        WHERE
            t.donor_company !~ '^[0-9]+$'
    )
UPDATE sama_ops.laptop_labeling ll
SET
    donor_id = r.target_donor_id
FROM remap r
WHERE
    ll.donor_id = r.bad_donor_id;

UPDATE sama_ops.laptop_labeling ll
SET
    donor_company_name = d.donor_company
FROM sama_ops.donor d
WHERE
    ll.donor_id = d.donor_id;

DELETE FROM sama_ops.donor d
WHERE
    d.donor_company ~ '^[0-9]+$'
    AND NOT EXISTS (
        SELECT 1
        FROM sama_ops.laptop_labeling ll
        WHERE
            ll.donor_id = d.donor_id
    );

COMMIT;