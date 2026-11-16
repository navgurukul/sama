"""Authentication and authorization helpers for the Sama backend.

Everything here uses the Python standard library so it deploys without new
dependencies. Behaviour is controlled by environment variables:

AUTH_MODE            off | monitor | enforce (default: monitor).
                     monitor logs every request that would be denied but lets
                     it through, so access rules can be verified against real
                     traffic before they are enforced.
AUTH_TOKEN_SECRET    HMAC key for signing login tokens. Set this in production.
AUTH_TOKEN_TTL_HOURS Token lifetime (default: 720, i.e. 30 days).
ADMIN_EDITORS        Comma-separated admin emails allowed to make admin changes.
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import logging
import os
import secrets
import threading
import time
from collections import defaultdict, deque
from dataclasses import dataclass, field
from typing import Any, Deque, Dict, FrozenSet, Iterable, List, Optional, Tuple

from fastapi import HTTPException, Request

logger = logging.getLogger("sama.security")
if not logger.handlers:
    _handler = logging.StreamHandler()
    _handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s %(message)s"))
    logger.addHandler(_handler)
    logger.setLevel(logging.INFO)
    logger.propagate = False

# Response header that marks a 401 as "session missing or expired", so the
# frontend can tell it apart from a wrong password on the login form.
AUTH_REQUIRED_HEADER = "X-Sama-Auth"

_DEFAULT_ADMIN_EDITORS = "shweta.admin@navgurukul.org,ganesh@thesama.in"


def auth_mode() -> str:
    mode = os.getenv("AUTH_MODE", "monitor").strip().lower()
    return mode if mode in {"off", "monitor", "enforce"} else "monitor"


def validate_settings() -> None:
    """Fail at startup instead of enforcing access with a guessable signing key."""
    if auth_mode() == "enforce" and not os.getenv("AUTH_TOKEN_SECRET", "").strip():
        raise RuntimeError("AUTH_MODE=enforce requires AUTH_TOKEN_SECRET to be set")


def admin_editors() -> FrozenSet[str]:
    raw = os.getenv("ADMIN_EDITORS", _DEFAULT_ADMIN_EDITORS)
    return frozenset(e.strip().lower() for e in raw.split(",") if e.strip())


# ---------------------------------------------------------------------------
# Password hashing (PBKDF2-HMAC-SHA256)
# ---------------------------------------------------------------------------

_HASH_SCHEME = "pbkdf2_sha256"
_HASH_ITERATIONS = 390_000


def _b64e(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode("ascii")


def _b64d(text: str) -> bytes:
    return base64.urlsafe_b64decode(text + "=" * (-len(text) % 4))


def is_password_hash(stored: Optional[str]) -> bool:
    return bool(stored) and str(stored).startswith(f"{_HASH_SCHEME}$")


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, _HASH_ITERATIONS)
    return f"{_HASH_SCHEME}${_HASH_ITERATIONS}${_b64e(salt)}${_b64e(digest)}"


_DUMMY_HASH = hash_password(secrets.token_urlsafe(16))


def burn_password_check(candidate: Optional[str]) -> None:
    """Spend the same time as a real check, so unknown accounts are not revealed by timing."""
    verify_password(_DUMMY_HASH, candidate or "")


def verify_password(stored: Optional[str], candidate: Optional[str]) -> Tuple[bool, bool]:
    """Check a password against its stored value.

    Returns (matches, needs_rehash). Legacy rows still hold plain text; they
    match by constant-time comparison and are flagged for rehashing so they
    are upgraded on the user's next successful login.
    """
    if stored is None or candidate is None:
        return False, False
    stored = str(stored)
    candidate = str(candidate)

    if not is_password_hash(stored):
        matches = hmac.compare_digest(stored.encode("utf-8"), candidate.encode("utf-8"))
        return matches, matches

    try:
        _, iterations, salt, expected = stored.split("$", 3)
        digest = hashlib.pbkdf2_hmac(
            "sha256", candidate.encode("utf-8"), _b64d(salt), int(iterations)
        )
    except (ValueError, TypeError):
        return False, False
    matches = hmac.compare_digest(digest, _b64d(expected))
    return matches, matches and int(iterations) < _HASH_ITERATIONS


# ---------------------------------------------------------------------------
# Signed login tokens (JWT, HS256)
# ---------------------------------------------------------------------------

_secret_warning_logged = False


def _token_secret() -> bytes:
    global _secret_warning_logged
    secret = os.getenv("AUTH_TOKEN_SECRET", "").strip()
    if secret:
        return secret.encode("utf-8")
    # A stable fallback keeps both uvicorn workers able to verify each other's
    # tokens until a dedicated secret is configured.
    if not _secret_warning_logged:
        logger.warning("AUTH_TOKEN_SECRET is not set; deriving the token key from DATABASE_URL")
        _secret_warning_logged = True
    seed = os.getenv("DATABASE_URL", "")
    if not seed:
        raise RuntimeError("AUTH_TOKEN_SECRET or DATABASE_URL must be set to sign tokens")
    return hashlib.sha256(f"sama-auth-token:{seed}".encode("utf-8")).digest()


def _split_roles(raw: Any) -> List[str]:
    if isinstance(raw, (list, tuple)):
        items: Iterable[Any] = raw
    else:
        items = str(raw or "").split(",")
    roles: List[str] = []
    for item in items:
        role = str(item).strip().lower()
        if role and role not in roles:
            roles.append(role)
    return roles


def issue_token(user: Dict[str, Any]) -> str:
    """Sign a token for a user dict shaped like the login response."""
    now = int(time.time())
    ttl_hours = int(os.getenv("AUTH_TOKEN_TTL_HOURS", "720"))
    claims = {
        "sub": str(user.get("Email") or "").strip().lower(),
        "roles": _split_roles(user.get("Role")),
        "ngo_id": str(user.get("Ngo Id") or ""),
        "type": str(user.get("Type") or ""),
        "doner": str(user.get("Doner") or ""),
        "iat": now,
        "exp": now + ttl_hours * 3600,
    }
    header = _b64e(json.dumps({"alg": "HS256", "typ": "JWT"}, separators=(",", ":")).encode())
    body = _b64e(json.dumps(claims, separators=(",", ":")).encode())
    signature = hmac.new(_token_secret(), f"{header}.{body}".encode("ascii"), hashlib.sha256).digest()
    return f"{header}.{body}.{_b64e(signature)}"


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """Return the token's claims, or None if it is malformed, forged or expired."""
    try:
        header, body, signature = token.split(".")
        expected = hmac.new(_token_secret(), f"{header}.{body}".encode("ascii"), hashlib.sha256).digest()
        if not hmac.compare_digest(expected, _b64d(signature)):
            return None
        if json.loads(_b64d(header)).get("alg") != "HS256":
            return None
        claims = json.loads(_b64d(body))
    except (ValueError, TypeError, json.JSONDecodeError):
        return None
    if int(claims.get("exp", 0)) < int(time.time()):
        return None
    return claims


# ---------------------------------------------------------------------------
# Principal and access rules
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class Principal:
    email: str
    roles: Tuple[str, ...]
    ngo_id: str = ""
    ngo_type: str = ""
    doner: str = ""

    def has_any_role(self, wanted: Iterable[str]) -> bool:
        return any(role in wanted for role in self.roles)

    @property
    def is_admin(self) -> bool:
        return self.has_any_role({"admin"})

    @property
    def is_admin_editor(self) -> bool:
        return self.email in admin_editors()

    @property
    def is_staff(self) -> bool:
        """Admins and ops see every NGO; other roles are limited to their own."""
        return self.has_any_role({"admin", "ops"})


def principal_from_request(request: Request) -> Optional[Principal]:
    header = request.headers.get("authorization", "")
    scheme, _, token = header.partition(" ")
    if scheme.lower() != "bearer" or not token.strip():
        return None
    claims = decode_token(token.strip())
    if not claims or not claims.get("sub"):
        return None
    return Principal(
        email=str(claims["sub"]),
        roles=tuple(_split_roles(claims.get("roles"))),
        ngo_id=str(claims.get("ngo_id") or ""),
        ngo_type=str(claims.get("type") or ""),
        doner=str(claims.get("doner") or ""),
    )


@dataclass(frozen=True)
class AccessRule:
    """Who may call an operation.

    roles: any one of these roles grants access; empty means any signed-in user.
    admin_editor_only: admins must also be listed in ADMIN_EDITORS; non-admin
    roles are unaffected, matching canAdminEdit() in the dashboard.
    ngo_scoped: callers who are not admin or ops may only touch their own NGO.
    """

    roles: FrozenSet[str] = field(default_factory=frozenset)
    admin_editor_only: bool = False
    ngo_scoped: bool = False


def _rule(*roles: str, admin_editor_only: bool = False, ngo_scoped: bool = False) -> AccessRule:
    return AccessRule(roles=frozenset(roles), admin_editor_only=admin_editor_only, ngo_scoped=ngo_scoped)


SIGNED_IN = _rule()
STAFF_WRITE = _rule("admin", "ops", admin_editor_only=True)
ADMIN_WRITE = _rule("admin", admin_editor_only=True)
NGO_WRITE = _rule("admin", "ngo", admin_editor_only=True, ngo_scoped=True)
NGO_READ = _rule("admin", "ops", "ngo", "doner", "afe_approver", ngo_scoped=True)
DONOR_READ = _rule("admin", "ops", "doner", "afe_approver")

# Legacy dispatchers look rules up by `type`; GET dispatchers prefix it with
# "read:" because /ngo-exec reuses some names for both reading and writing.
# Routes use "<area>:<action>" names. Anything not listed stays public.
ACCESS_RULES: Dict[str, AccessRule] = {
    # /user-exec
    "getRegistration": _rule("admin"),
    "getUserRole": _rule("admin"),
    "getUsers": _rule("admin"),
    "updateRegistration": ADMIN_WRITE,
    # /exec reads
    "read:getUserData": NGO_READ,
    "read:getLaptopData": SIGNED_IN,
    "read:getpre": SIGNED_IN,
    "read:pickupget": DONOR_READ,
    "read:audit": _rule("admin", "ops"),
    "read:getStageTemplate": SIGNED_IN,
    "read:getStageMap": SIGNED_IN,
    "read:getStages": SIGNED_IN,
    "read:getLaptopStageRuns": SIGNED_IN,
    "read:getStageRunResponses": SIGNED_IN,
    "read:getStageGateLogs": SIGNED_IN,
    "read:getLaptopStageSnapshot": SIGNED_IN,
    "read:getFailedGateQueue": SIGNED_IN,
    "read:getIssueLogs": SIGNED_IN,
    # /exec writes
    "deleteUser": ADMIN_WRITE,
    "editUser": _rule("admin", "ops", "ngo", admin_editor_only=True, ngo_scoped=True),
    "userdetails": _rule("admin", "ops", "ngo", admin_editor_only=True, ngo_scoped=True),
    "bulkupload": STAFF_WRITE,
    "laptopLabeling": STAFF_WRITE,
    "assign": STAFF_WRITE,
    "UpdateLaptopComment": STAFF_WRITE,
    "updatepickupstatus": STAFF_WRITE,
    "startStageRun": STAFF_WRITE,
    "submitChecklistResponses": STAFF_WRITE,
    "evaluateStageRun": STAFF_WRITE,
    "completeStageRun": STAFF_WRITE,
    "createIssueLog": STAFF_WRITE,
    "resolveIssueLog": STAFF_WRITE,
    # /ngo-exec reads
    "read:MultipleDocsGet": _rule("admin", "ngo", ngo_scoped=True),
    "read:manageStatus": SIGNED_IN,
    "read:Monthly": SIGNED_IN,
    "read:Yearly": SIGNED_IN,
    "read:GetMonthlyReport": SIGNED_IN,
    "read:GetYearlyReport": SIGNED_IN,
    "read:GetMou": SIGNED_IN,
    "read:getMonthlyStatusUpdate": SIGNED_IN,
    "read:laptopinfo": SIGNED_IN,
    # /ngo-exec writes
    "NGO:update": _rule("admin", "afe_approver", admin_editor_only=True),
    "NGOTimeline": ADMIN_WRITE,
    "deleteNgo": ADMIN_WRITE,
    "donorUpdate": ADMIN_WRITE,
    "updateDocStatus": ADMIN_WRITE,
    "Donor": STAFF_WRITE,
    "MultipleDocsUpload": NGO_WRITE,
    "MultipleDocsUpdate": NGO_WRITE,
    "NewMultipleDocsUpload": NGO_WRITE,
    "MouUpload": NGO_WRITE,
    "Monthly": NGO_WRITE,
    "Yearly": NGO_WRITE,
    "UpdateMonthly": NGO_WRITE,
    "UpdateYearly": NGO_WRITE,
    "SendMonthlyReport": NGO_WRITE,
    "SendYearlyReport": NGO_WRITE,
    "updateStatusHistory": NGO_WRITE,
    "manageStatus": NGO_WRITE,
    "addManageStatus": NGO_WRITE,
    "editManageStatus": NGO_WRITE,
    "deleteManageStatus": NGO_WRITE,
    # routes
    "evidence:upload": _rule("admin", "ops"),
    "schools:read": _rule("admin", "ops"),
    "schools:write": STAFF_WRITE,
}


def deny(request: Request, operation: str, status: int, reason: str, principal: Optional[Principal]) -> None:
    """Log a denial; in enforce mode also reject the request."""
    mode = auth_mode()
    who = principal.email if principal else "anonymous"
    if mode == "monitor":
        logger.warning(
            "auth-monitor would_deny operation=%s path=%s status=%s reason=%s caller=%s",
            operation, request.url.path, status, reason, who,
        )
        return
    logger.warning(
        "auth-deny operation=%s path=%s status=%s reason=%s caller=%s",
        operation, request.url.path, status, reason, who,
    )
    if status == 401:
        raise HTTPException(
            status_code=401,
            detail="Please log in again to continue.",
            headers={AUTH_REQUIRED_HEADER: "required"},
        )
    raise HTTPException(status_code=403, detail="You do not have permission to perform this action.")


def authorize(
    request: Request,
    operation: Optional[str],
    owner_ngo_id: Optional[str] = None,
) -> Optional[Principal]:
    """Apply the access rule for an operation, if it has one.

    owner_ngo_id is the NGO the request targets, when known; NGO-scoped rules
    reject callers outside admin and ops whose own NGO differs.
    Returns the caller's principal when a valid token is present.
    """
    principal = principal_from_request(request)
    rule = ACCESS_RULES.get(operation or "")
    if rule is None or auth_mode() == "off":
        return principal

    if principal is None:
        deny(request, operation, 401, "missing_or_invalid_token", None)
        return None
    if rule.roles and not principal.has_any_role(rule.roles):
        deny(request, operation, 403, "role_not_allowed", principal)
        return principal
    if rule.admin_editor_only and principal.is_admin and not principal.is_admin_editor:
        deny(request, operation, 403, "admin_view_only", principal)
        return principal
    if rule.ngo_scoped and not principal.is_staff and owner_ngo_id and not is_own_ngo(principal, owner_ngo_id):
        deny(request, operation, 403, "other_ngo", principal)
    return principal


def redaction_applies(request: Request, operation: str, principal: Optional[Principal], hidden_rows: int) -> bool:
    """Whether fields must be hidden from this caller; monitor mode only logs it."""
    mode = auth_mode()
    if mode == "off" or hidden_rows == 0:
        return False
    if mode == "monitor":
        logger.warning(
            "auth-monitor would_redact operation=%s path=%s rows=%s caller=%s",
            operation, request.url.path, hidden_rows, principal.email if principal else "anonymous",
        )
        return False
    return True


def is_own_ngo(principal: Principal, ngo_id: Any) -> bool:
    return str(ngo_id or "").strip().lower() == principal.ngo_id.strip().lower()


def require(operation: str):
    """FastAPI dependency form of authorize(), for routes with a fixed operation."""

    def _dependency(request: Request) -> Optional[Principal]:
        return authorize(request, operation)

    return _dependency


# ---------------------------------------------------------------------------
# Login throttling
# ---------------------------------------------------------------------------

_LOGIN_MAX_FAILURES = int(os.getenv("LOGIN_MAX_FAILURES", "10"))
_LOGIN_WINDOW_SECONDS = int(os.getenv("LOGIN_WINDOW_SECONDS", "900"))
_login_failures: Dict[str, Deque[float]] = defaultdict(deque)
_login_lock = threading.Lock()


def client_ip(request: Request) -> str:
    peer = request.client.host if request.client else ""
    # X-Real-IP is set by our nginx proxy; trust it only when nginx is the peer.
    if peer in {"127.0.0.1", "::1"}:
        return request.headers.get("x-real-ip", peer)
    return peer


def _login_key(identifier: str, ip: str) -> str:
    return f"{identifier.strip().lower()}|{ip}"


def check_login_allowed(identifier: str, ip: str) -> None:
    key = _login_key(identifier, ip)
    cutoff = time.monotonic() - _LOGIN_WINDOW_SECONDS
    with _login_lock:
        attempts = _login_failures.get(key)
        if attempts is None:
            return
        while attempts and attempts[0] < cutoff:
            attempts.popleft()
        if not attempts:
            del _login_failures[key]
            return
        if len(attempts) >= _LOGIN_MAX_FAILURES:
            logger.warning("login-throttled ip=%s", ip)
            raise HTTPException(
                status_code=429,
                detail="Too many login attempts. Please wait a few minutes and try again.",
            )


def record_login_failure(identifier: str, ip: str) -> None:
    with _login_lock:
        _login_failures[_login_key(identifier, ip)].append(time.monotonic())


def clear_login_failures(identifier: str, ip: str) -> None:
    with _login_lock:
        _login_failures.pop(_login_key(identifier, ip), None)


# ---------------------------------------------------------------------------
# Shared secrets for machine callers (webhooks, RMS lookups)
# ---------------------------------------------------------------------------

_unsigned_webhook_warned: set = set()


def verify_webhook_secret(request: Request, env_name: str) -> None:
    """Require the shared secret named by env_name, when it is configured.

    The secret may arrive in the X-Webhook-Secret or X-API-Key header, or a
    ?token= query parameter (for providers such as JotForm that cannot set headers).
    """
    expected = os.getenv(env_name, "").strip()
    if not expected:
        if env_name not in _unsigned_webhook_warned:
            logger.warning("%s is not set; webhook %s accepts unauthenticated calls", env_name, request.url.path)
            _unsigned_webhook_warned.add(env_name)
        return
    provided = (
        request.headers.get("x-webhook-secret")
        or request.headers.get("x-api-key")
        or request.query_params.get("token")
        or ""
    )
    if not hmac.compare_digest(provided.encode("utf-8"), expected.encode("utf-8")):
        logger.warning("webhook-rejected path=%s ip=%s", request.url.path, client_ip(request))
        raise HTTPException(status_code=401, detail="Invalid webhook credentials")


def require_service_key(env_name: str):
    """FastAPI dependency form of verify_webhook_secret(), for machine-only routes."""

    def _dependency(request: Request) -> None:
        verify_webhook_secret(request, env_name)

    return _dependency
