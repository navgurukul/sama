-- Store public website forms while preserving the legacy Google Sheet copy.
BEGIN;

CREATE TABLE IF NOT EXISTS sama_ops.public_inquiries (
    id BIGSERIAL PRIMARY KEY,
    form_type TEXT NOT NULL,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    company_name TEXT,
    phone TEXT,
    state TEXT,
    city TEXT,
    message TEXT,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_public_inquiries_form_type
    ON sama_ops.public_inquiries (form_type);
CREATE INDEX IF NOT EXISTS idx_public_inquiries_email
    ON sama_ops.public_inquiries (email);
CREATE INDEX IF NOT EXISTS idx_public_inquiries_created_at
    ON sama_ops.public_inquiries (created_at DESC);

COMMIT;
