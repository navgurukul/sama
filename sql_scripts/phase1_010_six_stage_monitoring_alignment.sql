-- Phase 1.10: Align existing data to 6 lifecycle stages + add monitoring tables
-- Safe to run multiple times.

BEGIN;

-- 1) Create monitoring tables required for Stage 5/6 workflow support.
CREATE TABLE IF NOT EXISTS sama_ops.issue_log (
    issue_id BIGSERIAL PRIMARY KEY,
    laptop_id TEXT NOT NULL REFERENCES sama_ops.laptop_labeling (id) ON UPDATE CASCADE ON DELETE CASCADE,
    run_id BIGINT REFERENCES sama_ops.laptop_stage_run (run_id) ON UPDATE CASCADE ON DELETE SET NULL,
    issue_description TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'P2',
    reported_by TEXT,
    reported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolution_action TEXT,
    resolved_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_issue_log_severity CHECK (severity IN ('P1', 'P2', 'P3')),
    CONSTRAINT ck_issue_log_status CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'))
);

CREATE TABLE IF NOT EXISTS sama_ops.monthly_check_in (
    checkin_id BIGSERIAL PRIMARY KEY,
    laptop_id TEXT NOT NULL REFERENCES sama_ops.laptop_labeling (id) ON UPDATE CASCADE ON DELETE CASCADE,
    run_id BIGINT REFERENCES sama_ops.laptop_stage_run (run_id) ON UPDATE CASCADE ON DELETE SET NULL,
    checkin_date DATE NOT NULL,
    checkin_type TEXT NOT NULL DEFAULT 'MONTHLY',
    ngo_contact_person TEXT,
    device_status TEXT,
    active_users_count INTEGER,
    primary_use_case TEXT,
    rms_status TEXT,
    rms_last_seen TIMESTAMPTZ,
    impact_notes TEXT,
    action_items TEXT,
    updated_by TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_monthly_checkin_type CHECK (checkin_type IN ('DAY_15', 'MONTHLY')),
    CONSTRAINT ck_monthly_checkin_active_users CHECK (active_users_count IS NULL OR active_users_count >= 0)
);

CREATE INDEX IF NOT EXISTS idx_issue_log_laptop ON sama_ops.issue_log (laptop_id, reported_at DESC);
CREATE INDEX IF NOT EXISTS idx_issue_log_status ON sama_ops.issue_log (status, severity);
CREATE INDEX IF NOT EXISTS idx_monthly_checkin_laptop ON sama_ops.monthly_check_in (laptop_id, checkin_date DESC);

-- 2) Shift existing stage_definition ids to free 1..6 for canonical lifecycle ids.
UPDATE sama_ops.stage_definition
SET stage_id = stage_id + 100
WHERE stage_id BETWEEN 1 AND 99;

-- 3) Canonical 6-stage definitions.
INSERT INTO
    sama_ops.stage_definition (
        stage_id,
        stage_code,
        stage_name,
        display_order,
        sla_hours,
        responsible_role,
        verifier_role,
        requires_different_actor,
        is_active
    )
VALUES
    (1, 'LAPTOP_RECEIVED', 'Laptop Received', 1, 48, 'Intake Staff', 'Intake Supervisor', FALSE, TRUE),
    (2, 'REFURBISHMENT_TESTING', 'Refurbishment and Testing', 2, 336, 'Refurbisher', 'QC Technician', FALSE, TRUE),
    (3, 'QC_CHECK', 'QC Check', 3, 48, 'QC Technician', 'QC Supervisor', TRUE, TRUE),
    (4, 'DISTRIBUTION', 'Distribution', 4, 48, 'Dispatch Coordinator', 'Dispatch Supervisor', FALSE, TRUE),
    (5, 'POST_DEPLOYMENT_15D', 'Post-Deployment (15-day)', 5, 360, 'Programme Coordinator', 'Programme Manager', FALSE, TRUE),
    (6, 'MONTHLY_MONITORING', 'Monthly Monitoring', 6, 720, 'Programme Coordinator', 'Programme Manager', FALSE, TRUE)
ON CONFLICT (stage_code) DO
UPDATE
SET
    stage_id = EXCLUDED.stage_id,
    stage_name = EXCLUDED.stage_name,
    display_order = EXCLUDED.display_order,
    sla_hours = EXCLUDED.sla_hours,
    responsible_role = EXCLUDED.responsible_role,
    verifier_role = EXCLUDED.verifier_role,
    requires_different_actor = EXCLUDED.requires_different_actor,
    is_active = TRUE;

-- 4) Deactivate any non-canonical stage definitions.
UPDATE sama_ops.stage_definition
SET is_active = FALSE
WHERE stage_code NOT IN (
    'LAPTOP_RECEIVED',
    'REFURBISHMENT_TESTING',
    'QC_CHECK',
    'DISTRIBUTION',
    'POST_DEPLOYMENT_15D',
    'MONTHLY_MONITORING'
);

-- 5) Map laptop status values from old 8-stage model to canonical 6-stage model.
UPDATE sama_ops.laptop_labeling
SET status = CASE upper(coalesce(status, ''))
    WHEN 'RECEIVED' THEN 'LAPTOP_RECEIVED'
    WHEN 'REFURBISHMENT_STARTED' THEN 'REFURBISHMENT_TESTING'
    WHEN 'REFURBISHMENT_COMPLETE' THEN 'REFURBISHMENT_TESTING'
    WHEN 'QC_APPROVED' THEN 'QC_CHECK'
    WHEN 'QC_FAILED' THEN 'REFURBISHMENT_TESTING'
    WHEN 'DISPATCHED' THEN 'DISTRIBUTION'
    WHEN 'UNDER_REPAIR' THEN 'REFURBISHMENT_TESTING'
    WHEN 'RETIRED' THEN 'MONTHLY_MONITORING'
    ELSE status
END
WHERE status IS NOT NULL;

-- 6) Remap stage_code in lifecycle tables to canonical values.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'uq_laptop_stage_run'
    ) THEN
        ALTER TABLE sama_ops.laptop_stage_run DROP CONSTRAINT uq_laptop_stage_run;
    END IF;
END $$;

UPDATE sama_ops.laptop_stage_run
SET stage_code = CASE upper(stage_code)
    WHEN 'RECEIVED' THEN 'LAPTOP_RECEIVED'
    WHEN 'REFURBISHMENT_STARTED' THEN 'REFURBISHMENT_TESTING'
    WHEN 'REFURBISHMENT_COMPLETE' THEN 'REFURBISHMENT_TESTING'
    WHEN 'QC_APPROVED' THEN 'QC_CHECK'
    WHEN 'QC_FAILED' THEN 'REFURBISHMENT_TESTING'
    WHEN 'DISPATCHED' THEN 'DISTRIBUTION'
    WHEN 'UNDER_REPAIR' THEN 'REFURBISHMENT_TESTING'
    WHEN 'RETIRED' THEN 'MONTHLY_MONITORING'
    ELSE stage_code
END;

UPDATE sama_ops.checklist_section
SET stage_code = CASE upper(stage_code)
    WHEN 'RECEIVED' THEN 'LAPTOP_RECEIVED'
    WHEN 'REFURBISHMENT_STARTED' THEN 'REFURBISHMENT_TESTING'
    WHEN 'REFURBISHMENT_COMPLETE' THEN 'QC_CHECK'
    WHEN 'QC_APPROVED' THEN 'DISTRIBUTION'
    WHEN 'QC_FAILED' THEN 'REFURBISHMENT_TESTING'
    WHEN 'DISPATCHED' THEN 'POST_DEPLOYMENT_15D'
    WHEN 'UNDER_REPAIR' THEN 'MONTHLY_MONITORING'
    WHEN 'RETIRED' THEN 'MONTHLY_MONITORING'
    ELSE stage_code
END;

UPDATE sama_ops.stage_gate_rule
SET stage_code = CASE upper(stage_code)
    WHEN 'RECEIVED' THEN 'LAPTOP_RECEIVED'
    WHEN 'REFURBISHMENT_STARTED' THEN 'REFURBISHMENT_TESTING'
    WHEN 'REFURBISHMENT_COMPLETE' THEN 'QC_CHECK'
    WHEN 'QC_APPROVED' THEN 'DISTRIBUTION'
    WHEN 'QC_FAILED' THEN 'REFURBISHMENT_TESTING'
    WHEN 'DISPATCHED' THEN 'POST_DEPLOYMENT_15D'
    WHEN 'UNDER_REPAIR' THEN 'MONTHLY_MONITORING'
    WHEN 'RETIRED' THEN 'MONTHLY_MONITORING'
    ELSE stage_code
END;

-- 7) Backfill stage_id from canonical stage_definition.
UPDATE sama_ops.laptop_stage_run r
SET stage_id = sd.stage_id
FROM sama_ops.stage_definition sd
WHERE sd.stage_code = r.stage_code
  AND sd.is_active = TRUE;

UPDATE sama_ops.checklist_section s
SET stage_id = sd.stage_id
FROM sama_ops.stage_definition sd
WHERE sd.stage_code = s.stage_code
  AND sd.is_active = TRUE;

UPDATE sama_ops.stage_gate_rule g
SET stage_id = sd.stage_id
FROM sama_ops.stage_definition sd
WHERE sd.stage_code = g.stage_code
  AND sd.is_active = TRUE;

-- 8) Normalize run_number after stage merges to keep uniqueness stable.
WITH renumber AS (
    SELECT
        run_id,
        row_number() OVER (
            PARTITION BY laptop_id, stage_code
            ORDER BY coalesce(started_at, now()), run_id
        ) AS new_run_number
    FROM sama_ops.laptop_stage_run
)
UPDATE sama_ops.laptop_stage_run r
SET run_number = renumber.new_run_number
FROM renumber
WHERE renumber.run_id = r.run_id;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'uq_laptop_stage_run'
    ) THEN
        ALTER TABLE sama_ops.laptop_stage_run
            ADD CONSTRAINT uq_laptop_stage_run UNIQUE (laptop_id, stage_code, run_number);
    END IF;
END $$;

COMMIT;
