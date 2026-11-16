"""Unit tests for password hashing, tokens, access rules and throttling."""

import os
import unittest

from . import _env  # noqa: F401

from fastapi import FastAPI, HTTPException, Request
from fastapi.testclient import TestClient

from app.core import security as s


def bearer(email: str, role: str, ngo_id: str = "") -> dict:
    token = s.issue_token({"Email": email, "Role": role, "Ngo Id": ngo_id})
    return {"Authorization": "Bearer " + token}


class PasswordHashingTests(unittest.TestCase):
    def test_hash_round_trip(self):
        stored = s.hash_password("Secret#123")
        self.assertTrue(s.is_password_hash(stored))
        self.assertEqual(s.verify_password(stored, "Secret#123"), (True, False))
        self.assertEqual(s.verify_password(stored, "wrong"), (False, False))

    def test_legacy_plain_text_matches_and_needs_rehash(self):
        self.assertEqual(s.verify_password("plainpass", "plainpass"), (True, True))
        self.assertEqual(s.verify_password("plainpass", "other"), (False, False))

    def test_malformed_values_never_match(self):
        self.assertEqual(s.verify_password(None, "x"), (False, False))
        self.assertEqual(s.verify_password("pbkdf2_sha256$garbage", "x"), (False, False))


class TokenTests(unittest.TestCase):
    def test_claims_round_trip(self):
        token = s.issue_token({"Email": "Ops@Example.org", "Role": "ops, ngo", "Ngo Id": "N1"})
        claims = s.decode_token(token)
        self.assertEqual(claims["sub"], "ops@example.org")
        self.assertEqual(claims["roles"], ["ops", "ngo"])
        self.assertEqual(claims["ngo_id"], "N1")

    def test_tampered_or_foreign_tokens_are_rejected(self):
        token = s.issue_token({"Email": "a@example.org", "Role": "ops"})
        header, body, signature = token.split(".")
        self.assertIsNone(s.decode_token(f"{header}.{body}.{signature[::-1]}"))
        os.environ["AUTH_TOKEN_SECRET"] = "another-secret"
        try:
            self.assertIsNone(s.decode_token(token))
        finally:
            os.environ["AUTH_TOKEN_SECRET"] = "unit-test-secret"

    def test_expired_tokens_are_rejected(self):
        os.environ["AUTH_TOKEN_TTL_HOURS"] = "-1"
        try:
            token = s.issue_token({"Email": "a@example.org", "Role": "ops"})
        finally:
            os.environ["AUTH_TOKEN_TTL_HOURS"] = "720"
        self.assertIsNone(s.decode_token(token))


class AccessRuleTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        app = FastAPI()

        @app.post("/op/{name}")
        def op(name: str, request: Request, owner: str = ""):
            principal = s.authorize(request, name, owner_ngo_id=owner or None)
            return {"who": principal.email if principal else None}

        cls.client = TestClient(app)

    def tearDown(self):
        os.environ["AUTH_MODE"] = "monitor"

    def status(self, operation, headers=None, owner=""):
        return self.client.post(f"/op/{operation}", params={"owner": owner}, headers=headers or {}).status_code

    def test_monitor_mode_never_blocks(self):
        os.environ["AUTH_MODE"] = "monitor"
        self.assertEqual(self.status("deleteNgo"), 200)
        self.assertEqual(self.status("deleteNgo", bearer("n@example.org", "ngo")), 200)

    def test_enforce_mode(self):
        os.environ["AUTH_MODE"] = "enforce"
        response = self.client.post("/op/deleteNgo")
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.headers.get("x-sama-auth"), "required")
        self.assertEqual(self.status("deleteNgo", bearer("n@example.org", "ngo")), 403)
        self.assertEqual(self.status("deleteNgo", bearer("viewer@example.org", "admin")), 403)
        self.assertEqual(self.status("deleteNgo", bearer("editor@example.org", "admin")), 200)
        self.assertEqual(self.status("editUser", bearer("n@example.org", "ngo")), 200)
        self.assertEqual(self.status("editUser", bearer("viewer@example.org", "admin")), 403)
        self.assertEqual(self.status("bulkupload", bearer("o@example.org", "ops")), 200)
        self.assertEqual(self.status("bulkupload", bearer("n@example.org", "ngo")), 403)
        self.assertEqual(self.status("getRegistration", bearer("viewer@example.org", "admin")), 200)

    def test_reads_of_personal_data_need_a_session(self):
        os.environ["AUTH_MODE"] = "enforce"
        self.assertEqual(self.status("read:getUserData"), 401)
        self.assertEqual(self.status("read:getUserData", bearer("n@example.org", "ngo")), 200)
        self.assertEqual(self.status("read:getUserData", bearer("d@example.org", "doner")), 200)
        self.assertEqual(self.status("read:getUserData", bearer("s@example.org", "school")), 403)
        self.assertEqual(self.status("read:getLaptopData", bearer("s@example.org", "school")), 200)
        self.assertEqual(self.status("read:audit", bearer("n@example.org", "ngo")), 403)

    def test_laptop_and_ngo_writes_are_staff_only(self):
        os.environ["AUTH_MODE"] = "enforce"
        self.assertEqual(self.status("laptopLabeling"), 401)
        self.assertEqual(self.status("laptopLabeling", bearer("n@example.org", "ngo")), 403)
        self.assertEqual(self.status("laptopLabeling", bearer("o@example.org", "ops")), 200)
        self.assertEqual(self.status("NGO:update", bearer("a@example.org", "afe_approver")), 200)
        self.assertEqual(self.status("NGO:update", bearer("viewer@example.org", "admin")), 403)
        self.assertEqual(self.status("NGOTimeline", bearer("editor@example.org", "admin")), 200)

    def test_ngo_users_are_limited_to_their_own_ngo(self):
        os.environ["AUTH_MODE"] = "enforce"
        own = bearer("n@example.org", "ngo", ngo_id="SAM-1")
        self.assertEqual(self.status("editUser", own, owner="SAM-1"), 200)
        self.assertEqual(self.status("editUser", own, owner="sam-1"), 200)
        self.assertEqual(self.status("editUser", own, owner="SAM-2"), 403)
        self.assertEqual(self.status("Monthly", own, owner="SAM-2"), 403)
        self.assertEqual(self.status("editUser", bearer("o@example.org", "ops"), owner="SAM-2"), 200)

    def test_roles_match_exactly(self):
        os.environ["AUTH_MODE"] = "enforce"
        self.assertEqual(self.status("deleteNgo", bearer("editor@example.org", "superadmin")), 403)
        self.assertEqual(self.status("deleteNgo", bearer("editor@example.org", "ops, admin")), 200)

    def test_unlisted_operations_stay_public(self):
        os.environ["AUTH_MODE"] = "enforce"
        self.assertEqual(self.status("getLaptopData"), 200)
        self.assertEqual(self.status("login"), 200)

    def test_off_mode_disables_checks(self):
        os.environ["AUTH_MODE"] = "off"
        self.assertEqual(self.status("deleteNgo"), 200)


class SettingsTests(unittest.TestCase):
    def test_enforce_mode_requires_a_signing_secret(self):
        os.environ["AUTH_MODE"] = "enforce"
        os.environ["AUTH_TOKEN_SECRET"] = ""
        try:
            with self.assertRaises(RuntimeError):
                s.validate_settings()
        finally:
            os.environ["AUTH_MODE"] = "monitor"
            os.environ["AUTH_TOKEN_SECRET"] = "unit-test-secret"
        s.validate_settings()


class LoginThrottleTests(unittest.TestCase):
    def test_checking_does_not_create_entries(self):
        s.check_login_allowed("fresh@example.org", "9.9.9.9")
        self.assertNotIn("fresh@example.org|9.9.9.9", s._login_failures)

    def test_lockout_after_repeated_failures(self):
        for _ in range(10):
            s.record_login_failure("t@example.org", "1.2.3.4")
        with self.assertRaises(HTTPException) as ctx:
            s.check_login_allowed("T@example.org", "1.2.3.4")
        self.assertEqual(ctx.exception.status_code, 429)
        s.check_login_allowed("t@example.org", "5.6.7.8")
        s.clear_login_failures("t@example.org", "1.2.3.4")
        s.check_login_allowed("t@example.org", "1.2.3.4")


if __name__ == "__main__":
    unittest.main()
