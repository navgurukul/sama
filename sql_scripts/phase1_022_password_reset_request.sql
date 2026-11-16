-- Pending password resets. A temporary password becomes the account password
-- only when the user signs in with it, so the current password keeps working.
-- The API also creates this table on first use if it is missing.
BEGIN;

CREATE TABLE IF NOT EXISTS sama_ops.password_reset_request (
    id BIGSERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    temp_password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_password_reset_request_email
    ON sama_ops.password_reset_request (lower(email));

COMMIT;
