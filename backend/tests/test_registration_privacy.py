"""NGO registration list privacy and the server-side contact fill for additional requests."""

import os
import unittest
from unittest import mock

from . import _env  # noqa: F401

from fastapi import FastAPI, Request
from fastapi.testclient import TestClient

from app.api import legacy
from app.core import security as s


def registrations():
    return {
        "status": "success",
        "data": [
            {"Id": "SAM-1", "displayId": "SAM-1", "organizationName": "One", "primaryContactName": "Asha",
             "contactNumber": "900001", "email": "one@example.org", "registrationNumber": "R1", "location": "Pune"},
            {"Id": "SAM-2", "displayId": "SAM-2", "organizationName": "Two", "primaryContactName": "Ravi",
             "contactNumber": "900002", "email": "two@example.org", "registrationNumber": "R2", "location": "Delhi"},
        ],
    }


def bearer(email, role, ngo_id=""):
    return {"Authorization": "Bearer " + s.issue_token({"Email": email, "Role": role, "Ngo Id": ngo_id})}


class RegistrationListTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        app = FastAPI()

        @app.get("/list")
        def listing(request: Request):
            return legacy._scope_registration_list(request, registrations())

        cls.client = TestClient(app)

    def tearDown(self):
        os.environ["AUTH_MODE"] = "monitor"

    def rows(self, headers=None):
        return {r["Id"]: r for r in self.client.get("/list", headers=headers or {}).json()["data"]}

    def test_monitor_mode_returns_everything(self):
        self.assertEqual(self.rows()["SAM-2"]["email"], "two@example.org")

    def test_public_callers_get_names_but_no_contact_details(self):
        os.environ["AUTH_MODE"] = "enforce"
        rows = self.rows()
        self.assertEqual(rows["SAM-2"]["organizationName"], "Two")
        self.assertEqual(rows["SAM-2"]["location"], "Delhi")
        for field in legacy.REGISTRATION_CONTACT_FIELDS:
            self.assertEqual(rows["SAM-2"][field], "")

    def test_ngo_users_see_only_their_own_contact_details(self):
        os.environ["AUTH_MODE"] = "enforce"
        rows = self.rows(bearer("staff@one.org", "ngo", ngo_id="SAM-1"))
        self.assertEqual(rows["SAM-1"]["email"], "one@example.org")
        self.assertEqual(rows["SAM-2"]["email"], "")
        rows = self.rows(bearer("two@example.org", "ngo"))
        self.assertEqual(rows["SAM-2"]["contactNumber"], "900002")

    def test_staff_and_donors_see_everything(self):
        os.environ["AUTH_MODE"] = "enforce"
        for role in ("admin", "ops", "doner", "afe_approver"):
            self.assertEqual(self.rows(bearer("x@example.org", role))["SAM-2"]["email"], "two@example.org")


class AdditionalRequestFillTests(unittest.TestCase):
    def fill(self, payload, organization_id="SAM-2"):
        with mock.patch.object(legacy, "_load_registration_list", return_value=registrations()):
            legacy._fill_contact_details_from_registration(payload, organization_id)
        return payload

    def test_blank_contact_details_are_filled_from_the_stored_ngo(self):
        payload = self.fill({"primaryContactName": "", "contactNumber": "", "email": "", "registrationNumber": ""})
        self.assertEqual(payload["primaryContactName"], "Ravi")
        self.assertEqual(payload["email"], "two@example.org")
        self.assertEqual(payload["registrationNumber"], "R2")

    def test_submitted_values_are_kept(self):
        payload = self.fill({"primaryContactName": "New Contact", "contactNumber": "", "email": "new@example.org"})
        self.assertEqual(payload["primaryContactName"], "New Contact")
        self.assertEqual(payload["email"], "new@example.org")
        self.assertEqual(payload["contactNumber"], "900002")

    def test_unknown_ngo_leaves_payload_unchanged(self):
        payload = self.fill({"email": ""}, organization_id="SAM-404")
        self.assertEqual(payload["email"], "")


if __name__ == "__main__":
    unittest.main()
