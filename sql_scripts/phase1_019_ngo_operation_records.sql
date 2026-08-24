-- Store legacy NGO form/report/document payloads in PostgreSQL.
BEGIN;

CREATE TABLE IF NOT EXISTS sama_ops.ngo_operation_records (
    record_id BIGSERIAL PRIMARY KEY,
    operation TEXT NOT NULL,
    ngo_id TEXT,
    record_key TEXT NOT NULL DEFAULT 'default',
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (operation, ngo_id, record_key)
);

CREATE INDEX IF NOT EXISTS idx_ngo_operation_records_lookup
    ON sama_ops.ngo_operation_records (operation, ngo_id, updated_at DESC);

COMMIT;
