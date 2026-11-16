"""Stored NGO request IDs: identical to the old computed IDs, then never renumbered.

Skipped unless SAMA_TEST_DATABASE_URL is set.
"""

import pathlib
import unittest

from . import _env

if _env.TEST_DATABASE_URL:
    import psycopg

    from app.domain.ngos import request_ids

MIGRATION = pathlib.Path(__file__).resolve().parents[2] / "sql_scripts" / "phase1_023_ngo_request_display_id.sql"


def sql(statement, params=None):
    with psycopg.connect(_env.TEST_DATABASE_URL, autocommit=True) as conn:
        cur = conn.execute(statement, params)
        return cur.fetchall() if cur.description else None


def old_rule_ids():
    """The IDs the dashboard computed before they were stored."""
    external = [r[0] for r in sql("SELECT id FROM sama_test.external_registered_ngo")]
    base = request_ids.max_serial(external)
    rows = sql("SELECT id FROM sama_test.ngo_requests ORDER BY id")
    return {r[0]: f"SAM-{base + pos}" for pos, r in enumerate(rows, start=1)}


@unittest.skipUnless(_env.TEST_DATABASE_URL, "SAMA_TEST_DATABASE_URL is not set")
class NgoRequestIdTests(unittest.TestCase):
    def setUp(self):
        sql(
            """
            DROP SCHEMA IF EXISTS sama_test CASCADE;
            CREATE SCHEMA sama_test;
            CREATE TABLE sama_test.external_registered_ngo (id text primary key);
            INSERT INTO sama_test.external_registered_ngo VALUES ('SAM-3'), ('SAM-10'), ('SAM-X1'), ('ABC');
            CREATE TABLE sama_test.ngo_requests (id serial primary key, ngo_name text);
            INSERT INTO sama_test.ngo_requests (ngo_name) VALUES ('A'), ('B'), ('C'), ('D');
            """
        )
        request_ids._column_ready = False

    def tearDown(self):
        sql("DROP SCHEMA IF EXISTS sama_test CASCADE")

    def test_first_backfill_reproduces_the_old_ids(self):
        expected = old_rule_ids()
        self.assertEqual(expected[1], "SAM-11")
        self.assertEqual(request_ids.load_display_ids(), expected)

    def test_ids_survive_deletion_and_new_requests_get_the_next_number(self):
        before = request_ids.load_display_ids()
        sql("DELETE FROM sama_test.ngo_requests WHERE id = 2")
        sql("INSERT INTO sama_test.ngo_requests (ngo_name) VALUES ('E')")
        after = request_ids.load_display_ids()
        for db_id in (1, 3, 4):
            self.assertEqual(after[db_id], before[db_id])
        self.assertEqual(after[5], "SAM-15")
        # The old rule would now have renumbered request 3 to SAM-12.
        self.assertEqual(old_rule_ids()[3], "SAM-12")
        self.assertEqual(request_ids.find_request_id("SAM-13"), 3)
        self.assertIsNone(request_ids.find_request_id("SAM-12"))

    def test_ids_are_never_reused(self):
        request_ids.load_display_ids()
        sql("DELETE FROM sama_test.ngo_requests WHERE id = 4")
        sql("INSERT INTO sama_test.ngo_requests (ngo_name) VALUES ('E')")
        self.assertEqual(request_ids.load_display_ids()[5], "SAM-15")

    def test_numbering_continues_after_every_request_is_deleted(self):
        request_ids.load_display_ids()
        sql("DELETE FROM sama_test.ngo_requests")
        sql("INSERT INTO sama_test.ngo_requests (ngo_name) VALUES ('E')")
        self.assertEqual(request_ids.load_display_ids()[5], "SAM-15")

    def test_newest_request_deleted_after_the_sql_migration(self):
        sql(MIGRATION.read_text().replace("sama_ops.", "sama_test."))
        sql("DELETE FROM sama_test.ngo_requests WHERE id = 4")
        sql("INSERT INTO sama_test.ngo_requests (ngo_name) VALUES ('E')")
        self.assertEqual(request_ids.load_display_ids()[5], "SAM-15")

    def run_with_open_reader(self):
        """Call load_display_ids while another transaction is reading ngo_requests."""
        import threading
        import time

        result = {}
        with psycopg.connect(_env.TEST_DATABASE_URL) as reader:
            reader.execute("SELECT * FROM sama_test.ngo_requests").fetchall()
            worker = threading.Thread(target=lambda: result.update(ids=request_ids.load_display_ids()))
            started = time.monotonic()
            worker.start()
            worker.join(timeout=15)
            elapsed = time.monotonic() - started
            reader.rollback()
        self.assertFalse(worker.is_alive(), "load_display_ids hung behind an open reader")
        return result.get("ids"), elapsed

    def test_open_readers_do_not_block_once_the_column_exists(self):
        request_ids.load_display_ids()
        request_ids._column_ready = False
        ids, elapsed = self.run_with_open_reader()
        self.assertEqual(ids, old_rule_ids())
        self.assertLess(elapsed, 2)

    def test_first_setup_behind_an_open_reader_falls_back_instead_of_hanging(self):
        ids, elapsed = self.run_with_open_reader()
        self.assertIsNone(ids)
        self.assertLess(elapsed, 10)

    def test_migration_sql_gives_the_same_ids_as_the_application(self):
        expected = old_rule_ids()
        sql(MIGRATION.read_text().replace("sama_ops.", "sama_test."))
        stored = dict(sql("SELECT id, display_id FROM sama_test.ngo_requests"))
        self.assertEqual(stored, expected)
        self.assertEqual(request_ids.load_display_ids(), expected)


if __name__ == "__main__":
    unittest.main()
