-- Store each NGO request's public ID ("SAM-<n>") instead of recomputing it on
-- every read. The old rule was: highest SAM number in external_registered_ngo
-- plus the request's position in ngo_requests (ordered by id). Users and
-- beneficiaries store these IDs, so deleting a request used to renumber every
-- later one. The first backfill below reproduces the old IDs exactly; the API
-- assigns the next number to new requests and never renumbers or reuses one.
-- ngo_request_id_state keeps the highest number ever issued.
-- The API also applies this change on first use if it has not been run.
BEGIN;

ALTER TABLE sama_ops.ngo_requests ADD COLUMN IF NOT EXISTS display_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS uq_ngo_requests_display_id
    ON sama_ops.ngo_requests (display_id) WHERE display_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS sama_ops.ngo_request_id_state (
    singleton BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (singleton),
    last_serial INTEGER NOT NULL
);

SELECT pg_advisory_xact_lock(hashtext('sama.ngo_requests.display_id'));

WITH external_max AS (
    SELECT COALESCE(MAX(substring(id FROM '-([0-9]+)$')::int), 0) AS serial
    FROM sama_ops.external_registered_ngo
    WHERE id LIKE 'SAM-%'
),
numbered AS (
    SELECT id, row_number() OVER (ORDER BY id) AS position
    FROM sama_ops.ngo_requests
)
UPDATE sama_ops.ngo_requests r
SET display_id = 'SAM-' || (e.serial + n.position)
FROM numbered n, external_max e
WHERE r.id = n.id
  AND NOT EXISTS (SELECT 1 FROM sama_ops.ngo_requests WHERE display_id IS NOT NULL)
  AND NOT EXISTS (SELECT 1 FROM sama_ops.ngo_request_id_state);

INSERT INTO sama_ops.ngo_request_id_state (singleton, last_serial)
SELECT TRUE, GREATEST(
    COALESCE((SELECT MAX(substring(display_id FROM '-([0-9]+)$')::int) FROM sama_ops.ngo_requests), 0),
    COALESCE((SELECT MAX(substring(id FROM '-([0-9]+)$')::int)
              FROM sama_ops.external_registered_ngo WHERE id LIKE 'SAM-%'), 0)
)
ON CONFLICT (singleton) DO UPDATE SET last_serial = GREATEST(
    sama_ops.ngo_request_id_state.last_serial, EXCLUDED.last_serial
);

COMMIT;
