"""Canonical laptop stage, condition and transition vocabularies."""

from __future__ import annotations

from typing import Dict

STAGE_STATUS_VALUES = {
    "LAPTOP_RECEIVED",
    "REFURBISHMENT_TESTING",
    "QC_CHECK",
    "DISTRIBUTION",
    "POST_DEPLOYMENT_15D",
    "MONTHLY_MONITORING",
    "NOT_WORKING",
}


CONDITION_STATUS_VALUES = {
    "GOOD",
    "BAD",
    "NEEDS_REPAIR",
}


UNKNOWN_VALUE_MARKERS = {"unknown", "n/a", "na", "null"}


STAGE1_DASHBOARD_REQUIRED_FIELDS = [
    ("id", "Serial Number"),
    ("inventory_location", "Inventory Location"),
    ("donor", "Donor Company"),
]


STAGE2_FUNCTIONAL_TEST_ITEM_CODES = [
    "POWER_TEST_DONE",
    "INPUT_TEST_DONE",
    "BATTERY_TEST_DONE",
    "PORT_TEST_DONE",
    "CAMERA_AUDIO_TEST_DONE",
]


STAGE2_RMS_ITEM_CODE = "RMS_INSTALLED_ACTIVE"


STAGE2_DASHBOARD_ITEM_CODE = "TEST_RESULTS_DASHBOARD_UPDATED"


# Explicit transition graph for predictable operational flow.
# Any missing PASS transition falls back to next active stage by display_order.
STAGE_TRANSITIONS: Dict[str, Dict[str, str]] = {
    "LAPTOP_RECEIVED": {"pass": "REFURBISHMENT_TESTING", "fail": "NOT_WORKING", "fast_pass": "QC_CHECK"},
    "REFURBISHMENT_TESTING": {"pass": "QC_CHECK", "fail": "NOT_WORKING"},
    "QC_CHECK": {"pass": "DISTRIBUTION", "fail": "QC_CHECK"},
    "DISTRIBUTION": {"pass": "POST_DEPLOYMENT_15D", "fail": "DISTRIBUTION"},
    "POST_DEPLOYMENT_15D": {"pass": "MONTHLY_MONITORING", "fail": "POST_DEPLOYMENT_15D"},
    "MONTHLY_MONITORING": {"fail": "MONTHLY_MONITORING"},
    "NOT_WORKING": {"fail": "NOT_WORKING"},
}
