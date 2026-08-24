-- Phase 1.14: Sub-checklist items (sub_items_json) for Stages 2 software, 3, 4, 5, and 6
-- Source: Laptop_Refurbishment_Checklists_Detailed.md (official SOP document)
-- Follows the same pattern as phase1_012 which covered Stage 2 functional/hardware testing.
-- Safe to re-run — uses WHERE item_code = ... so duplicate runs are idempotent.

BEGIN;

-- ============================================================
-- CORRECTION: Stage 2 WINDOWS_ACTIVATION_REFURB
-- The official SOP states activation happens at Stage 3 QC, not Stage 2.
-- Update the item text and sub-items to reflect the correct process.
-- ============================================================

UPDATE sama_ops.checklist_item
SET
    item_text = 'Confirm OS is NOT yet activated — licence key will be applied at Stage 3 QC',
    is_mandatory = TRUE,
    sub_items_json = '[
      "Open Settings > System > Activation.",
      "Confirm the status shows Windows is not activated or is in a grace period.",
      "Do NOT apply the licence key here — activation is performed by the QC technician in Stage 3.",
      "Record the OS edition and version in the dashboard (e.g. Windows 10 Pro 22H2)."
    ]'::jsonb
WHERE item_code = 'WINDOWS_ACTIVATION_REFURB';

-- ============================================================
-- STAGE 2: Software Setup (new items from phase1_013 — no sub-items yet)
-- Source: Stage 2 CHECKLIST - SOFTWARE SETUP
-- ============================================================

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Install the operating system from the approved clean image — record OS version and edition (e.g. Windows 10 Pro 22H2).",
  "Complete initial OS setup: set region, language, and keyboard layout.",
  "Set system time and date correctly.",
  "Verify the device boots cleanly to the desktop with no setup errors.",
  "Confirm no personal data, user accounts, or browser history from previous owners remains."
]'::jsonb
WHERE item_code = 'OS_FRESH_INSTALL_OR_RESET';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Open Settings > Windows Update and click Check for updates.",
  "Install all available critical and security updates.",
  "Restart the device and confirm no pending updates remain.",
  "Verify the last updated date is current."
]'::jsonb
WHERE item_code = 'OS_UPDATES_APPLIED';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Install all hardware drivers: chipset, display, audio, Wi-Fi, Bluetooth, touchpad, webcam.",
  "Open Device Manager and confirm zero unknown or error devices remain.",
  "Verify each driver version is current and matches the device specification."
]'::jsonb
WHERE item_code = 'DRIVERS_UPDATED';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Install the approved antivirus application from the official source.",
  "Run a full system scan and confirm no threats are detected.",
  "Confirm real-time protection is enabled and running.",
  "Update virus definitions to the latest available."
]'::jsonb
WHERE item_code = 'ANTIVIRUS_INSTALLED';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Uninstall all manufacturer-bundled trial software, toolbars, and OEM utilities not on the approved list.",
  "Remove any pre-installed apps not required for device operation.",
  "Verify OS is clean-booting with no unwanted startup items.",
  "Confirm only approved applications from the standard software list remain on the device."
]'::jsonb
WHERE item_code = 'BLOATWARE_REMOVED';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Open Computer Management > Local Users and Groups > Users.",
  "Set a strong password on the local Administrator account following the programme password policy.",
  "Confirm the beneficiary will log in as a standard (non-admin) user account.",
  "Disable or rename the default Administrator account if policy requires."
]'::jsonb
WHERE item_code = 'LOCAL_ADMIN_PASSWORD_SET';

-- ============================================================
-- STAGE 3: QC CHECK
-- Source: Stage 3 all checklists
-- ============================================================

-- Section: QC_REVERIFY

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Visually inspect the device chassis — confirm no new damage since Stage 2.",
  "Confirm the barcode label is intact and scannable.",
  "Power on the device — confirm clean boot, no BSOD or POST errors, startup under 90 seconds.",
  "Re-run keyboard test — confirm every key registers, no stuck or ghost keys.",
  "Re-test touchpad — smooth movement, left/right click, two-finger scroll.",
  "Re-test all USB ports — connect a device and confirm detection on each port.",
  "Re-test HDMI output — connect to an external display and confirm signal.",
  "Re-test Wi-Fi — connect to a network, run a speed test, confirm stable connection.",
  "Re-test Bluetooth — pair a device and confirm connection.",
  "Re-test webcam — confirm clear image in camera app.",
  "Re-test audio — speakers at multiple volumes, microphone recording playback.",
  "Check battery percentage and confirm device charges correctly.",
  "Verify no dead pixels, display flickering, or backlight bleed.",
  "Run a 5-minute performance test — no throttling, freezes, or crashes.",
  "Conduct a 10-15 minute live usage session: browser, document, short video — no lag or errors.",
  "Open Task Manager — confirm CPU and RAM usage within normal range at idle.",
  "Check Windows Event Viewer — no critical or error-level events in the last 24 hours.",
  "Confirm OS version and edition match the approved build specification.",
  "Open Device Manager — confirm zero unknown or error devices.",
  "Confirm no unapproved software is installed and no personal data from previous owners remains."
]'::jsonb
WHERE item_code = 'QC_ALL_ITEMS_COMPLETE';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Record the overall QC outcome (PASS or FAIL) in the dashboard.",
  "Enter the QC technician full name and date of completion.",
  "If outcome is FAIL: document all failure reasons and mark device as QC Failed - Return to Stage 2.",
  "If outcome is PASS: mark device as QC Approved and confirm it is cleared to proceed to Stage 4."
]'::jsonb
WHERE item_code = 'QC_OUTCOME_RECORDED';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Power on the device and observe the boot process for errors or unusual delays.",
  "Confirm there are no BSOD, POST errors, or unusual startup messages.",
  "Verify startup time from power-on to desktop is under 90 seconds.",
  "Wake the device from sleep and confirm it resumes correctly without errors."
]'::jsonb
WHERE item_code = 'QC_POWER_VERIFY';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Re-run a keyboard test tool and confirm every key registers correctly.",
  "Confirm no stuck, missing, bouncing, or ghost key presses.",
  "Test Fn key combinations: brightness, volume, and any programme-specific shortcuts.",
  "Confirm the spacebar, backspace, and Enter keys have a normal tactile response."
]'::jsonb
WHERE item_code = 'QC_KEYBOARD_VERIFY';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Verify no dead pixels or display anomalies are visible on the screen.",
  "Check for backlight bleed at maximum brightness in a dimmed environment.",
  "Confirm screen brightness adjusts correctly through all levels.",
  "Confirm no display flickering at any brightness level.",
  "Confirm the lid open/close sensor works — screen sleeps when lid is closed."
]'::jsonb
WHERE item_code = 'QC_DISPLAY_VERIFY';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Play audio through the built-in speakers at low, medium, and high volume.",
  "Test the built-in microphone by recording a short clip and playing it back.",
  "Plug in headphones and confirm audio output switches correctly.",
  "Confirm no distortion, crackling, or static at any volume level."
]'::jsonb
WHERE item_code = 'QC_AUDIO_VERIFY';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Re-test each USB-A port by connecting a USB device and confirming detection.",
  "Re-test HDMI output by connecting to an external display and confirming signal.",
  "Test the 3.5mm audio jack for playback and microphone input.",
  "Test the charging port — confirm the device charges when plugged in.",
  "Test USB-C port for data transfer or charging if present."
]'::jsonb
WHERE item_code = 'QC_PORT_VERIFY';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Re-test Wi-Fi — connect to a network and verify stable internet access.",
  "Run a browser speed test and confirm acceptable throughput.",
  "Confirm no intermittent drops or signal instability during the test.",
  "Re-test Bluetooth — pair a device and confirm connection and disconnect."
]'::jsonb
WHERE item_code = 'QC_WIFI_VERIFY';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Check battery health percentage using BatteryInfoView or Windows battery report.",
  "Confirm battery health is at or above the minimum acceptable threshold (60%).",
  "Unplug the charger and confirm the device runs on battery power without unexpected shutdown.",
  "Confirm the battery percentage is reported accurately in the taskbar."
]'::jsonb
WHERE item_code = 'QC_BATTERY_VERIFY';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Open the camera application and confirm the webcam activates and displays a clear image.",
  "Verify image quality — no pixelation, colour distortion, or blurring.",
  "Confirm the camera privacy indicator (LED) activates when the camera is in use."
]'::jsonb
WHERE item_code = 'QC_CAMERA_VERIFY';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Open Task Manager — confirm CPU, RAM, and storage usage are within normal range at idle.",
  "Run a 5-minute basic performance or stress test — confirm no throttling, shutdowns, or errors.",
  "Conduct a 10-15 minute live usage session: open a browser, navigate to 3+ websites, open a document, play a short video.",
  "Confirm no lag, freezes, or crashes occur during the live usage session.",
  "Check Windows Event Viewer — confirm no critical or error-level events in the last 24 hours.",
  "Confirm the fan spins up under load and cooling is adequate — no excessive heat."
]'::jsonb
WHERE item_code = 'QC_PERFORMANCE_VERIFY';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Re-test touchpad — confirm smooth cursor movement across the full surface.",
  "Test left and right click buttons — both respond correctly.",
  "Test multi-finger gestures: two-finger scroll and pinch-to-zoom if supported."
]'::jsonb
WHERE item_code = 'QC_TOUCHPAD_VERIFY';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Locate the serial number on the physical device (underside label, BIOS, or System Information).",
  "Confirm the physical serial number exactly matches the dashboard record.",
  "Scan the barcode label and confirm it pulls up the correct device record in the dashboard."
]'::jsonb
WHERE item_code = 'QC_SERIAL_MATCH';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Inspect the device chassis under good lighting — confirm no new damage since Stage 2.",
  "Confirm the cosmetic grade recorded in the dashboard (A/B/C) accurately reflects the device condition.",
  "Note any cosmetic issues visible at handover that should be disclosed to the beneficiary.",
  "Confirm the barcode label is firmly attached, clean, and readable."
]'::jsonb
WHERE item_code = 'QC_COSMETIC_FINAL';

-- Section: QC_SECURITY

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Apply the Windows licence key using the approved activation tool.",
  "Record the last 5 characters of the licence key in the dashboard for tracking.",
  "Open Settings > System > Activation and confirm the status shows Windows is activated.",
  "Confirm the Windows edition matches the approved build specification."
]'::jsonb
WHERE item_code = 'WINDOWS_ACTIVATED';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Restart the device and enter BIOS/UEFI setup using the appropriate key.",
  "Set the BIOS/UEFI supervisor password using the standard approved programme password.",
  "Confirm boot order is set to the internal drive first.",
  "Disable boot from external USB or optical drive if policy requires.",
  "Save BIOS settings and reboot — confirm the device boots normally to Windows."
]'::jsonb
WHERE item_code = 'BIOS_PASSWORD_SET';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Log into the RMS management console and search for the device by serial number.",
  "Confirm the device status shows as active.",
  "Confirm the last heartbeat timestamp is within the last 24 hours.",
  "Confirm the device appears correctly labelled in the console (correct serial, no duplicate)."
]'::jsonb
WHERE item_code = 'RMS_ACTIVE_IN_QC';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Open Windows Security > Firewall and network protection.",
  "Confirm Firewall is ON for Domain, Private, and Public network profiles.",
  "Confirm no inbound rules exist that create unnecessary open ports."
]'::jsonb
WHERE item_code = 'FIREWALL_ENABLED';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Open Windows Security > Virus and threat protection.",
  "Confirm real-time protection is ON.",
  "Confirm virus definitions were updated within the last 7 days.",
  "Confirm no active threats or quarantined items require action."
]'::jsonb
WHERE item_code = 'ANTIVIRUS_ACTIVE_QC';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Confirm all Windows/OS updates have been applied — open Settings > Windows Update.",
  "Confirm the status shows you are up to date.",
  "Confirm there are no pending critical or security updates.",
  "Confirm Device Manager shows zero unknown or error devices after all updates."
]'::jsonb
WHERE item_code = 'OS_UPDATES_CURRENT_QC';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Open Computer Management > Local Users and Groups > Users.",
  "Confirm the Guest account is disabled.",
  "Confirm no unapproved or unrecognised user accounts exist.",
  "Confirm no personal data, browser history, or files from previous owners remain.",
  "Verify the OS is clean-booting with no unwanted startup items."
]'::jsonb
WHERE item_code = 'GUEST_ACCOUNT_DISABLED';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Confirm all QC checklist items above are marked PASS or NA.",
  "Enter the QC technician full name as the verifier for this run.",
  "Record the date and time of QC completion in the dashboard.",
  "Sign and file any physical QC sign-off sheet if required by the programme."
]'::jsonb
WHERE item_code = 'QC_SIGN_OFF';

-- ============================================================
-- STAGE 4: DISTRIBUTION
-- Source: Stage 4 all checklists
-- ============================================================

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Confirm device status is QC Approved in the dashboard before packing.",
  "Scan the barcode to bring up the device record and confirm it matches the physical device.",
  "Confirm the correct NGO/partner name is associated with this dispatch batch.",
  "Check that any special requirements from the NGO partner have been met (e.g. OS language, accessibility software)."
]'::jsonb
WHERE item_code = 'STATUS_IS_QC_CHECK';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Confirm the NGO/partner name and contact person are filled in the dashboard.",
  "Confirm beneficiary name, contact number, and delivery address are complete.",
  "Confirm the dispatch date is set and communicated to the NGO coordinator.",
  "Confirm Device ID, serial number, and all required dispatch record fields are filled.",
  "Wrap the device in bubble wrap or anti-static packaging.",
  "Include all accessories (charger, bag if applicable) — record what is included in the dashboard.",
  "Seal the box and label it with: Device ID, NGO name, destination address, and dispatch date.",
  "If dispatching multiple devices, number each package (e.g. Box 1 of 5).",
  "Notify the NGO partner the device has been dispatched — include Device ID, estimated delivery date, and support contact.",
  "Remind the NGO of the 15-day post-deployment check-in requirement (Stage 5)."
]'::jsonb
WHERE item_code = 'DISPATCH_FIELDS_COMPLETE';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "If dispatched by courier: attach proof of collection or tracking confirmation to the device record and record the tracking number.",
  "If direct handover: obtain a signed acknowledgement from the NGO representative and upload to the dashboard.",
  "Send a dispatch confirmation message to the NGO partner — include Device ID, estimated delivery date, and support contact details.",
  "Remind the NGO of the 15-day post-deployment check-in requirement (Stage 5)."
]'::jsonb
WHERE item_code = 'ACK_OR_TRACKING_CONFIRMED';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Verify the beneficiary full name matches their submitted ID proof.",
  "Confirm the delivery address is complete — include PIN code, landmark, or area if needed.",
  "Confirm the beneficiary or NGO contact phone number is active and reachable.",
  "Check that any special requirements (e.g. accessibility software, specific language) have been confirmed."
]'::jsonb
WHERE item_code = 'BENEFICIARY_DETAILS_CONFIRMED';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Contact the NGO coordinator to confirm dispatch readiness and the expected delivery date.",
  "Provide the NGO with the Device ID and how to reference it when reporting issues.",
  "Share the post-deployment follow-up schedule and remind them of the Stage 5 check-in."
]'::jsonb
WHERE item_code = 'NGO_CONTACT_CONFIRMED';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Set the confirmed dispatch date in the dashboard.",
  "Communicate the dispatch date and estimated delivery time to the NGO coordinator.",
  "If using a courier, book the pickup slot and record the booking reference."
]'::jsonb
WHERE item_code = 'DISPATCH_DATE_SCHEDULED';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Wrap the device in bubble wrap or anti-static packaging.",
  "Include all accessories (charger, bag if applicable) and record what is included.",
  "Seal the box and label it with: Device ID, NGO name, destination address, and dispatch date.",
  "If dispatching multiple devices, number each package (e.g. Box 1 of 5).",
  "Take a photograph of the packaged device before handover or collection."
]'::jsonb
WHERE item_code = 'PACKAGING_COMPLETE';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Confirm the power charger or adapter is packed.",
  "Confirm the laptop bag is included if it is part of the programme kit.",
  "List all accessories included in the dashboard dispatch record (charger, bag, other — or None).",
  "Confirm each accessory is accounted for against the approved kit list for this batch."
]'::jsonb
WHERE item_code = 'ACCESSORIES_PACKED';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Generate the dispatch note or handover document from the dashboard.",
  "Verify it includes: Device ID, serial number, NGO name, beneficiary name, and dispatch date.",
  "Save a digital copy to the dashboard and print one copy for dispatch records.",
  "Record the name of the staff member carrying out the dispatch."
]'::jsonb
WHERE item_code = 'DELIVERY_NOTE_GENERATED';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Request a government-issued photo ID from the beneficiary or NGO representative.",
  "Confirm the name on the ID exactly matches the dashboard beneficiary record.",
  "Photograph the ID and upload to the dashboard if required by programme policy."
]'::jsonb
WHERE item_code = 'BENEFICIARY_ID_VERIFIED';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Have the NGO coordinator sign the acceptance form acknowledging receipt of the device.",
  "Record the name and designation of the person accepting on behalf of the NGO.",
  "Upload the signed acceptance form to the dashboard as evidence."
]'::jsonb
WHERE item_code = 'NGO_ACCEPTANCE_OBTAINED';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Have the beneficiary or NGO representative sign the handover form.",
  "The dispatch coordinator countersigns as witness.",
  "Note the date and time of handover on the form.",
  "Upload the signed handover form to the dashboard."
]'::jsonb
WHERE item_code = 'HANDOVER_FORM_SIGNED';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Take a photograph of the beneficiary or NGO representative at the point of handover.",
  "Take a photograph showing the device and packaging condition at the time of handover.",
  "Upload all dispatch photographs to the dashboard as evidence."
]'::jsonb
WHERE item_code = 'PHOTOS_AT_DISPATCH';

-- ============================================================
-- STAGE 5: POST-DEPLOYMENT (15-DAY FOLLOW-UP)
-- Source: Stage 5 all checklists
-- ============================================================

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Contact the NGO partner proactively by phone or email within 10 days of dispatch — do not wait for them to reach out.",
  "Confirm the device was received and the packaging was undamaged.",
  "Confirm the device powers on and is usable.",
  "Ask specifically about: screen display, keyboard, touchpad, Wi-Fi, battery life, and overall speed.",
  "Ask whether RMS has been accessed or if there are any questions about remote management.",
  "Record the name and designation of the NGO contact person spoken to."
]'::jsonb
WHERE item_code = 'NGO_CONTACT_COMPLETED';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Ask the NGO coordinator: Is the device being used for its intended purpose?",
  "Ask for a satisfaction rating: Good, Neutral, or Poor.",
  "Note any specific praise or concern mentioned by the NGO partner or beneficiary.",
  "Save the satisfaction rating and notes in the dashboard."
]'::jsonb
WHERE item_code = 'SATISFACTION_NOTE_CAPTURED';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Log into the RMS console and confirm the device is showing as online.",
  "Confirm the last-seen heartbeat timestamp is within the last 48 hours.",
  "Run a remote health check if available — confirm no alerts are flagged.",
  "If device is offline or not reporting: contact the NGO partner to investigate immediately."
]'::jsonb
WHERE item_code = 'RMS_STATUS_VERIFIED';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Ask the NGO if any hardware or software issue has occurred since dispatch.",
  "If an issue is reported: log it with Device ID, issue description, date reported, NGO contact name, and severity level (P1/P2/P3).",
  "For P1 and P2 issues: initiate a resolution or collection process within 5 working days.",
  "For P3 issues: log for review at the next monthly check-in (Stage 6).",
  "If no issues are reported: record No issues reported with the date in the dashboard."
]'::jsonb
WHERE item_code = 'EARLY_ISSUE_LOGGED';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Ask the NGO coordinator to confirm the beneficiary is actively using the device.",
  "Ask approximately how many days per week the device is being used.",
  "Confirm the device is not stored or sitting unused since dispatch."
]'::jsonb
WHERE item_code = 'BENEFICIARY_USING_DEVICE';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Ask the NGO to confirm the main purpose for which the device is being used.",
  "Update the primary use case field in the dashboard: Education (student), Education (teacher), Administrative, Vocational training, or Other.",
  "Note if the use case has changed from what was originally recorded."
]'::jsonb
WHERE item_code = 'USE_CASE_CONFIRMED';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Record the initial impact data: number of active users and primary use case.",
  "Note any feedback or suggestions from the NGO partner.",
  "Ask for any early impact stories or notable outcomes from the beneficiary.",
  "Save the complete feedback note in the dashboard checklist response."
]'::jsonb
WHERE item_code = 'FEEDBACK_DOCUMENTED';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Confirm the RMS last-seen heartbeat timestamp is within the last 48 hours.",
  "Note the exact last-seen timestamp for the record.",
  "If the device has not been seen in RMS within 48 hours: contact the NGO partner to investigate and log the reason."
]'::jsonb
WHERE item_code = 'RMS_HEARTBEAT_CONFIRMED';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Ask the NGO coordinator: how many people or students have used the device since dispatch?",
  "Record the initial active user count in the dashboard.",
  "Confirm the count is greater than zero — flag for follow-up if device appears unused."
]'::jsonb
WHERE item_code = 'ACTIVE_USERS_COUNT_15D';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Confirm the device is showing as online in the RMS console.",
  "If device has been offline for more than 48 hours: contact the NGO partner to investigate.",
  "Record the online status result and any explanation in the dashboard notes."
]'::jsonb
WHERE item_code = 'DEVICE_ONLINE_STATUS';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Schedule the first monthly check-in for 30 days after the dispatch date.",
  "Communicate the scheduled check-in date to the NGO coordinator.",
  "Set a reminder or calendar entry to ensure the Stage 6 check-in occurs on time.",
  "Provide the NGO with the programme coordinator contact details for any urgent issues before the next check-in."
]'::jsonb
WHERE item_code = 'FOLLOWUP_CHECKIN_SCHEDULED';

-- ============================================================
-- STAGE 6: MONTHLY MONITORING
-- Source: Stage 6 all checklists
-- ============================================================

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Record the number of active users on the device this month from RMS or NGO contact.",
  "Compare with the previous month count and note any significant change.",
  "Record total cumulative users in the dashboard.",
  "Flag if the count drops to zero — device may be unused, offline, or decommissioned."
]'::jsonb
WHERE item_code = 'ACTIVE_USERS_CAPTURED';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Ask the NGO to confirm the current primary use case for the device.",
  "Update the use case field if changed: Education (student), Education (teacher), Administrative, Vocational training, or Other.",
  "Note any change in use case compared to the previous month.",
  "Record total cumulative sessions or use cases in the dashboard for this device."
]'::jsonb
WHERE item_code = 'PRIMARY_USE_CASE_UPDATED';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Log into the RMS console and check the device online status and last-seen timestamp.",
  "Review any RMS alerts or flags raised since the last check-in.",
  "Confirm OS and software are up to date — push updates remotely if possible.",
  "Check battery health trend — flag if deteriorating significantly month on month.",
  "Run a remote health diagnostic if available — record results.",
  "If device has been offline for more than 7 days: investigate and log the reason."
]'::jsonb
WHERE item_code = 'MONTHLY_TECH_HEALTH_REVIEWED';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Review all open P3 issues from Stage 5 or prior months — update status for each.",
  "Log any new issues reported by the NGO partner this month with severity level.",
  "For any P1 or P2 issue: initiate resolution within 5 working days.",
  "If a device requires physical collection for repair: arrange logistics and update the dashboard.",
  "Confirm resolution of any issues that were in progress from the previous month."
]'::jsonb
WHERE item_code = 'MONTHLY_ISSUES_REVIEWED';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Ask the NGO coordinator to estimate the number of sessions or hours used per week this month.",
  "Record the weekly usage hours in the monthly check-in form.",
  "Note any significant change compared to the previous month.",
  "Flag if usage hours are reported as zero — device may be unused or offline."
]'::jsonb
WHERE item_code = 'USAGE_HOURS_RECORDED';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Complete the monthly check-in call or email with the NGO partner.",
  "Confirm all dispatched devices are still in use at the organisation.",
  "Ask whether any devices have been lost, stolen, or decommissioned — update dashboard immediately if yes.",
  "Ask whether any accessories (chargers, bags) need to be replaced.",
  "Ask for any impact stories, testimonials, or case studies — note in dashboard.",
  "Confirm the NGO partner primary contact person is still the same — update if changed."
]'::jsonb
WHERE item_code = 'NGO_FEEDBACK_RECORDED';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Log into the RMS console and confirm the device has had a heartbeat within the last 30 days.",
  "Note the exact last-seen date and time in the check-in form.",
  "If there has been no heartbeat in 30 or more days: flag as a priority action and contact the NGO partner immediately.",
  "Escalate to the Programme Manager if the device remains unreachable after contact attempt."
]'::jsonb
WHERE item_code = 'RMS_HEARTBEAT_MONTHLY';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Ask the NGO if any hardware fault has been reported since the last check-in.",
  "Review RMS for any hardware alerts or error events this month.",
  "If a fault is reported: log it with Device ID, description, severity (P1/P2/P3), and date.",
  "For P1 or P2 hardware faults: initiate resolution within 5 working days."
]'::jsonb
WHERE item_code = 'HARDWARE_FAULT_CHECK';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Confirm via RMS or NGO contact that OS and software updates were applied this month.",
  "Confirm antivirus definitions are current — updated within the last 7 days.",
  "If updates are overdue: coordinate with the NGO to apply them remotely or on the next visit.",
  "Confirm Device Manager shows no new unknown or error devices."
]'::jsonb
WHERE item_code = 'SOFTWARE_UPDATE_STATUS';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Confirm via RMS or remote check that antivirus is still installed and active.",
  "Verify real-time protection is enabled.",
  "Verify no threats were detected or are quarantined this month.",
  "If threats are found: log as P2 issue and escalate for remediation."
]'::jsonb
WHERE item_code = 'ANTIVIRUS_STATUS_MONTHLY';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "List all open repair or support tickets for this device.",
  "Update the status of each open ticket based on the current situation.",
  "Close tickets that have been fully resolved this month.",
  "Escalate any tickets that have been open for 30 or more days to the Programme Manager."
]'::jsonb
WHERE item_code = 'REPAIR_TICKET_REVIEWED';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Confirm the number of months the device has been deployed.",
  "For devices deployed over 12 months: assess battery health (must be at or above 40%), hardware condition, and whether the OS is still supported.",
  "If device does not meet the minimum standard: initiate collection and assess for re-refurbishment or recycling.",
  "Record the end-of-life decision in the dashboard: Re-refurbish, Recycle, or Extended use.",
  "Update the total useful life of the device in months in the dashboard."
]'::jsonb
WHERE item_code = 'END_OF_LIFE_ASSESSMENT';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Set the next monthly check-in date to within the first 10 days of the following calendar month.",
  "Communicate the scheduled check-in date to the NGO coordinator.",
  "Confirm the NGO partner has the programme coordinator contact details for urgent issues between check-ins.",
  "If the NGO partner has been unresponsive for 2 consecutive months: escalate to the Programme Manager."
]'::jsonb
WHERE item_code = 'NEXT_CHECKIN_SCHEDULED';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Ensure all required monthly check-in fields are filled in the dashboard.",
  "Confirm usage data, RMS status, issue updates, and feedback notes are all saved.",
  "Record the name of the staff member completing this monthly update.",
  "Confirm the check-in date is recorded as within the first 10 days of the month."
]'::jsonb
WHERE item_code = 'CHECKIN_REPORT_SAVED';

COMMIT;
