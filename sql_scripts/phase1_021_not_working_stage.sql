BEGIN;

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
    (7, 'NOT_WORKING', 'Not Working', 7, 0, 'Intake Staff', 'Intake Supervisor', FALSE, TRUE)
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

COMMIT;
