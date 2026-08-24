-- Phase 1.7: Add numeric stage_id keys while preserving stage_code compatibility

BEGIN;

ALTER TABLE sama_ops.stage_definition
ADD COLUMN IF NOT EXISTS stage_id INTEGER;

-- Seed deterministic stage_id values by stage_code
UPDATE sama_ops.stage_definition
SET
    stage_id = CASE stage_code
        WHEN 'LAPTOP_RECEIVED' THEN 1
        WHEN 'REFURBISHMENT_TESTING' THEN 2
        WHEN 'QC_CHECK' THEN 3
        WHEN 'DISTRIBUTION' THEN 4
        WHEN 'POST_DEPLOYMENT_15D' THEN 5
        WHEN 'MONTHLY_MONITORING' THEN 6
        ELSE stage_id
    END
WHERE
    stage_id IS NULL;

-- Backfill any remaining null stage_id from display_order
UPDATE sama_ops.stage_definition
SET
    stage_id = display_order
WHERE
    stage_id IS NULL;

ALTER TABLE sama_ops.stage_definition
ALTER COLUMN stage_id
SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'uq_stage_definition_stage_id'
    ) THEN
        ALTER TABLE sama_ops.stage_definition
            ADD CONSTRAINT uq_stage_definition_stage_id UNIQUE (stage_id);
    END IF;
END $$;

ALTER TABLE sama_ops.checklist_section
ADD COLUMN IF NOT EXISTS stage_id INTEGER;

UPDATE sama_ops.checklist_section cs
SET
    stage_id = sd.stage_id
FROM sama_ops.stage_definition sd
WHERE
    cs.stage_id IS NULL
    AND cs.stage_code = sd.stage_code;

ALTER TABLE sama_ops.checklist_section
ALTER COLUMN stage_id
SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_checklist_section_stage_id'
    ) THEN
        ALTER TABLE sama_ops.checklist_section
            ADD CONSTRAINT fk_checklist_section_stage_id
            FOREIGN KEY (stage_id)
            REFERENCES sama_ops.stage_definition(stage_id)
            ON UPDATE CASCADE
            ON DELETE RESTRICT;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'uq_checklist_section_stage_id_code'
    ) THEN
        ALTER TABLE sama_ops.checklist_section
            ADD CONSTRAINT uq_checklist_section_stage_id_code UNIQUE (stage_id, section_code);
    END IF;
END $$;

ALTER TABLE sama_ops.laptop_stage_run
ADD COLUMN IF NOT EXISTS stage_id INTEGER;

UPDATE sama_ops.laptop_stage_run r
SET
    stage_id = sd.stage_id
FROM sama_ops.stage_definition sd
WHERE
    r.stage_id IS NULL
    AND r.stage_code = sd.stage_code;

ALTER TABLE sama_ops.laptop_stage_run
ALTER COLUMN stage_id
SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_laptop_stage_run_stage_id'
    ) THEN
        ALTER TABLE sama_ops.laptop_stage_run
            ADD CONSTRAINT fk_laptop_stage_run_stage_id
            FOREIGN KEY (stage_id)
            REFERENCES sama_ops.stage_definition(stage_id)
            ON UPDATE CASCADE
            ON DELETE RESTRICT;
    END IF;
END $$;

ALTER TABLE sama_ops.stage_gate_rule
ADD COLUMN IF NOT EXISTS stage_id INTEGER;

UPDATE sama_ops.stage_gate_rule gr
SET
    stage_id = sd.stage_id
FROM sama_ops.stage_definition sd
WHERE
    gr.stage_id IS NULL
    AND gr.stage_code = sd.stage_code;

ALTER TABLE sama_ops.stage_gate_rule
ALTER COLUMN stage_id
SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_stage_gate_rule_stage_id'
    ) THEN
        ALTER TABLE sama_ops.stage_gate_rule
            ADD CONSTRAINT fk_stage_gate_rule_stage_id
            FOREIGN KEY (stage_id)
            REFERENCES sama_ops.stage_definition(stage_id)
            ON UPDATE CASCADE
            ON DELETE RESTRICT;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'uq_stage_gate_rule_stage_id_rule_code'
    ) THEN
        ALTER TABLE sama_ops.stage_gate_rule
            ADD CONSTRAINT uq_stage_gate_rule_stage_id_rule_code UNIQUE (stage_id, rule_code);
    END IF;
END $$;

COMMIT;