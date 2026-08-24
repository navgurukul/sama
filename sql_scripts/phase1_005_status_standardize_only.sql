-- Phase 1.5: Standardize laptop_labeling.status values only
-- Scope:
-- - Update only sama_ops.laptop_labeling.status according to approved mapping
-- - Keep sama_ops.laptop_labeling.working unchanged

BEGIN;

UPDATE sama_ops.laptop_labeling
SET
    status = CASE
        WHEN status = 'Distributed' THEN 'DISPATCHED'
        WHEN status = 'Laptop Received' THEN 'RECEIVED'
        WHEN status = 'Refurbishment Started' THEN 'REFURBISHMENT_STARTED'
        WHEN status = 'Laptop Refurbished' THEN 'REFURBISHMENT_COMPLETE'
        WHEN status = 'Not Working' THEN 'UNDER_REPAIR'
        ELSE status
    END
WHERE
    status IN (
        'Distributed',
        'Laptop Received',
        'Refurbishment Started',
        'Laptop Refurbished',
        'Not Working'
    );

COMMIT;