-- Phase 1.15: Create ngo_requests table for automated email request draft queue
BEGIN;

CREATE TABLE IF NOT EXISTS sama_ops.ngo_requests (
    id SERIAL PRIMARY KEY,
    ngo_name TEXT NOT NULL,
    laptop_quantity INTEGER NOT NULL,
    location TEXT,
    use_case TEXT,
    contact_name TEXT,
    email TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    tentative_refurb_completion DATE,
    donor TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ngo_requests_email ON sama_ops.ngo_requests (email);
CREATE INDEX IF NOT EXISTS idx_ngo_requests_status ON sama_ops.ngo_requests (status);

COMMIT;
