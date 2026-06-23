-- Phase 1.11: Add stage role assignments for employees and align stage_definition roles
-- Scope:
-- 1) Add stage_roles column to user_profile_userrole (multi-role support)
-- 2) Backfill all users with all current stage roles
-- 3) Update stage_definition role labels to the approved actor/verifier roles

BEGIN;

-- 1) Add stage_roles column for multi-role assignments.
ALTER TABLE sama_ops.user_profile_userrole
ADD COLUMN IF NOT EXISTS stage_roles TEXT[];

-- 2) Set default to all roles for now.
ALTER TABLE sama_ops.user_profile_userrole
ALTER COLUMN stage_roles SET DEFAULT ARRAY[
    'Intake Staff',
    'Intake Supervisor',
    'Refurbisher',
    'QC Technician',
    'QC Supervisor',
    'Dispatch Coordinator',
    'Dispatch Supervisor',
    'Programme Coordinator',
    'Programme Manager'
]::text[];

-- 3) Give all roles to all existing users.
UPDATE sama_ops.user_profile_userrole
SET stage_roles = ARRAY[
    'Intake Staff',
    'Intake Supervisor',
    'Refurbisher',
    'QC Technician',
    'QC Supervisor',
    'Dispatch Coordinator',
    'Dispatch Supervisor',
    'Programme Coordinator',
    'Programme Manager'
]::text[];

-- 4) Align stage_definition roles to approved actor/verifier titles.
UPDATE sama_ops.stage_definition
SET
    responsible_role = CASE stage_code
        WHEN 'LAPTOP_RECEIVED' THEN 'Intake Staff'
        WHEN 'REFURBISHMENT_TESTING' THEN 'Refurbisher'
        WHEN 'QC_CHECK' THEN 'QC Technician'
        WHEN 'DISTRIBUTION' THEN 'Dispatch Coordinator'
        WHEN 'POST_DEPLOYMENT_15D' THEN 'Programme Coordinator'
        WHEN 'MONTHLY_MONITORING' THEN 'Programme Coordinator'
        ELSE responsible_role
    END,
    verifier_role = CASE stage_code
        WHEN 'LAPTOP_RECEIVED' THEN 'Intake Supervisor'
        WHEN 'REFURBISHMENT_TESTING' THEN 'QC Technician'
        WHEN 'QC_CHECK' THEN 'QC Supervisor'
        WHEN 'DISTRIBUTION' THEN 'Dispatch Supervisor'
        WHEN 'POST_DEPLOYMENT_15D' THEN 'Programme Manager'
        WHEN 'MONTHLY_MONITORING' THEN 'Programme Manager'
        ELSE verifier_role
    END
WHERE stage_code IN (
    'LAPTOP_RECEIVED',
    'REFURBISHMENT_TESTING',
    'QC_CHECK',
    'DISTRIBUTION',
    'POST_DEPLOYMENT_15D',
    'MONTHLY_MONITORING'
);

COMMIT;
