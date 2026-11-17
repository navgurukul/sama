import unittest
from unittest.mock import patch, MagicMock

from . import _env  # noqa: F401
from app.domain.inquiries import _is_inquiry_email_paused, _save_public_inquiry
from app.api.routes.public import public_contribute


class FormEmailPauseTests(unittest.TestCase):
    def test_retired_partner_forms_are_rejected(self):
        # The government and community partner pages are no longer on the site.
        from fastapi import HTTPException

        for form_type in ("government", "community"):
            with self.assertRaises(HTTPException) as ctx:
                _save_public_inquiry({"formType": form_type, "email": "x@example.org"})
            self.assertEqual(ctx.exception.status_code, 400)

    def test_inquiry_email_pause_topics(self):
        # 1. All contact forms -> Paused
        self.assertTrue(_is_inquiry_email_paused("contact", "I want to become a Sama Saathi"))
        self.assertTrue(_is_inquiry_email_paused("contact", "Sama Saathi"))
        self.assertTrue(_is_inquiry_email_paused("contact", "Bringing the Saathi model to my community"))
        self.assertTrue(_is_inquiry_email_paused("contact", "Something else"))
        self.assertTrue(_is_inquiry_email_paused("contact", "other"))
        self.assertTrue(_is_inquiry_email_paused("contact", "Donating laptops"))
        self.assertTrue(_is_inquiry_email_paused("contact", "Corporate partnership"))
        self.assertTrue(_is_inquiry_email_paused("contact", "Renew Desk at our office"))
        self.assertTrue(_is_inquiry_email_paused("contact", "Mentoring"))

        # 2. Renew Desk and Call booking forms -> Paused
        self.assertTrue(_is_inquiry_email_paused("book_call", "Renew Desk at our office"))
        self.assertTrue(_is_inquiry_email_paused("book_call", "General Booking"))
        self.assertTrue(_is_inquiry_email_paused("callback", "Book a Call Request"))
        self.assertTrue(_is_inquiry_email_paused("corporate", "Renew Desk at our office"))
        self.assertTrue(_is_inquiry_email_paused("corporate", "Host a desk renewal session"))

        # 3. Non-paused forms (e.g. general corporate form or newsletter without paused keywords) -> NOT paused
        self.assertFalse(_is_inquiry_email_paused("corporate", "Corporate Fleet Donation"))
        self.assertFalse(_is_inquiry_email_paused("newsletter", "Monthly Digest"))

    @patch("app.domain.inquiries._send_email_common")
    @patch("app.domain.inquiries.get_conn")
    def test_save_public_inquiry_pauses_email_and_saves_db(self, mock_get_conn, mock_send_email):
        mock_conn = MagicMock()
        mock_cur = MagicMock()
        mock_cur.fetchone.return_value = {"id": 999}
        mock_conn.cursor.return_value.__enter__.return_value = mock_cur
        mock_get_conn.return_value.__enter__.return_value = mock_conn

        # Test Contact inquiry -> DB committed, Email paused
        res = _save_public_inquiry({
            "formType": "contact",
            "topic": "General Contact",
            "name": "Test User",
            "email": "test@example.com",
            "message": "Hello",
        })

        self.assertEqual(res, {"status": "success", "databaseId": 999})
        self.assertTrue(mock_cur.execute.called)
        self.assertTrue(mock_conn.commit.called)
        mock_send_email.assert_not_called()

        # Test Renew Desk Book a Call -> DB committed, Email paused
        mock_cur.execute.reset_mock()
        mock_conn.commit.reset_mock()
        res_book = _save_public_inquiry({
            "formType": "book_call",
            "topic": "Renew Desk at our office",
            "name": "Corporate Lead",
            "email": "lead@company.com",
            "companyName": "Acme Corp",
            "message": "We want a renew desk session",
        })

        self.assertEqual(res_book, {"status": "success", "databaseId": 999})
        self.assertTrue(mock_cur.execute.called)
        self.assertTrue(mock_conn.commit.called)
        mock_send_email.assert_not_called()

    @patch("app.api.routes.public._send_email_common")
    @patch("app.api.routes.public.get_conn")
    def test_contribute_pauses_individual_emails(self, mock_get_conn, mock_send_email):
        mock_conn = MagicMock()
        mock_cur = MagicMock()
        mock_conn.cursor.return_value.__enter__.return_value = mock_cur
        mock_get_conn.return_value.__enter__.return_value = mock_conn

        # Test Give Individual (Donate a used laptop)
        res_give = public_contribute({
            "formType": "give_individual",
            "firstName": "John",
            "lastName": "Doe",
            "email": "john@example.com",
            "numberOfLaptops": 2,
        })
        self.assertEqual(res_give["status"], "success")
        self.assertTrue(res_give["reference_id"].startswith("SAMA-DON-"))
        # DB was committed
        self.assertTrue(mock_conn.commit.called)
        mock_send_email.assert_not_called()

        # Test Need Individual (Request individual access)
        res_need = public_contribute({
            "formType": "need_individual",
            "firstName": "Jane",
            "lastName": "Doe",
            "email": "jane@example.com",
        })
        self.assertEqual(res_need["status"], "success")
        self.assertTrue(res_need["reference_id"].startswith("SAMA-REQ-"))
        mock_send_email.assert_not_called()
