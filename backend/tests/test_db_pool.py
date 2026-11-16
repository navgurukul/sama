"""Connection pool behaviour against a disposable PostgreSQL database.

Skipped unless SAMA_TEST_DATABASE_URL is set.
"""

import os
import threading
import unittest

from . import _env

from app.core import db


@unittest.skipUnless(_env.TEST_DATABASE_URL, "SAMA_TEST_DATABASE_URL is not set")
class ConnectionPoolTests(unittest.TestCase):
    def setUp(self):
        os.environ["DB_POOL_ENABLED"] = "true"
        os.environ["DB_POOL_MAX_SIZE"] = "3"
        db.close_pool()

    def tearDown(self):
        db.close_pool()
        os.environ["DB_POOL_ENABLED"] = "false"

    def backend_pid(self):
        with db.get_conn() as conn:
            return conn.execute("SELECT pg_backend_pid() AS pid").fetchone()["pid"]

    def test_connections_are_reused_and_rows_are_dicts(self):
        pids = {self.backend_pid() for _ in range(10)}
        self.assertLessEqual(len(pids), 3)

    def test_commit_on_success_and_rollback_on_error(self):
        with db.get_conn() as conn:
            conn.execute("CREATE TEMP TABLE IF NOT EXISTS pool_probe (v int)")
        with db.get_conn() as conn:
            conn.execute("DROP TABLE IF EXISTS pool_probe_persistent")
            conn.execute("CREATE TABLE pool_probe_persistent (v int)")
            conn.execute("INSERT INTO pool_probe_persistent VALUES (1)")
        with self.assertRaises(RuntimeError):
            with db.get_conn() as conn:
                conn.execute("INSERT INTO pool_probe_persistent VALUES (2)")
                raise RuntimeError("boom")
        with db.get_conn() as conn:
            rows = conn.execute("SELECT v FROM pool_probe_persistent ORDER BY v").fetchall()
            conn.execute("DROP TABLE pool_probe_persistent")
        self.assertEqual([r["v"] for r in rows], [1])

    def test_failed_transaction_does_not_leak_to_next_borrower(self):
        with db.get_conn() as conn:
            try:
                conn.execute("SELECT * FROM table_that_does_not_exist")
            except Exception:
                pass
        with db.get_conn() as conn:
            self.assertEqual(conn.execute("SELECT 1 AS one").fetchone()["one"], 1)

    def test_changed_row_factory_is_reset(self):
        from psycopg.rows import tuple_row

        with db.get_conn() as conn:
            conn.row_factory = tuple_row
        with db.get_conn() as conn:
            self.assertIsInstance(conn.execute("SELECT 1 AS one").fetchone(), dict)

    def test_connection_killed_by_server_is_replaced(self):
        pid = self.backend_pid()
        with db.get_conn() as conn:
            conn.execute("SELECT pg_terminate_backend(%s)", (pid,))
        self.assertNotEqual(self.backend_pid(), pid)

    def test_concurrent_borrowers_beyond_max_size_wait_their_turn(self):
        errors = []

        def work():
            try:
                with db.get_conn() as conn:
                    conn.execute("SELECT pg_sleep(0.2)")
            except Exception as exc:
                errors.append(exc)

        threads = [threading.Thread(target=work) for _ in range(8)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()
        self.assertEqual(errors, [])

    def test_disabled_pool_opens_direct_connections(self):
        os.environ["DB_POOL_ENABLED"] = "false"
        self.assertEqual(len({self.backend_pid() for _ in range(5)}), 5)
        self.assertIsNone(db._pool)


if __name__ == "__main__":
    unittest.main()
