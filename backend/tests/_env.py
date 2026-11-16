"""Test environment: imported first so the app never sees production settings."""

import os

TEST_DATABASE_URL = os.getenv("SAMA_TEST_DATABASE_URL", "")

os.environ.update(
    {
        # core.db loads backend/.env without overriding variables that are already
        # set, so blank out everything that could reach a real service.
        "DATABASE_URL": TEST_DATABASE_URL or "postgresql://invalid@127.0.0.1:1/none",
        "DB_SCHEMA": "sama_test",
        "ENABLE_BACKGROUND_JOBS": "false",
        "AUTH_MODE": "monitor",
        "AUTH_TOKEN_SECRET": "unit-test-secret",
        "ADMIN_EDITORS": "editor@example.org",
        "SMTP_USER": "",
        "SMTP_PASSWORD": "",
        "MAILJET_API_KEY": "",
        "MAILJET_API_SECRET": "",
        "MISTRAL_API_KEY": "",
        "RMS_WEBHOOK_SECRET": "",
        "JOTFORM_WEBHOOK_SECRET": "",
        "HTTP_PROXY": "http://127.0.0.1:9",
        "HTTPS_PROXY": "http://127.0.0.1:9",
    }
)
