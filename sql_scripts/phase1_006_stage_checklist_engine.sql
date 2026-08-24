-- Phase 1.6: Stage, checklist, and gate engine (foundation)
-- Scope:
-- 1) Stage master and lifecycle metadata
-- 2) Checklist template structure (sections + items)
-- 3) Per-laptop stage runs and responses
-- 4) Stage gate rules and evaluations

BEGIN;

CREATE TABLE IF NOT EXISTS sama_ops.stage_definition (
    stage_code TEXT PRIMARY KEY,
    stage_name TEXT NOT NULL,
    display_order INTEGER NOT NULL,
    sla_hours INTEGER,
    responsible_role TEXT,
    verifier_role TEXT,
    requires_different_actor BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sama_ops.checklist_section (
    section_id BIGSERIAL PRIMARY KEY,
    stage_code TEXT NOT NULL REFERENCES sama_ops.stage_definition (stage_code) ON UPDATE CASCADE ON DELETE RESTRICT,
    section_code TEXT NOT NULL,
    section_name TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_checklist_section_stage_code UNIQUE (stage_code, section_code)
);

CREATE TABLE IF NOT EXISTS sama_ops.checklist_item (
    item_id BIGSERIAL PRIMARY KEY,
    section_id BIGINT NOT NULL REFERENCES sama_ops.checklist_section (section_id) ON UPDATE CASCADE ON DELETE CASCADE,
    item_code TEXT NOT NULL,
    item_text TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 1,
    is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
    evidence_required BOOLEAN NOT NULL DEFAULT FALSE,
    severity_if_fail TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_checklist_item_section_code UNIQUE (section_id, item_code),
    CONSTRAINT ck_checklist_item_severity CHECK (
        severity_if_fail IS NULL
        OR severity_if_fail IN ('P1', 'P2', 'P3')
    )
);

CREATE TABLE IF NOT EXISTS sama_ops.laptop_stage_run (
    run_id BIGSERIAL PRIMARY KEY,
    laptop_id TEXT NOT NULL REFERENCES sama_ops.laptop_labeling (id) ON UPDATE CASCADE ON DELETE RESTRICT,
    stage_code TEXT NOT NULL REFERENCES sama_ops.stage_definition (stage_code) ON UPDATE CASCADE ON DELETE RESTRICT,
    run_number INTEGER NOT NULL,
    outcome TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    started_by TEXT,
    completed_by TEXT,
    verifier_name TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    notes TEXT,
    CONSTRAINT uq_laptop_stage_run UNIQUE (
        laptop_id,
        stage_code,
        run_number
    ),
    CONSTRAINT ck_laptop_stage_run_outcome CHECK (
        outcome IN (
            'IN_PROGRESS',
            'PASS',
            'FAIL',
            'BLOCKED'
        )
    )
);

CREATE TABLE IF NOT EXISTS sama_ops.checklist_response (
    response_id BIGSERIAL PRIMARY KEY,
    run_id BIGINT NOT NULL REFERENCES sama_ops.laptop_stage_run (run_id) ON UPDATE CASCADE ON DELETE CASCADE,
    item_id BIGINT NOT NULL REFERENCES sama_ops.checklist_item (item_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    result TEXT NOT NULL,
    remark TEXT,
    evidence_url TEXT,
    responded_by TEXT,
    responded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_checklist_response_run_item UNIQUE (run_id, item_id),
    CONSTRAINT ck_checklist_response_result CHECK (
        result IN ('PASS', 'FAIL', 'NA')
    )
);

CREATE TABLE IF NOT EXISTS sama_ops.stage_gate_rule (
    rule_id BIGSERIAL PRIMARY KEY,
    stage_code TEXT NOT NULL REFERENCES sama_ops.stage_definition (stage_code) ON UPDATE CASCADE ON DELETE RESTRICT,
    rule_code TEXT NOT NULL,
    rule_name TEXT NOT NULL,
    is_blocking BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    config_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_stage_gate_rule_stage_code UNIQUE (stage_code, rule_code)
);

CREATE TABLE IF NOT EXISTS sama_ops.stage_gate_evaluation (
    evaluation_id BIGSERIAL PRIMARY KEY,
    run_id BIGINT NOT NULL REFERENCES sama_ops.laptop_stage_run (run_id) ON UPDATE CASCADE ON DELETE CASCADE,
    rule_id BIGINT NOT NULL REFERENCES sama_ops.stage_gate_rule (rule_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    passed BOOLEAN NOT NULL,
    details_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_stage_gate_eval_run_rule UNIQUE (run_id, rule_id)
);

CREATE INDEX IF NOT EXISTS idx_laptop_stage_run_laptop ON sama_ops.laptop_stage_run (laptop_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_checklist_response_run ON sama_ops.checklist_response (run_id);

CREATE INDEX IF NOT EXISTS idx_stage_gate_eval_run ON sama_ops.stage_gate_evaluation (run_id);

INSERT INTO
    sama_ops.stage_definition (
        stage_code,
        stage_name,
        display_order,
        sla_hours,
        responsible_role,
        verifier_role,
        requires_different_actor,
        is_active
    )
VALUES (
        'LAPTOP_RECEIVED',
        'Laptop Received',
        1,
        48,
        'Intake Staff',
        'Intake Supervisor',
        FALSE,
        TRUE
    ),
    (
        'REFURBISHMENT_TESTING',
        'Refurbishment and Testing',
        2,
        336,
        'Refurbisher',
        'QC Technician',
        FALSE,
        TRUE
    ),
    (
        'QC_CHECK',
        'QC Check',
        3,
        48,
        'QC Technician',
        'QC Supervisor',
        TRUE,
        TRUE
    ),
    (
        'DISTRIBUTION',
        'Distribution',
        4,
        24,
        'Dispatch Coordinator',
        'Dispatch Supervisor',
        FALSE,
        TRUE
    ),
    (
        'POST_DEPLOYMENT_15D',
        'Post-Deployment (15-day)',
        5,
        360,
        'Programme Coordinator',
        'Programme Manager',
        FALSE,
        TRUE
    ),
    (
        'MONTHLY_MONITORING',
        'Monthly Monitoring',
        6,
        720,
        'Programme Coordinator',
        'Programme Manager',
        FALSE,
        TRUE
    )
ON CONFLICT (stage_code) DO
UPDATE
SET
    stage_name = EXCLUDED.stage_name,
    display_order = EXCLUDED.display_order,
    sla_hours = EXCLUDED.sla_hours,
    responsible_role = EXCLUDED.responsible_role,
    verifier_role = EXCLUDED.verifier_role,
    requires_different_actor = EXCLUDED.requires_different_actor,
    is_active = EXCLUDED.is_active;

INSERT INTO
    sama_ops.checklist_section (
        stage_code,
        section_code,
        section_name,
        display_order
    )
VALUES (
    'LAPTOP_RECEIVED',
        'RECEIPT_DOCS',
        'Receipt and Documentation',
        1
    ),
    (
    'LAPTOP_RECEIVED',
        'RECEIPT_PHYSICAL',
        'Physical Verification',
        2
    )
ON CONFLICT (stage_code, section_code) DO
UPDATE
SET
    section_name = EXCLUDED.section_name,
    display_order = EXCLUDED.display_order,
    is_active = TRUE;

WITH
    section_ids AS (
        SELECT
            section_id,
            stage_code,
            section_code
        FROM sama_ops.checklist_section
        WHERE
            stage_code = 'LAPTOP_RECEIVED'
    )
INSERT INTO
    sama_ops.checklist_item (
        section_id,
        item_code,
        item_text,
        display_order,
        is_mandatory,
        evidence_required,
        severity_if_fail
    )
SELECT s.section_id, v.item_code, v.item_text, v.display_order, v.is_mandatory, v.evidence_required, v.severity_if_fail
FROM section_ids s
    JOIN (
        VALUES (
                'RECEIPT_DOCS', 'DONOR_TAG_MATCH', 'Donor tag/label is present and readable', 1, TRUE, TRUE, 'P2'
            ), (
                'RECEIPT_DOCS', 'SERIAL_MATCH', 'Serial number matches intake records', 2, TRUE, TRUE, 'P1'
            ), (
                'RECEIPT_PHYSICAL', 'BODY_DAMAGE_CHECK', 'No critical body damage that blocks boot test', 1, TRUE, TRUE, 'P1'
            ), (
                'RECEIPT_PHYSICAL', 'POWER_ON_CHECK', 'Device powers on successfully', 2, TRUE, TRUE, 'P1'
            ), (
                'RECEIPT_PHYSICAL', 'ADAPTER_PRESENT', 'Power adapter is present or marked missing', 3, FALSE, FALSE, 'P3'
            )
    ) AS v (
        section_code, item_code, item_text, display_order, is_mandatory, evidence_required, severity_if_fail
    ) ON s.section_code = v.section_code
ON CONFLICT (section_id, item_code) DO
UPDATE
SET
    item_text = EXCLUDED.item_text,
    display_order = EXCLUDED.display_order,
    is_mandatory = EXCLUDED.is_mandatory,
    evidence_required = EXCLUDED.evidence_required,
    severity_if_fail = EXCLUDED.severity_if_fail,
    is_active = TRUE;

INSERT INTO
    sama_ops.stage_gate_rule (
        stage_code,
        rule_code,
        rule_name,
        is_blocking,
        is_active,
        config_json
    )
VALUES (
        'LAPTOP_RECEIVED',
        'MANDATORY_ITEMS_PASS',
        'All mandatory checklist items must be PASS',
        TRUE,
        TRUE,
        '{"logic":"mandatory_pass"}'::jsonb
    ),
    (
        'REFURBISHMENT_TESTING',
        'MANDATORY_ITEMS_PASS',
        'All mandatory checklist items must be PASS',
        TRUE,
        TRUE,
        '{"logic":"mandatory_pass"}'::jsonb
    ),
    (
        'QC_CHECK',
        'MANDATORY_ITEMS_PASS',
        'All mandatory checklist items must be PASS',
        TRUE,
        TRUE,
        '{"logic":"mandatory_pass"}'::jsonb
    )
ON CONFLICT (stage_code, rule_code) DO
UPDATE
SET
    rule_name = EXCLUDED.rule_name,
    is_blocking = EXCLUDED.is_blocking,
    is_active = EXCLUDED.is_active,
    config_json = EXCLUDED.config_json;

COMMIT;