import unittest
from unittest.mock import patch, MagicMock

from . import _env  # noqa: F401
from app.domain.inquiries import _is_inquiry_email_paused, _save_public_inquiry
from app.api.routes.public import public_contribute


class FormEmailPauseTests(unittest.TestCase):
    def test_inquiry_email_pause_topics(self):
        # 1. Sama Saathi -> Paused
        self.assertTrue(_is_inquiry_email_paused("contact", "I want to become a Sama Saathi"))
        self.assertTrue(_is_inquiry_email_paused("contact", "Sama Saathi"))

        # 2. Bringing the Saathi model to my community -> Paused
        self.assertTrue(_is_inquiry_email_paused("contact", "Bringing the Saathi model to my community"))
        self.assertTrue(_is_inquiry_email_paused("community", "General Community"))

        # 3. Something else -> Paused
        self.assertTrue(_is_inquiry_email_paused("contact", "Something else"))
        self.assertTrue(_is_inquiry_email_paused("contact", "other"))

        # 4. Other contact topics -> NOT paused (should send email)
        self.assertFalse(_is_inquiry_email_paused("contact", "Donating laptops"))
        self.assertFalse(_is_inquiry_email_paused("contact", "Corporate partnership"))
        self.assertFalse(_is_inquiry_email_paused("contact", "Renew Desk at our office"))
        self.assertFalse(_is_inquiry_email_paused("contact", "Mentoring"))
        self.assertFalse(_is_inquiry_email_paused("callback", "Book a Call Request"))

    @patch("app.domain.inquiries._send_email_common")
    @patch("app.domain.inquiries.get_conn")
    def test_save_public_inquiry_pauses_email_and_saves_db(self, mock_get_conn, mock_send_email):
        mock_conn = MagicMock()
        mock_cur = MagicMock()
        mock_cur.fetchone.return_value = {"id": 999}
        mock_conn.cursor.return_value.__enter__.return_value = mock_cur
        mock_get_conn.return_value.__enter__.return_value = mock_conn

        # Test Sama Saathi inquiry
        res = _save_public_inquiry({
            "formType": "contact",
            "topic": "I want to become a Sama Saathi",
            "name": "Test User",
            "email": "test@example.com",
            "message": "Hello",
        })

        self.assertEqual(res, {"status": "success", "databaseId": 999})
        # DB was inserted and committed
        self.assertTrue(mock_cur.execute.called)
        self.assertTrue(mock_conn.commit.called)
        # Email was NOT called
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
