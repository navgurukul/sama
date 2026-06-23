-- Phase 1.9: Expand checklist sections/items and stage gate rules (6-stage lifecycle)
-- Scope:
-- 1) Seed checklist sections for 6 lifecycle stages
-- 2) Seed baseline checklist items for operational enforcement
-- 3) Seed stage gate rules including Stage 5/6 monitoring triggers

BEGIN;

WITH
    stage_map AS (
        SELECT stage_id, stage_code
        FROM sama_ops.stage_definition
    ),
    section_seed AS (
        SELECT *
        FROM (
                VALUES
                    ('LAPTOP_RECEIVED', 'RECEIPT_DOCS', 'Dashboard Entry and Grading', 10),
                    ('LAPTOP_RECEIVED', 'RECEIPT_PHYSICAL', 'Physical Inspection and Photos', 20),
                    ('LAPTOP_RECEIVED', 'RECEIPT_TAGGING', 'Barcode and Intake Tagging (Demo)', 30),
                    ('REFURBISHMENT_TESTING', 'REFURB_HW_CLEAN', 'Hardware Cleaning', 10),
                    ('REFURBISHMENT_TESTING', 'REFURB_TESTING', 'Functional Testing', 20),
                    ('REFURBISHMENT_TESTING', 'REFURB_SOFTWARE', 'Software Setup', 30),
                    ('QC_CHECK', 'QC_REVERIFY', 'QC Re-Verification', 10),
                    ('QC_CHECK', 'QC_SECURITY', 'Security and Compliance', 20),
                    ('DISTRIBUTION', 'DISPATCH_PRECHECK', 'Pre-Dispatch Verification', 10),
                    ('DISTRIBUTION', 'DISPATCH_DOCS', 'Dispatch Documentation', 20),
                    ('POST_DEPLOYMENT_15D', 'FOLLOWUP_CONTACT', 'NGO Follow-up and Feedback', 10),
                    ('POST_DEPLOYMENT_15D', 'FOLLOWUP_RMS', 'RMS and Early Issue Verification', 20),
                    ('MONTHLY_MONITORING', 'MONTHLY_USAGE', 'Usage and Impact Tracking', 10),
                    ('MONTHLY_MONITORING', 'MONTHLY_TECH', 'Technical Health and Issue Management', 20)
            ) AS t (
                stage_code, section_code, section_name, display_order
            )
    )
INSERT INTO
    sama_ops.checklist_section (
        stage_id,
        stage_code,
        section_code,
        section_name,
        display_order,
        is_active
    )
SELECT sm.stage_id, ss.stage_code, ss.section_code, ss.section_name, ss.display_order, TRUE
FROM section_seed ss
JOIN stage_map sm ON sm.stage_code = ss.stage_code
ON CONFLICT (stage_id, section_code) DO
UPDATE
SET
    section_name = EXCLUDED.section_name,
    display_order = EXCLUDED.display_order,
    is_active = TRUE;

WITH
    section_map AS (
        SELECT
            section_id,
            section_code
        FROM sama_ops.checklist_section
    ),
    item_seed AS (
        SELECT *
        FROM (
                VALUES
                    ('RECEIPT_PHYSICAL', 'TOP_LID_PHOTO', 'Inspect and photograph the top lid; note scratches, dents, cracks', 10, TRUE, TRUE, 'P2'),
                    ('RECEIPT_PHYSICAL', 'BOTTOM_PANEL_PHOTO', 'Inspect and photograph the bottom panel; note damage, missing screws, stickers', 20, TRUE, TRUE, 'P2'),
                    ('RECEIPT_PHYSICAL', 'BEZEL_HINGE_CHECK', 'Inspect the screen bezel and hinge; note wobble, cracks, or separation', 30, TRUE, FALSE, 'P2'),
                    ('RECEIPT_PHYSICAL', 'POWER_ON_DISPLAY_CHECK', 'Power on (if possible) and check for dead pixels, cracked panel, or backlight bleed', 40, TRUE, FALSE, 'P2'),
                    ('RECEIPT_PHYSICAL', 'KEYBOARD_INSPECTION', 'Inspect the keyboard; missing keys, sticky keys, visible liquid damage', 50, TRUE, FALSE, 'P2'),
                    ('RECEIPT_PHYSICAL', 'PORTS_INSPECTION', 'Inspect external ports (USB, HDMI, 3.5mm audio, charging) for physical damage', 60, TRUE, FALSE, 'P2'),
                    ('RECEIPT_DOCS', 'COSMETIC_GRADE_RECORDED', 'Record overall cosmetic grade in dashboard (Grade A/B/C)', 10, TRUE, FALSE, 'P2'),
                    ('RECEIPT_DOCS', 'UPLOAD_PHOTOS_MIN4', 'Upload at least 4 photographs (front, back, left, right) to the dashboard', 20, TRUE, TRUE, 'P1'),
                    ('RECEIPT_TAGGING', 'GENERATE_DEVICE_ID_BARCODE', 'Generate a unique device ID / barcode from the dashboard', 10, FALSE, FALSE, 'P3'),
                    ('RECEIPT_TAGGING', 'PRINT_AFFIX_BARCODE', 'Print and affix the barcode label to the underside of the device', 20, FALSE, FALSE, 'P3'),
                    ('RECEIPT_TAGGING', 'SCAN_BARCODE_CONFIRM', 'Scan the barcode to confirm it is readable and linked to the correct record', 30, FALSE, FALSE, 'P3'),
                    ('RECEIPT_TAGGING', 'PLACE_INTAKE_TRAY', 'Place device in a designated intake tray or shelf labeled with its unique ID', 40, FALSE, FALSE, 'P3'),
                    ('REFURB_HW_CLEAN', 'HARDWARE_CLEANING_DONE', 'Hardware cleaning completed', 10, TRUE, FALSE, 'P3'),
                    ('REFURB_HW_CLEAN', 'STORAGE_WIPE_DONE', 'Storage wipe completed as per SOP', 20, TRUE, TRUE, 'P1'),
                    ('REFURB_TESTING', 'POWER_TEST_DONE', 'Power test completed', 10, TRUE, TRUE, 'P1'),
                    ('REFURB_TESTING', 'INPUT_TEST_DONE', 'Keyboard and touchpad tests completed', 20, TRUE, TRUE, 'P2'),
                    ('REFURB_TESTING', 'BATTERY_TEST_DONE', 'Battery health test completed', 30, TRUE, TRUE, 'P2'),
                    ('REFURB_TESTING', 'PORT_TEST_DONE', 'Ports test completed', 40, TRUE, TRUE, 'P2'),
                    ('REFURB_TESTING', 'CAMERA_AUDIO_TEST_DONE', 'Camera and audio tests completed', 50, TRUE, TRUE, 'P2'),
                    ('REFURB_SOFTWARE', 'RMS_INSTALLED_ACTIVE', 'RMS installed and active', 10, TRUE, TRUE, 'P1'),
                    ('REFURB_SOFTWARE', 'TEST_RESULTS_DASHBOARD_UPDATED', 'Dashboard updated with all test outcomes', 20, TRUE, FALSE, 'P1'),
                    ('QC_REVERIFY', 'QC_ALL_ITEMS_COMPLETE', 'All QC checklist items completed', 10, TRUE, TRUE, 'P1'),
                    ('QC_REVERIFY', 'QC_OUTCOME_RECORDED', 'QC outcome with approver details recorded', 20, TRUE, TRUE, 'P1'),
                    ('QC_SECURITY', 'WINDOWS_ACTIVATED', 'Windows activation verified', 10, TRUE, TRUE, 'P1'),
                    ('QC_SECURITY', 'BIOS_PASSWORD_SET', 'BIOS password set and verified', 20, TRUE, TRUE, 'P1'),
                    ('QC_SECURITY', 'RMS_ACTIVE_IN_QC', 'RMS active during QC verification', 30, TRUE, TRUE, 'P1'),
                    ('DISPATCH_PRECHECK', 'STATUS_IS_QC_CHECK', 'Device is approved in QC_CHECK before dispatch', 10, TRUE, FALSE, 'P1'),
                    ('DISPATCH_PRECHECK', 'DISPATCH_FIELDS_COMPLETE', 'All mandatory dispatch fields are complete', 20, TRUE, FALSE, 'P1'),
                    ('DISPATCH_DOCS', 'ACK_OR_TRACKING_CONFIRMED', 'Acknowledgement or tracking confirmation obtained', 10, TRUE, TRUE, 'P1'),
                    ('FOLLOWUP_CONTACT', 'NGO_CONTACT_COMPLETED', '15-day NGO follow-up completed', 10, TRUE, FALSE, 'P2'),
                    ('FOLLOWUP_CONTACT', 'SATISFACTION_NOTE_CAPTURED', 'Initial satisfaction and impact note captured', 20, FALSE, FALSE, 'P3'),
                    ('FOLLOWUP_RMS', 'RMS_STATUS_VERIFIED', 'RMS status verified with latest heartbeat', 10, TRUE, FALSE, 'P1'),
                    ('FOLLOWUP_RMS', 'EARLY_ISSUE_LOGGED', 'Any early issue has been logged with severity', 20, TRUE, FALSE, 'P1'),
                    ('MONTHLY_USAGE', 'ACTIVE_USERS_CAPTURED', 'Monthly active users count captured', 10, TRUE, FALSE, 'P2'),
                    ('MONTHLY_USAGE', 'PRIMARY_USE_CASE_UPDATED', 'Primary use case and impact notes updated', 20, TRUE, FALSE, 'P3'),
                    ('MONTHLY_TECH', 'MONTHLY_TECH_HEALTH_REVIEWED', 'Technical health reviewed for the month', 10, TRUE, FALSE, 'P2'),
                    ('MONTHLY_TECH', 'MONTHLY_ISSUES_REVIEWED', 'Open issues reviewed and updated', 20, TRUE, FALSE, 'P2')
            ) AS t (
                section_code, item_code, item_text, display_order, is_mandatory, evidence_required, severity_if_fail
            )
    )
INSERT INTO
    sama_ops.checklist_item (
        section_id,
        item_code,
        item_text,
        display_order,
        is_mandatory,
        evidence_required,
        severity_if_fail,
        is_active
    )
SELECT sm.section_id, isd.item_code, isd.item_text, isd.display_order, isd.is_mandatory, isd.evidence_required, isd.severity_if_fail, TRUE
FROM item_seed isd
JOIN section_map sm ON sm.section_code = isd.section_code
ON CONFLICT (section_id, item_code) DO
UPDATE
SET
    item_text = EXCLUDED.item_text,
    display_order = EXCLUDED.display_order,
    is_mandatory = EXCLUDED.is_mandatory,
    evidence_required = EXCLUDED.evidence_required,
    severity_if_fail = EXCLUDED.severity_if_fail,
    is_active = TRUE;

-- Deactivate Stage 1 items not part of the current Laptop Received checklist.
UPDATE sama_ops.checklist_item i
SET is_active = FALSE
FROM sama_ops.checklist_section s
WHERE i.section_id = s.section_id
    AND s.stage_code = 'LAPTOP_RECEIVED'
    AND i.item_code NOT IN (
        'TOP_LID_PHOTO',
        'BOTTOM_PANEL_PHOTO',
        'BEZEL_HINGE_CHECK',
        'POWER_ON_DISPLAY_CHECK',
        'KEYBOARD_INSPECTION',
        'PORTS_INSPECTION',
        'COSMETIC_GRADE_RECORDED',
        'UPLOAD_PHOTOS_MIN4',
        'GENERATE_DEVICE_ID_BARCODE',
        'PRINT_AFFIX_BARCODE',
        'SCAN_BARCODE_CONFIRM',
        'PLACE_INTAKE_TRAY'
    );

WITH
    stage_map AS (
        SELECT stage_id, stage_code
        FROM sama_ops.stage_definition
    ),
    rule_seed AS (
        SELECT *
        FROM (
                VALUES
                    ('LAPTOP_RECEIVED', 'STAGE1_DASHBOARD_FIELDS_COMPLETE', 'Any dashboard field left blank or marked unknown', TRUE, '{"logic":"dashboard_fields_complete"}'::jsonb),
                    ('LAPTOP_RECEIVED', 'STAGE1_PHOTOS_UPLOADED', 'Photographs are uploaded', TRUE, '{"logic":"photos_uploaded","minPhotos":4}'::jsonb),
                    ('LAPTOP_RECEIVED', 'STAGE1_SERIAL_VERIFIED', 'Serial number verified', TRUE, '{"logic":"serial_verified"}'::jsonb),
                    ('LAPTOP_RECEIVED', 'STAGE1_BARCODE_AFFIXED', 'Barcode affixed and scanned', TRUE, '{"logic":"barcode_scanned","itemCodes":["PRINT_AFFIX_BARCODE","SCAN_BARCODE_CONFIRM"]}'::jsonb),
                    ('REFURBISHMENT_TESTING', 'STAGE2_ALL_TESTS_COMPLETED', 'All functional tests completed', TRUE, '{"logic":"stage2_tests_completed","itemCodes":["POWER_TEST_DONE","INPUT_TEST_DONE","BATTERY_TEST_DONE","PORT_TEST_DONE","CAMERA_AUDIO_TEST_DONE"]}'::jsonb),
                    ('REFURBISHMENT_TESTING', 'STAGE2_FAILS_WITH_RESOLUTION', 'FAIL test results have approved resolution', TRUE, '{"logic":"manual_check"}'::jsonb),
                    ('REFURBISHMENT_TESTING', 'STAGE2_RMS_ACTIVE', 'RMS installed and active', TRUE, '{"logic":"stage2_rms_active","itemCode":"RMS_INSTALLED_ACTIVE"}'::jsonb),
                    ('REFURBISHMENT_TESTING', 'STAGE2_DASHBOARD_UPDATED', 'Dashboard updated with all test results', TRUE, '{"logic":"stage2_dashboard_updated","itemCode":"TEST_RESULTS_DASHBOARD_UPDATED"}'::jsonb),
                    ('REFURBISHMENT_TESTING', 'STAGE2_NO_UNRESOLVED_REPAIR_REQUIRED', 'No unresolved repair-required status', TRUE, '{"logic":"manual_check"}'::jsonb),
                    ('QC_CHECK', 'STAGE3_DIFFERENT_ACTOR_QC', 'QC performed by actor different from refurbishment actor', TRUE, '{"logic":"requires_different_actor"}'::jsonb),
                    ('QC_CHECK', 'STAGE3_ITEMS_COMPLETE', 'All QC checks complete and resolved', TRUE, '{"logic":"manual_check"}'::jsonb),
                    ('QC_CHECK', 'STAGE3_WINDOWS_ACTIVATED', 'Windows activated', TRUE, '{"logic":"manual_check"}'::jsonb),
                    ('QC_CHECK', 'STAGE3_BIOS_PASSWORD_SET', 'BIOS password set', TRUE, '{"logic":"manual_check"}'::jsonb),
                    ('QC_CHECK', 'STAGE3_RMS_ACTIVE', 'RMS active during QC', TRUE, '{"logic":"manual_check"}'::jsonb),
                    ('QC_CHECK', 'STAGE3_OUTCOME_WITH_APPROVER', 'QC outcome recorded with approver and date', TRUE, '{"logic":"manual_check"}'::jsonb),
                    ('DISTRIBUTION', 'STAGE4_STATUS_QC_CHECK', 'Device is ready for distribution from QC_CHECK', TRUE, '{"logic":"manual_check"}'::jsonb),
                    ('DISTRIBUTION', 'STAGE4_DISPATCH_FIELDS_COMPLETE', 'Required dispatch fields complete', TRUE, '{"logic":"manual_check"}'::jsonb),
                    ('DISTRIBUTION', 'STAGE4_ACK_OR_TRACKING', 'Acknowledgement or tracking confirmation captured', TRUE, '{"logic":"manual_check"}'::jsonb),
                    ('POST_DEPLOYMENT_15D', 'STAGE5_15DAY_CHECK_TRIGGER', '15-day post-deployment check due/completed', FALSE, '{"logic":"monitoring_trigger"}'::jsonb),
                    ('POST_DEPLOYMENT_15D', 'STAGE5_ISSUE_ESCALATION_TRIGGER', 'Escalate when early issue detected', FALSE, '{"logic":"monitoring_trigger"}'::jsonb),
                    ('MONTHLY_MONITORING', 'STAGE6_MONTHLY_CHECKIN_TRIGGER', 'Monthly NGO check-in due/completed', FALSE, '{"logic":"monitoring_trigger"}'::jsonb),
                    ('MONTHLY_MONITORING', 'STAGE6_USAGE_IMPACT_TRACKED', 'Usage and impact metrics tracked', FALSE, '{"logic":"monitoring_trigger"}'::jsonb),
                    ('MONTHLY_MONITORING', 'STAGE6_TECH_HEALTH_REVIEWED', 'Technical health reviewed', FALSE, '{"logic":"monitoring_trigger"}'::jsonb),
                    ('MONTHLY_MONITORING', 'STAGE6_ISSUES_MANAGED', 'Issue management lifecycle tracked', FALSE, '{"logic":"monitoring_trigger"}'::jsonb),
                    ('MONTHLY_MONITORING', 'STAGE6_EOL_ASSESSMENT', 'End-of-life assessment performed when applicable', FALSE, '{"logic":"monitoring_trigger"}'::jsonb)
            ) AS t (
                stage_code, rule_code, rule_name, is_blocking, config_json
            )
    )
INSERT INTO
    sama_ops.stage_gate_rule (
        stage_id,
        stage_code,
        rule_code,
        rule_name,
        is_blocking,
        is_active,
        config_json
    )
SELECT sm.stage_id, rs.stage_code, rs.rule_code, rs.rule_name, rs.is_blocking, TRUE, rs.config_json
FROM rule_seed rs
JOIN stage_map sm ON sm.stage_code = rs.stage_code
ON CONFLICT (stage_id, rule_code) DO
UPDATE
SET
    rule_name = EXCLUDED.rule_name,
    is_blocking = EXCLUDED.is_blocking,
    is_active = TRUE,
    config_json = EXCLUDED.config_json;

COMMIT;
