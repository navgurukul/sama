-- Phase 1.13: Full checklist item expansion for all 6 lifecycle stages
-- Fills the gap between the ~37 baseline items seeded in phase 1.9 and the
-- ~145 items described in the product spec (Ops_db_schema.md section 5).
-- This migration ONLY inserts new items; existing items are not changed.
-- ON CONFLICT updates text/order so re-running is safe.

BEGIN;

WITH
    section_map AS (
        SELECT section_id, section_code
        FROM sama_ops.checklist_section
        WHERE is_active = TRUE
    ),
    item_seed AS (
        SELECT * FROM (VALUES

            -- ================================================================
            -- STAGE 1: LAPTOP RECEIVED
            -- ================================================================

            -- Section: RECEIPT_DOCS  (existing max display_order = 20)
            ('RECEIPT_DOCS', 'SERIAL_NUMBER_RECORDED',    'Serial number recorded in dashboard',                                          30, TRUE,  FALSE, 'P1'),
            ('RECEIPT_DOCS', 'DONOR_NAME_VERIFIED',       'Donor company name verified and recorded',                                     40, TRUE,  FALSE, 'P2'),
            ('RECEIPT_DOCS', 'SPECS_RECORDED',            'Device specs (RAM, ROM, CPU, Model) recorded in dashboard',                    50, TRUE,  FALSE, 'P2'),

            -- Section: RECEIPT_PHYSICAL  (existing max = 60)
            ('RECEIPT_PHYSICAL', 'CHARGING_PORT_TEST',    'Charging port and power adapter tested',                                       70, TRUE,  FALSE, 'P2'),

            -- Section: RECEIPT_TAGGING  (existing max = 40)
            ('RECEIPT_TAGGING', 'INVENTORY_LOCATION_UPDATED', 'Inventory location updated in dashboard',                                  50, TRUE,  FALSE, 'P2'),
            ('RECEIPT_TAGGING', 'INTAKE_NOTE_ADDED',      'Special condition notes recorded if any',                                      60, FALSE, FALSE, 'P3'),

            -- ================================================================
            -- STAGE 2: REFURBISHMENT & TESTING
            -- ================================================================

            -- Section: REFURB_SOFTWARE  (existing max = 20)
            -- NOTE: REFURB_HW_CLEAN and REFURB_TESTING granular steps are already
            -- covered by sub_items_json on the existing items (phase1_012). Only
            -- the software setup items are genuinely missing here.
            ('REFURB_SOFTWARE', 'OS_FRESH_INSTALL_OR_RESET',  'OS freshly installed or factory-reset to clean state',                    30, TRUE,  FALSE, 'P1'),
            ('REFURB_SOFTWARE', 'OS_UPDATES_APPLIED',         'All OS and security updates applied',                                     40, TRUE,  FALSE, 'P1'),
            ('REFURB_SOFTWARE', 'DRIVERS_UPDATED',            'All device drivers updated to latest stable version',                     50, TRUE,  FALSE, 'P2'),
            ('REFURB_SOFTWARE', 'ANTIVIRUS_INSTALLED',        'Antivirus software installed and active',                                 60, TRUE,  FALSE, 'P2'),
            ('REFURB_SOFTWARE', 'BLOATWARE_REMOVED',          'Unnecessary pre-installed software removed',                              70, FALSE, FALSE, 'P3'),
            ('REFURB_SOFTWARE', 'LOCAL_ADMIN_PASSWORD_SET',   'Local admin password set per security policy',                            80, TRUE,  FALSE, 'P1'),
            ('REFURB_SOFTWARE', 'WINDOWS_ACTIVATION_REFURB',  'Windows activation completed and verified',                               90, TRUE,  FALSE, 'P1'),

            -- ================================================================
            -- STAGE 3: QC CHECK
            -- ================================================================

            -- Section: QC_REVERIFY  (existing max = 20)
            ('QC_REVERIFY', 'QC_POWER_VERIFY',             'Device powers on and boots normally — verified independently by QC',          30, TRUE,  FALSE, 'P1'),
            ('QC_REVERIFY', 'QC_KEYBOARD_VERIFY',          'Keyboard fully functional — verified by QC',                                 40, TRUE,  FALSE, 'P2'),
            ('QC_REVERIFY', 'QC_DISPLAY_VERIFY',           'Display quality verified — no dead pixels, correct resolution, no burn-in',   50, TRUE,  FALSE, 'P1'),
            ('QC_REVERIFY', 'QC_AUDIO_VERIFY',             'Audio output verified — speakers and headphone jack tested by QC',            60, TRUE,  FALSE, 'P2'),
            ('QC_REVERIFY', 'QC_PORT_VERIFY',              'All ports verified — USB, charging, video out tested by QC',                  70, TRUE,  FALSE, 'P2'),
            ('QC_REVERIFY', 'QC_WIFI_VERIFY',              'WiFi connectivity verified by QC',                                           80, TRUE,  FALSE, 'P2'),
            ('QC_REVERIFY', 'QC_BATTERY_VERIFY',           'Battery health verified — minimum threshold met per QC standard',            90, TRUE,  FALSE, 'P1'),
            ('QC_REVERIFY', 'QC_CAMERA_VERIFY',            'Camera image quality verified by QC',                                       100, FALSE, FALSE, 'P3'),
            ('QC_REVERIFY', 'QC_PERFORMANCE_VERIFY',       'No system freeze or sluggishness observed under QC load test',               110, TRUE,  FALSE, 'P1'),
            ('QC_REVERIFY', 'QC_TOUCHPAD_VERIFY',          'Touchpad response and gestures verified by QC',                             120, TRUE,  FALSE, 'P2'),
            ('QC_REVERIFY', 'QC_SERIAL_MATCH',             'Serial number on device matches dashboard record — confirmed by QC',         130, TRUE,  FALSE, 'P1'),
            ('QC_REVERIFY', 'QC_COSMETIC_FINAL',           'Final cosmetic grade confirmed and recorded by QC officer',                  140, TRUE,  FALSE, 'P2'),

            -- Section: QC_SECURITY  (existing max = 30)
            ('QC_SECURITY', 'FIREWALL_ENABLED',            'Windows Firewall enabled and active',                                        40, TRUE,  FALSE, 'P1'),
            ('QC_SECURITY', 'ANTIVIRUS_ACTIVE_QC',         'Antivirus active and up to date — verified by QC',                          50, TRUE,  FALSE, 'P2'),
            ('QC_SECURITY', 'OS_UPDATES_CURRENT_QC',       'Windows updates current — verified by QC',                                  60, TRUE,  FALSE, 'P2'),
            ('QC_SECURITY', 'GUEST_ACCOUNT_DISABLED',      'Guest or unauthorised accounts disabled per security policy',                70, TRUE,  FALSE, 'P2'),
            ('QC_SECURITY', 'QC_SIGN_OFF',                 'QC sign-off completed by authorised QC officer with date',                  80, TRUE,  FALSE, 'P1'),

            -- ================================================================
            -- STAGE 4: DISTRIBUTION
            -- ================================================================

            -- Section: DISPATCH_PRECHECK  (existing max = 20)
            ('DISPATCH_PRECHECK', 'BENEFICIARY_DETAILS_CONFIRMED', 'Beneficiary name, contact and address confirmed',                    30, TRUE,  FALSE, 'P1'),
            ('DISPATCH_PRECHECK', 'NGO_CONTACT_CONFIRMED',         'NGO coordinator contact confirmed for dispatch',                     40, TRUE,  FALSE, 'P2'),
            ('DISPATCH_PRECHECK', 'DISPATCH_DATE_SCHEDULED',       'Dispatch date scheduled and communicated to NGO',                    50, TRUE,  FALSE, 'P2'),
            ('DISPATCH_PRECHECK', 'PACKAGING_COMPLETE',            'Device properly packaged for transport',                             60, TRUE,  TRUE,  'P2'),
            ('DISPATCH_PRECHECK', 'ACCESSORIES_PACKED',            'All accessories (charger, bag) packed and confirmed',                70, TRUE,  FALSE, 'P2'),

            -- Section: DISPATCH_DOCS  (existing max = 10)
            ('DISPATCH_DOCS', 'DELIVERY_NOTE_GENERATED',    'Delivery note or challan generated and attached',                           20, TRUE,  TRUE,  'P1'),
            ('DISPATCH_DOCS', 'BENEFICIARY_ID_VERIFIED',    'Beneficiary ID proof verified before handover',                             30, TRUE,  FALSE, 'P1'),
            ('DISPATCH_DOCS', 'NGO_ACCEPTANCE_OBTAINED',    'NGO acceptance or acknowledgment obtained',                                 40, TRUE,  TRUE,  'P1'),
            ('DISPATCH_DOCS', 'HANDOVER_FORM_SIGNED',       'Handover form signed by receiver',                                         50, TRUE,  TRUE,  'P1'),
            ('DISPATCH_DOCS', 'COURIER_DETAILS_RECORDED',   'Courier or logistics details recorded if applicable',                      60, FALSE, FALSE, 'P3'),
            ('DISPATCH_DOCS', 'TRACKING_ID_ENTERED',        'Tracking ID entered in dashboard if applicable',                            70, FALSE, FALSE, 'P3'),
            ('DISPATCH_DOCS', 'POST_DISPATCH_STATUS_UPDATED', 'Dashboard status updated to DISTRIBUTION by dispatch team',               80, TRUE,  FALSE, 'P1'),
            ('DISPATCH_DOCS', 'PHOTOS_AT_DISPATCH',         'Photos taken at dispatch or handover point',                               90, FALSE, TRUE,  'P3'),

            -- ================================================================
            -- STAGE 5: POST-DEPLOYMENT (15-DAY)
            -- ================================================================

            -- Section: FOLLOWUP_CONTACT  (existing max = 20)
            ('FOLLOWUP_CONTACT', 'BENEFICIARY_USING_DEVICE',    'Confirmed beneficiary is actively using the device',                    30, TRUE,  FALSE, 'P1'),
            ('FOLLOWUP_CONTACT', 'USE_CASE_CONFIRMED',          'Primary use case confirmed and recorded',                              40, TRUE,  FALSE, 'P2'),
            ('FOLLOWUP_CONTACT', 'TRAINING_STATUS_CHECKED',     'Training completion status checked with NGO',                          50, FALSE, FALSE, 'P3'),
            ('FOLLOWUP_CONTACT', 'FEEDBACK_DOCUMENTED',         'Initial feedback documented — positive or issues noted',               60, TRUE,  FALSE, 'P2'),
            ('FOLLOWUP_CONTACT', 'IMPACT_NOTE_CAPTURED',        'Initial impact note captured from NGO coordinator',                    70, FALSE, FALSE, 'P3'),

            -- Section: FOLLOWUP_RMS  (existing max = 20)
            ('FOLLOWUP_RMS', 'RMS_HEARTBEAT_CONFIRMED',     'RMS last heartbeat within 15 days confirmed',                              30, TRUE,  FALSE, 'P1'),
            ('FOLLOWUP_RMS', 'ACTIVE_USERS_COUNT_15D',      'Active users count at 15-day mark recorded',                              40, TRUE,  FALSE, 'P2'),
            ('FOLLOWUP_RMS', 'DEVICE_ONLINE_STATUS',        'Device online status confirmed via RMS dashboard',                         50, TRUE,  FALSE, 'P2'),
            ('FOLLOWUP_RMS', 'EARLY_REPAIR_NEEDED',         'Flagged if early repair or technical support is needed',                   60, FALSE, FALSE, 'P3'),
            ('FOLLOWUP_RMS', 'FOLLOWUP_CHECKIN_SCHEDULED',  'Next monthly check-in date scheduled and recorded',                       70, TRUE,  FALSE, 'P2'),

            -- ================================================================
            -- STAGE 6: MONTHLY MONITORING
            -- ================================================================

            -- Section: MONTHLY_USAGE  (existing max = 20)
            ('MONTHLY_USAGE', 'USAGE_HOURS_RECORDED',       'Monthly device usage hours recorded from RMS',                             30, TRUE,  FALSE, 'P2'),
            ('MONTHLY_USAGE', 'STUDENT_COUNT_UPDATED',      'Number of active students or users updated',                              40, FALSE, FALSE, 'P3'),
            ('MONTHLY_USAGE', 'EDUCATIONAL_OUTCOMES_NOTED', 'Educational or professional outcomes noted this month',                   50, FALSE, FALSE, 'P3'),
            ('MONTHLY_USAGE', 'BENEFICIARY_SATISFACTION',   'Beneficiary satisfaction level noted (Good / Neutral / Poor)',             60, FALSE, FALSE, 'P3'),
            ('MONTHLY_USAGE', 'NGO_FEEDBACK_RECORDED',      'NGO monthly feedback recorded',                                           70, TRUE,  FALSE, 'P2'),

            -- Section: MONTHLY_TECH  (existing max = 20)
            ('MONTHLY_TECH', 'RMS_HEARTBEAT_MONTHLY',       'RMS monthly heartbeat verified — device seen this month',                  30, TRUE,  FALSE, 'P1'),
            ('MONTHLY_TECH', 'HARDWARE_FAULT_CHECK',        'Any hardware faults reported this month noted',                            40, TRUE,  FALSE, 'P2'),
            ('MONTHLY_TECH', 'SOFTWARE_UPDATE_STATUS',      'Software and OS update status checked',                                   50, TRUE,  FALSE, 'P2'),
            ('MONTHLY_TECH', 'ANTIVIRUS_STATUS_MONTHLY',    'Antivirus status verified this month',                                    60, TRUE,  FALSE, 'P2'),
            ('MONTHLY_TECH', 'REPAIR_TICKET_REVIEWED',      'Any open repair tickets reviewed and status updated',                      70, TRUE,  FALSE, 'P2'),
            ('MONTHLY_TECH', 'ISSUES_ESCALATED_IF_ANY',     'Issues escalated to appropriate team if any identified',                  80, FALSE, FALSE, 'P3'),
            ('MONTHLY_TECH', 'END_OF_LIFE_ASSESSMENT',      'End-of-life assessment done if device is 12+ months deployed',            90, FALSE, FALSE, 'P3'),
            ('MONTHLY_TECH', 'NEXT_CHECKIN_SCHEDULED',      'Next monthly check-in date scheduled and recorded',                      100, TRUE,  FALSE, 'P2'),
            ('MONTHLY_TECH', 'CHECKIN_REPORT_SAVED',        'Monthly check-in summary saved to dashboard',                            110, TRUE,  FALSE, 'P2')

        ) AS t (section_code, item_code, item_text, display_order, is_mandatory, evidence_required, severity_if_fail)
    )
INSERT INTO sama_ops.checklist_item
    (section_id, item_code, item_text, display_order, is_mandatory, evidence_required, severity_if_fail, is_active)
SELECT
    sm.section_id,
    isd.item_code,
    isd.item_text,
    isd.display_order,
    isd.is_mandatory,
    isd.evidence_required,
    isd.severity_if_fail,
    TRUE
FROM item_seed isd
JOIN section_map sm ON sm.section_code = isd.section_code
ON CONFLICT (section_id, item_code) DO UPDATE
SET
    item_text        = EXCLUDED.item_text,
    display_order    = EXCLUDED.display_order,
    is_mandatory     = EXCLUDED.is_mandatory,
    evidence_required = EXCLUDED.evidence_required,
    severity_if_fail = EXCLUDED.severity_if_fail,
    is_active        = TRUE;

COMMIT;
