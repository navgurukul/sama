"""Every route must be consciously classified, so new endpoints cannot ship unguarded by accident."""

import unittest

from . import _env  # noqa: F401

from app.main import app

# Routes anyone may call. Keep this list short and deliberate.
PUBLIC = {
    ("GET", "/health"),
    ("GET", "/api/afe/inventory-summary"),
    ("GET", "/api/rms-stats"),
    ("GET", "/api/rms/by-ngo"),
    ("GET", "/api/ngos"),
    ("POST", "/api/public/donate"),
    ("POST", "/api/public/contribute"),
    ("GET", "/api/public/download-report"),
    ("GET", "/api/public/social-impact-stats"),
    ("GET", "/api/public/donor-stats"),
    ("GET", "/api/public/state-wise-sheet"),
    ("GET", "/api/public/live-map-stats"),
    ("GET", "/api/public/impact-stats"),
    ("GET", "/api/public/corporate-impact"),
}
# Legacy dispatchers call authorize() per operation type inside the handler.
PER_OPERATION = {
    ("GET", "/exec"), ("POST", "/exec"),
    ("GET", "/ngo-exec"), ("POST", "/ngo-exec"),
    ("GET", "/user-exec"), ("POST", "/user-exec"),
}
# Machine callers authenticated by a shared secret.
WEBHOOKS = {("POST", "/api/rms-webhook"), ("POST", "/jotform-webhook")}


def api_routes():
    for route in app.routes:
        for method in getattr(route, "methods", ()) or ():
            if method in {"HEAD", "OPTIONS"} or route.path.startswith(("/docs", "/redoc", "/openapi")):
                continue
            yield method, route.path, route


class RouteClassificationTests(unittest.TestCase):
    def test_every_route_is_public_guarded_or_dispatched(self):
        unclassified = []
        for method, path, route in api_routes():
            key = (method, path)
            guarded = bool(getattr(route, "dependencies", None))
            if not (guarded or key in PUBLIC or key in PER_OPERATION or key in WEBHOOKS):
                unclassified.append(key)
        self.assertEqual(unclassified, [], "classify these routes in tests/test_routes.py")

    def test_lists_do_not_reference_removed_routes(self):
        existing = {(m, p) for m, p, _ in api_routes()}
        self.assertEqual((PUBLIC | PER_OPERATION | WEBHOOKS) - existing, set())


if __name__ == "__main__":
    unittest.main()
