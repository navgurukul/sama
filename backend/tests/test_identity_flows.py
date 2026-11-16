"""End-to-end identity flows against a disposable PostgreSQL database.

Set SAMA_TEST_DATABASE_URL to a throwaway database to run these; they create
and drop the sama_test schema. They are skipped otherwise.
"""

import os
import re
import unittest

from . import _env

if _env.TEST_DATABASE_URL:
    import psycopg
    from fastapi.testclient import TestClient

    from app.domain.identity import service as identity
    from app.main import app


def sql(statement: str):
    with psycopg.connect(_env.TEST_DATABASE_URL, autocommit=True) as conn:
        cur = conn.execute(statement)
        return cur.fetchall() if cur.description else None


@unittest.skipUnless(_env.TEST_DATABASE_URL, "SAMA_TEST_DATABASE_URL is not set")
class IdentityFlowTests(unittest.TestCase):
    def setUp(self):
        sql(
            """
            DROP SCHEMA IF EXISTS sama_test CASCADE;
            CREATE SCHEMA sama_test;
            CREATE TABLE sama_test.user_profile_registration (name text, email text, password text, status text, role text, reason text);
            CREATE TABLE sama_test.user_profile_userrole (name text, email text, password text, role text, ngo_id text, type text, doner text);
            CREATE TABLE sama_test.schools (id serial, school_id text, udise text, name text, partner_name text, ngo_id text);
            CREATE TABLE sama_test.ngo_requests (id serial primary key, donor text);
            CREATE TABLE sama_test.userdetails (id text primary key, ngo text, name text);
            INSERT INTO sama_test.userdetails VALUES ('B-1', 'SAM-2', 'Beneficiary of another NGO');
            INSERT INTO sama_test.user_profile_userrole VALUES
                ('Ops One', 'ops1@example.org', 'plainpw1', 'ops', '', '', ''),
                ('Ops One', 'ops1@example.org', 'plainpw1', 'admin', '', '', ''),
                ('Editor', 'editor@example.org', 'editorpw', 'admin', '', '', ''),
                ('NGO One', 'ngo1@example.org', 'ngopw', 'ngo', 'SAM-1', '1 to one', '');
            INSERT INTO sama_test.user_profile_registration VALUES ('Reg User', 'reg@example.org', 'regpw', 'approved', 'ngo', '');
            INSERT INTO sama_test.schools (school_id, udise, name, partner_name, ngo_id) VALUES ('SCH-1', 'UD-1', 'School 1', 'Amazon', 'N9');
            INSERT INTO sama_test.ngo_requests (donor) VALUES ('d');
            """
        )
        identity._password_reset_table_ready = False
        self.sent = []
        self._original_send = identity._send_email_common
        identity._send_email_common = lambda **kw: self.sent.append(kw)
        self.client = TestClient(app)

    def tearDown(self):
        identity._send_email_common = self._original_send
        os.environ["AUTH_MODE"] = "monitor"
        sql("DROP SCHEMA IF EXISTS sama_test CASCADE")

    def login(self, email, password):
        return self.client.post("/user-exec", json={"type": "login", "email": email, "password": password})

    def test_user_lists_never_contain_passwords(self):
        for query in ("", "?type=getRegistration", "?type=getUsers"):
            rows = self.client.get("/user-exec" + query).json()
            self.assertTrue(rows)
            self.assertTrue(all("Password" not in row for row in rows))

    def test_legacy_login_keeps_response_shape_and_upgrades_hash(self):
        response = self.login("OPS1@example.org", "plainpw1")
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(set(body["user"]), {"Name", "Email", "Role", "Ngo Id", "Type", "Doner"})
        self.assertEqual(body["user"]["Role"], "ops, admin")
        self.assertTrue(body["token"])
        stored = sql("SELECT password FROM sama_test.user_profile_userrole WHERE email = 'ops1@example.org'")
        self.assertTrue(all(p.startswith("pbkdf2_sha256$") for (p,) in stored))
        self.assertEqual(self.login("ops1@example.org", "plainpw1").status_code, 200)
        self.assertEqual(self.login("ops1@example.org", "wrong").status_code, 401)

    def test_registration_only_and_school_logins(self):
        self.assertEqual(self.login("reg@example.org", "regpw").json()["user"]["Role"], "ngo")
        school = self.login("SCH-1", "UD-1").json()
        self.assertEqual(school["user"]["Role"], "school")
        self.assertTrue(school["token"])

    def test_signup_hashes_and_rejects_duplicates(self):
        payload = {"type": "addRegistration", "Name": "New", "Email": "new@example.org", "Password": "newpw123"}
        self.assertEqual(self.client.post("/user-exec", json=payload).status_code, 200)
        (stored,) = sql("SELECT password FROM sama_test.user_profile_registration WHERE email = 'new@example.org'")[0]
        self.assertTrue(stored.startswith("pbkdf2_sha256$"))
        payload["Email"] = "NEW@example.org"
        self.assertEqual(self.client.post("/user-exec", json=payload).status_code, 409)

    def test_forgot_password_is_non_destructive_and_single_use(self):
        self.client.post("/user-exec", json={"type": "forgotPassword", "email": "ops1@example.org"})
        self.assertEqual(len(self.sent), 1)
        temp = re.search(r"letter-spacing: 0.05em;\">([^<]+)</span>", self.sent[0]["html_part"]).group(1)
        self.assertEqual(self.login("ops1@example.org", "plainpw1").status_code, 200)
        self.assertEqual(self.login("ops1@example.org", temp).status_code, 200)
        self.assertEqual(self.login("ops1@example.org", "plainpw1").status_code, 401)
        self.assertEqual(self.login("ops1@example.org", temp).status_code, 200)

    def test_forgot_password_is_rate_limited_and_silent_for_unknown_emails(self):
        unknown = self.client.post("/user-exec", json={"type": "forgotPassword", "email": "nobody@example.org"})
        self.assertEqual(unknown.json()["status"], "success")
        for _ in range(5):
            self.client.post("/user-exec", json={"type": "forgotPassword", "email": "reg@example.org"})
        self.assertEqual(len(self.sent), 3)

    def test_enforce_mode_protects_admin_operations(self):
        os.environ["AUTH_MODE"] = "enforce"
        anonymous = self.client.post("/ngo-exec", json={"type": "deleteNgo", "id": "DRAFT-1"})
        self.assertEqual(anonymous.status_code, 401)
        smuggled = self.client.post("/user-exec?type=login", json={"type": "updateRegistration", "email": "reg@example.org"})
        self.assertEqual(smuggled.status_code, 401)

        viewer = {"Authorization": "Bearer " + self.login("ops1@example.org", "plainpw1").json()["token"]}
        self.assertEqual(self.client.get("/user-exec?type=getRegistration", headers=viewer).status_code, 200)
        self.assertEqual(self.client.post("/ngo-exec", json={"type": "deleteNgo", "id": "DRAFT-1"}, headers=viewer).status_code, 403)

        editor = {"Authorization": "Bearer " + self.login("editor@example.org", "editorpw").json()["token"]}
        deleted = self.client.post("/ngo-exec", json={"type": "deleteNgo", "id": "DRAFT-1"}, headers=editor)
        self.assertEqual(deleted.status_code, 200)

    def test_ngo_cannot_edit_another_ngos_beneficiary(self):
        os.environ["AUTH_MODE"] = "enforce"
        ngo = {"Authorization": "Bearer " + self.login("ngo1@example.org", "ngopw").json()["token"]}
        # Claiming its own NGO id in the payload does not help: the stored row decides.
        hijack = {"type": "editUser", "id": "B-1", "ngo": "SAM-1", "name": "Taken"}
        self.assertEqual(self.client.post("/exec", json=hijack, headers=ngo).status_code, 403)
        self.assertEqual(self.client.get("/exec?type=getUserData").status_code, 401)

    def test_webhook_secret_and_upload_limits(self):
        self.assertEqual(self.client.post("/api/rms-webhook", json={"status": "ACTIVE"}).status_code, 400)
        os.environ["RMS_WEBHOOK_SECRET"] = "s3cret"
        try:
            self.assertEqual(self.client.post("/api/rms-webhook", json={"asset_tag": "x"}).status_code, 401)
        finally:
            os.environ["RMS_WEBHOOK_SECRET"] = ""
        blocked = self.client.post("/evidence-upload", files={"file": ("x.html", b"<script>", "text/html")})
        self.assertEqual(blocked.status_code, 415)


if __name__ == "__main__":
    unittest.main()
