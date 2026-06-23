-- Phase 1.12: Add sub-checklist JSON storage for checklist items and responses

BEGIN;

ALTER TABLE sama_ops.checklist_item
    ADD COLUMN IF NOT EXISTS sub_items_json JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE sama_ops.checklist_response
    ADD COLUMN IF NOT EXISTS sub_checks_json JSONB NOT NULL DEFAULT '[]'::jsonb;

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Use compressed air to clear dust from vents, keyboard gaps, and fan blades.",
  "Open the chassis and clean the internal heatsink and fan assembly.",
  "Apply fresh thermal paste to the CPU (and GPU if applicable).",
  "Remove RAM sticks, clean contacts with isopropyl alcohol, reseat firmly.",
  "Remove SSD/HDD, inspect for physical damage, reseat or replace if necessary.",
  "Inspect the battery connector, reseat if loose; flag for replacement if swollen.",
  "Check all internal cable connections (display cable, keyboard ribbon, touchpad ribbon).",
  "Inspect and clean the charging port; remove debris, check for bent pins.",
  "Replace any missing or stripped screws on the chassis.",
  "Close chassis and confirm all panels are flush and secure."
]'::jsonb
WHERE item_code = 'HARDWARE_CLEANING_DONE';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Boot from external media and run a full secure erase on the SSD/HDD.",
  "Verify the wipe completed successfully with no residual partitions.",
  "If HDD, run a disk health check (CrystalDiskInfo or equivalent) and note health status.",
  "If SSD, check SMART data and flag drives below 80% health for replacement.",
  "Create a single primary partition ready for OS installation."
]'::jsonb
WHERE item_code = 'STORAGE_WIPE_DONE';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Device powers on without error messages or unusual POST behavior.",
  "Screen displays a full, clear image with no dead pixels, lines, or backlight bleed.",
  "Screen brightness adjusts correctly through all levels.",
  "No display flickering at any brightness level.",
  "Lid open/close sensor works; screen sleeps when lid is closed."
]'::jsonb
WHERE item_code = 'POWER_TEST_DONE';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Test every key on the keyboard using a keyboard test tool.",
  "Confirm no sticky, stuck, or non-responsive keys.",
  "Touchpad moves cursor smoothly across the full surface.",
  "Left and right touchpad click buttons respond correctly.",
  "Multi-finger gestures work (two-finger scroll, pinch-to-zoom if supported)."
]'::jsonb
WHERE item_code = 'INPUT_TEST_DONE';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Check battery health using the manufacturer tool or BatteryInfoView.",
  "Battery health must be at least 60% of original design capacity.",
  "Device runs on battery power alone without unexpected shutdowns.",
  "Device charges when plugged in; charging indicator activates."
]'::jsonb
WHERE item_code = 'BATTERY_TEST_DONE';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Test each USB-A port; connect a USB device and confirm detection.",
  "Test USB-C port (if present) for data transfer and/or charging.",
  "Test HDMI port; connect to an external display and confirm signal.",
  "Test 3.5mm audio jack for playback and microphone input.",
  "Test SD card slot (if present).",
  "Test Wi-Fi; connect to a network and verify stable signal and internet access.",
  "Test Bluetooth; pair with a device and confirm data transfer."
]'::jsonb
WHERE item_code = 'PORT_TEST_DONE';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Webcam turns on and displays a clear image.",
  "Built-in microphone records audio without distortion.",
  "Built-in speakers produce clear audio at multiple volume levels."
]'::jsonb
WHERE item_code = 'CAMERA_AUDIO_TEST_DONE';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Install RMS agent using the approved installer.",
  "Confirm RMS agent is active and reporting."
]'::jsonb
WHERE item_code = 'RMS_INSTALLED_ACTIVE';

UPDATE sama_ops.checklist_item
SET sub_items_json = '[
  "Record power/display test results in the dashboard.",
  "Record input device test results in the dashboard.",
  "Record battery, ports, and camera/audio results in the dashboard.",
  "Save and verify the dashboard shows all test outcomes."
]'::jsonb
WHERE item_code = 'TEST_RESULTS_DASHBOARD_UPDATED';

COMMIT;
