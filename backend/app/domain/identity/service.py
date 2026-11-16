"""User accounts: login, registration, approval and password reset."""

from __future__ import annotations

import html
import os
import secrets
from typing import Any, Dict, List

from fastapi import HTTPException

from ...common.payload import _normalize_rows
from ...core.config import USER_REGISTRATION_TABLE, USER_ROLE_TABLE
from ...core.db import DB_SCHEMA, get_conn
from ...core.security import (
    burn_password_check,
    check_login_allowed,
    clear_login_failures,
    hash_password,
    issue_token,
    logger as security_logger,
    record_login_failure,
    verify_password,
)
from ...integrations.email import _send_email_common


def _query_user_registration() -> List[Dict[str, Any]]:
    sql = f'''
        SELECT
            name AS "Name",
            email AS "Email",
            status AS "Status",
            role AS "Role",
            reason AS "Reason"
        FROM {DB_SCHEMA}.{USER_REGISTRATION_TABLE}
        ORDER BY name NULLS LAST, email
    '''
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql)
            return _normalize_rows(cur.fetchall())


def _query_user_login_data() -> List[Dict[str, Any]]:
    sql = f'''
        WITH approved_registration AS (
            SELECT
                r.name,
                r.email,
                r.role,
                ''::text AS ngo_id,
                ''::text AS type,
                ''::text AS doner
            FROM {DB_SCHEMA}.{USER_REGISTRATION_TABLE} r
            WHERE lower(coalesce(r.status, '')) = 'approved'
              AND coalesce(r.role, '') <> ''
              AND NOT EXISTS (
                  SELECT 1
                  FROM {DB_SCHEMA}.{USER_ROLE_TABLE} u
                  WHERE lower(u.email) = lower(r.email)
              )
        )
        SELECT
            t.name AS "Name",
            t.email AS "Email",
            t.role AS "Role",
            t.ngo_id AS "Ngo Id",
            t.type AS "Type",
            t.doner AS "Doner"
        FROM (
            SELECT
                u.name,
                u.email,
                u.role,
                u.ngo_id,
                u.type,
                u.doner
            FROM {DB_SCHEMA}.{USER_ROLE_TABLE} u
            UNION ALL
            SELECT * FROM approved_registration
        ) t
        WHERE coalesce(t.email, '') <> ''
    '''
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql)
            return _normalize_rows(cur.fetchall())


PASSWORD_RESET_TABLE = "password_reset_request"


PASSWORD_RESET_TTL_MINUTES = int(os.getenv("PASSWORD_RESET_TTL_MINUTES", "60"))


PASSWORD_RESET_MAX_PER_WINDOW = 3


_password_reset_table_ready = False


def _ensure_password_reset_table() -> bool:
    """Create the pending-reset table on first use. Returns False if it is unavailable."""
    global _password_reset_table_ready
    if _password_reset_table_ready:
        return True
    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    f"""
                    CREATE TABLE IF NOT EXISTS {DB_SCHEMA}.{PASSWORD_RESET_TABLE} (
                        id BIGSERIAL PRIMARY KEY,
                        email TEXT NOT NULL,
                        temp_password_hash TEXT NOT NULL,
                        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                        expires_at TIMESTAMPTZ NOT NULL,
                        used_at TIMESTAMPTZ
                    )
                    """
                )
                cur.execute(
                    f"""
                    CREATE INDEX IF NOT EXISTS idx_{PASSWORD_RESET_TABLE}_email
                    ON {DB_SCHEMA}.{PASSWORD_RESET_TABLE} (lower(email))
                    """
                )
                conn.commit()
        _password_reset_table_ready = True
    except Exception as exc:
        security_logger.error("password reset table unavailable: %s", exc)
    return _password_reset_table_ready


def _find_login_matches(cur: Any, email: str, password: str) -> tuple:
    """Return (rows whose stored password matches, whether any row needs rehashing)."""
    cur.execute(
        f"""
        WITH approved_registration AS (
            SELECT
                r.name,
                r.email,
                r.password,
                r.role,
                ''::text AS ngo_id,
                ''::text AS type,
                ''::text AS doner
            FROM {DB_SCHEMA}.{USER_REGISTRATION_TABLE} r
            WHERE lower(coalesce(r.status, '')) = 'approved'
              AND coalesce(r.role, '') <> ''
              AND NOT EXISTS (
                  SELECT 1
                  FROM {DB_SCHEMA}.{USER_ROLE_TABLE} u
                  WHERE lower(u.email) = lower(r.email)
              )
        )
        SELECT
            t.name AS "Name",
            t.email AS "Email",
            t.password AS "Password",
            t.role AS "Role",
            t.ngo_id AS "Ngo Id",
            t.type AS "Type",
            t.doner AS "Doner"
        FROM (
            SELECT name, email, password, role, ngo_id, type, doner
            FROM {DB_SCHEMA}.{USER_ROLE_TABLE}
            UNION ALL
            SELECT name, email, password, role, ngo_id, type, doner
            FROM approved_registration
        ) t
        WHERE lower(t.email) = lower(%s)
        """,
        (email,),
    )
    rows = cur.fetchall()
    if not rows:
        burn_password_check(password)
    matches = []
    needs_rehash = False
    for row in rows:
        ok, rehash = verify_password(row.get("Password"), password)
        if ok:
            matches.append(row)
            needs_rehash = needs_rehash or rehash
    return matches, needs_rehash


def _upgrade_password_hashes(cur: Any, email: str, password: str, rows: List[Dict[str, Any]]) -> None:
    """Replace legacy stored passwords for this email with a fresh hash."""
    new_hash = hash_password(password)
    stored_values = {row.get("Password") for row in rows if row.get("Password") is not None}
    for stored in stored_values:
        for table in (USER_ROLE_TABLE, USER_REGISTRATION_TABLE):
            cur.execute(
                f"UPDATE {DB_SCHEMA}.{table} SET password = %s WHERE lower(email) = lower(%s) AND password = %s",
                (new_hash, email, stored),
            )


def _redeem_password_reset(email: str, password: str) -> bool:
    """If password is an unexpired temporary password for email, make it the account password."""
    if not _ensure_password_reset_table():
        return False
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"""
                SELECT id, temp_password_hash
                FROM {DB_SCHEMA}.{PASSWORD_RESET_TABLE}
                WHERE lower(email) = lower(%s) AND used_at IS NULL AND expires_at > now()
                ORDER BY created_at DESC
                LIMIT %s
                """,
                (email, PASSWORD_RESET_MAX_PER_WINDOW),
            )
            if not any(verify_password(r["temp_password_hash"], password)[0] for r in cur.fetchall()):
                return False

            new_hash = hash_password(password)
            for table in (USER_ROLE_TABLE, USER_REGISTRATION_TABLE):
                cur.execute(
                    f"UPDATE {DB_SCHEMA}.{table} SET password = %s WHERE lower(email) = lower(%s)",
                    (new_hash, email),
                )
            cur.execute(
                f"""
                UPDATE {DB_SCHEMA}.{PASSWORD_RESET_TABLE}
                SET used_at = now()
                WHERE lower(email) = lower(%s) AND used_at IS NULL
                """,
                (email,),
            )
            conn.commit()
    return True


def _handle_user_post_type(payload: Dict[str, Any], client_ip_address: str = "") -> Dict[str, Any]:
    type_name = payload.get("type")

    with get_conn() as conn:
        with conn.cursor() as cur:
            if type_name == "login":
                email = (payload.get("email") or payload.get("Email") or "").strip()
                password = payload.get("password") or payload.get("Password")

                if not email or password is None:
                    raise HTTPException(status_code=400, detail="Email and password are required")

                check_login_allowed(email, client_ip_address)

                matching_users, needs_rehash = _find_login_matches(cur, email, password)
                if not matching_users:
                    conn.rollback()
                    if _redeem_password_reset(email, password):
                        matching_users, needs_rehash = _find_login_matches(cur, email, password)

                if not matching_users:
                    # School accounts sign in with school_id and UDISE code.
                    try:
                        cur.execute(
                            f"SELECT name, school_id, udise, partner_name, ngo_id FROM {DB_SCHEMA}.schools WHERE school_id = %s AND udise = %s",
                            (email, password)
                        )
                        school = cur.fetchone()
                        if school:
                            conn.rollback()
                            user = {
                                "Name": school["name"],
                                "Email": school["school_id"],
                                "Udise": school["udise"],
                                "Role": "school",
                                "Ngo Id": school["ngo_id"],
                                "Type": "school",
                                "Doner": school["partner_name"]
                            }
                            clear_login_failures(email, client_ip_address)
                            return {"status": "success", "user": user, "token": issue_token(user)}
                    except Exception:
                        conn.rollback()

                    record_login_failure(email, client_ip_address)
                    raise HTTPException(status_code=401, detail="Invalid Email or password.")

                if needs_rehash:
                    _upgrade_password_hashes(cur, email, password, matching_users)
                    conn.commit()
                else:
                    conn.rollback()

                user = {k: v for k, v in dict(matching_users[0]).items() if k != "Password"}
                roles = []
                for matching_user in matching_users:
                    for role in str(matching_user.get("Role") or "").split(","):
                        role = role.strip()
                        if role and role not in roles:
                            roles.append(role)
                user["Role"] = ", ".join(roles)
                user = _normalize_rows([user])[0]
                clear_login_failures(email, client_ip_address)
                return {"status": "success", "user": user, "token": issue_token(user)}

            if type_name == "addRegistration":
                email = (payload.get("Email") or payload.get("email") or "").strip()
                name = (payload.get("Name") or payload.get("name") or "").strip()
                password = payload.get("Password") or payload.get("password")
                status = payload.get("status") or "Data entered"

                if not email or not name or not password:
                    raise HTTPException(status_code=400, detail="Name, Email, Password are required")

                cur.execute(
                    f"""
                    SELECT 1
                    FROM {DB_SCHEMA}.{USER_REGISTRATION_TABLE}
                    WHERE lower(email) = lower(%s)
                    LIMIT 1
                    """,
                    (email,),
                )
                exists_in_registration = cur.fetchone() is not None

                cur.execute(
                    f"""
                    SELECT 1
                    FROM {DB_SCHEMA}.{USER_ROLE_TABLE}
                    WHERE lower(email) = lower(%s)
                    LIMIT 1
                    """,
                    (email,),
                )
                exists_in_roles = cur.fetchone() is not None

                if exists_in_registration or exists_in_roles:
                    raise HTTPException(status_code=409, detail="Email already exists")

                cur.execute(
                    f"""
                    INSERT INTO {DB_SCHEMA}.{USER_REGISTRATION_TABLE}
                    (name, email, password, status, role, reason)
                    VALUES (%s, %s, %s, %s, '', '')
                    """,
                    (name, email, hash_password(str(password)), status),
                )
                conn.commit()
                return {"status": "success", "type": type_name}

            if type_name == "updateRegistration":
                email = (payload.get("email") or payload.get("Email") or "").strip()
                status = payload.get("status")
                role = payload.get("role")
                reason = payload.get("reason") or ""
                payload_ngo_id = payload.get("ngo_id") or payload.get("NgoId")
                payload_ngo_type = payload.get("ngo_type") or payload.get("Type")
                payload_doner = payload.get("doner") or payload.get("Doner")

                if not email:
                    raise HTTPException(status_code=400, detail="email is required")

                cur.execute(
                    f"""
                    UPDATE {DB_SCHEMA}.{USER_REGISTRATION_TABLE}
                    SET status = %s,
                        role = %s,
                        reason = %s
                    WHERE lower(email) = lower(%s)
                    """,
                    (status, role, reason, email),
                )

                if (status or "").lower() == "approved" and (role or "") != "":
                    cur.execute(
                        f"""
                        SELECT name, email, password, role
                        FROM {DB_SCHEMA}.{USER_REGISTRATION_TABLE}
                        WHERE lower(email) = lower(%s)
                        LIMIT 1
                        """,
                        (email,),
                    )
                    reg_row = cur.fetchone()
                    if reg_row:
                        cur.execute(
                            f"""
                            SELECT ngo_id, type, doner
                            FROM {DB_SCHEMA}.{USER_ROLE_TABLE}
                            WHERE lower(email) = lower(%s)
                            LIMIT 1
                            """,
                            (email,),
                        )
                        existing = cur.fetchone()
                        ngo_id = (existing or {}).get("ngo_id") if isinstance(existing, dict) else None
                        ngo_type = (existing or {}).get("type") if isinstance(existing, dict) else None
                        doner = (existing or {}).get("doner") if isinstance(existing, dict) else None

                        if not ngo_id:
                            ngo_id = payload_ngo_id
                        if not ngo_type:
                            ngo_type = payload_ngo_type
                        if not doner:
                            doner = payload_doner

                        cur.execute(
                            f"DELETE FROM {DB_SCHEMA}.{USER_ROLE_TABLE} WHERE lower(email) = lower(%s)",
                            (email,),
                        )
                        cur.execute(
                            f"""
                            INSERT INTO {DB_SCHEMA}.{USER_ROLE_TABLE}
                            (name, email, password, role, ngo_id, type, doner)
                            VALUES (%s, %s, %s, %s, %s, %s, %s)
                            """,
                            (
                                reg_row.get("name"),
                                reg_row.get("email"),
                                reg_row.get("password"),
                                reg_row.get("role"),
                                ngo_id or "",
                                ngo_type or "",
                                doner or "",
                            ),
                        )
                elif (status or "").lower() == "reject":
                    cur.execute(
                        f"DELETE FROM {DB_SCHEMA}.{USER_ROLE_TABLE} WHERE lower(email) = lower(%s)",
                        (email,),
                    )

                conn.commit()
                return {"status": "success", "type": type_name}

            if type_name == "forgotPassword":
                email = (payload.get("email") or payload.get("Email") or "").strip()
                if not email:
                    raise HTTPException(status_code=400, detail="email is required")

                generic_response = {
                    "status": "success",
                    "type": type_name,
                    "message": "If this email is registered, reset instructions have been sent.",
                }

                cur.execute(
                    f"""
                    SELECT name, email FROM {DB_SCHEMA}.{USER_ROLE_TABLE} WHERE lower(email) = lower(%s)
                    UNION
                    SELECT name, email FROM {DB_SCHEMA}.{USER_REGISTRATION_TABLE} WHERE lower(email) = lower(%s)
                    LIMIT 1
                    """,
                    (email, email),
                )
                user_match = cur.fetchone()
                conn.rollback()
                if not user_match:
                    return generic_response

                user_name = (user_match.get("name") if isinstance(user_match, dict) else user_match[0]) or "Partner"
                temp_password = f"Sama@{secrets.token_hex(3).upper()}!{secrets.randbelow(90) + 10}"
                temp_hash = hash_password(temp_password)

                if _ensure_password_reset_table():
                    # The temporary password is stored as a pending reset. The
                    # current password keeps working, so a reset requested by
                    # someone else cannot lock the account owner out.
                    # Serialise resets per email so parallel requests cannot pass the limit together.
                    cur.execute("SELECT pg_advisory_xact_lock(hashtext(lower(%s)))", (email,))
                    cur.execute(
                        f"""
                        SELECT count(*) AS recent
                        FROM {DB_SCHEMA}.{PASSWORD_RESET_TABLE}
                        WHERE lower(email) = lower(%s) AND created_at > now() - make_interval(mins => %s)
                        """,
                        (email, PASSWORD_RESET_TTL_MINUTES),
                    )
                    if (cur.fetchone() or {}).get("recent", 0) >= PASSWORD_RESET_MAX_PER_WINDOW:
                        conn.rollback()
                        return generic_response
                    cur.execute(
                        f"""
                        INSERT INTO {DB_SCHEMA}.{PASSWORD_RESET_TABLE} (email, temp_password_hash, expires_at)
                        VALUES (%s, %s, now() + make_interval(mins => %s))
                        """,
                        (email, temp_hash, PASSWORD_RESET_TTL_MINUTES),
                    )
                    expiry_note = (
                        f"This temporary password expires in {PASSWORD_RESET_TTL_MINUTES} minutes. "
                        "Until you use it, your current password keeps working."
                    )
                else:
                    for table in (USER_ROLE_TABLE, USER_REGISTRATION_TABLE):
                        cur.execute(
                            f"UPDATE {DB_SCHEMA}.{table} SET password = %s WHERE lower(email) = lower(%s)",
                            (temp_hash, email),
                        )
                    expiry_note = ""
                conn.commit()

                safe_name = html.escape(str(user_name))
                safe_email = html.escape(email)
                html_content = f"""
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #FAF8F5; border-radius: 12px; color: #1C1914;">
                    <h2 style="font-size: 22px; color: #2C2516; margin-bottom: 12px;">Sama Dashboard — Password Reset</h2>
                    <p style="font-size: 15px; line-height: 1.6; color: #4A453E;">Hello {safe_name},</p>
                    <p style="font-size: 15px; line-height: 1.6; color: #4A453E;">We received a request to reset the password for your Sama account (<strong>{safe_email}</strong>).</p>
                    <div style="margin: 24px 0; padding: 18px 24px; background: #FFFFFF; border: 1px solid #E2DDD5; border-radius: 8px;">
                        <span style="display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #7A746B; margin-bottom: 6px;">Your New Temporary Password</span>
                        <span style="font-family: monospace; font-size: 20px; font-weight: 700; color: #2D5A27; letter-spacing: 0.05em;">{temp_password}</span>
                    </div>
                    <p style="font-size: 14.5px; line-height: 1.6; color: #4A453E;">Please use this temporary password to log in at the Sama Dashboard. {expiry_note}</p>
                    <p style="margin-top: 24px; font-size: 13px; color: #8C867A;">If you did not request this password reset, you can ignore this email or notify our operations team at operations@thesama.in.</p>
                    <hr style="border: none; border-top: 1px solid #E2DDD5; margin: 28px 0 16px;" />
                    <p style="font-size: 12px; color: #A09A8F; margin: 0;">Sama Digital Foundation • Empowering digital equity</p>
                </div>
                """
                try:
                    _send_email_common(
                        to_email=email,
                        subject="Sama Dashboard — Your Temporary Password",
                        html_part=html_content,
                        to_name=user_name,
                        from_name="Sama Operations",
                        reply_to="operations@thesama.in",
                    )
                except Exception as email_err:
                    security_logger.error("password reset email failed: %s", email_err)

                return generic_response

    raise HTTPException(status_code=501, detail=f"type '{type_name}' not implemented in user backend")
