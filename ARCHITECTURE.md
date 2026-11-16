# Sama Platform Architecture

How the Sama dashboard and API are put together, how requests are secured, and
what remains to reach the target design in *Sama Platform — Target
Architecture & Migration Plan*.

## System overview

```
Browser (React, CRA)            RMS server, JotForm
  public site + role dashboards   machine callers
        |  Authorization: Bearer <token>      |  X-API-Key / X-Webhook-Secret
        v                                     v
nginx (TLS) ──> FastAPI (uvicorn, 2 workers) ──> PostgreSQL (RDS, schema sama_ops)
                  |  request id + access log         ^
                  |  CORS allow-list                  |
                  |  per-operation access rules       |
                  └─> worker loop (one process) ──────┘──> SMTP / Mailjet, S3, Mistral
```

## Backend layout

```
backend/app/
  main.py                 wiring only: middleware, routers, startup (58 lines)
  core/
    config.py             table names and deployment settings
    db.py                 get_conn(): direct or pooled (DB_POOL_ENABLED); loads backend/.env
    security.py           password hashing, tokens, ACCESS_RULES, throttling, shared secrets
    logging.py            X-Request-ID and one access log line per request
    paths.py              repository, backend and app directories
  common/payload.py       request/row helpers used by every domain
  api/
    legacy.py             /exec, /ngo-exec, /user-exec type= dispatchers
    routes/               uploads, health, afe, schools, rms, public, webhooks, ngos
  domain/
    identity/service.py   login, registration, approvals, password reset
    laptops/              vocabulary, stage engine, queries, commands
    ngos/operations.py    NGO documents, reports, MOUs, statuses
    notifications/        AFE lifecycle emails, scheduled reminders
    reporting/geo.py      state normalisation for impact reports
    donors.py, inquiries.py
  integrations/           email.py, storage.py (S3), llm.py (Mistral)
  workers/                job loops; `python -m app.workers` runs them standalone
backend/tests/            unittest suite
```

Dependencies point one way: `api` → `domain` → `integrations` / `core` /
`common`. Domain modules never import from `api`.

Route handlers that touch the database, S3 or SMTP are plain functions (or
read the request body and hand the work to `run_in_threadpool`), so blocking
calls never stall the event loop. Background job bodies run in a worker thread.

## Request security

**Identity.** `POST /user-exec {type: "login"}` returns the same `user` object
as before plus a signed `token` (HS256, 30 days by default). The frontend
stores it next to the existing session keys, and `src/api/auth.js` attaches it
to every `fetch` and `axios` call to Sama backend hosts.

**Passwords.** Stored as PBKDF2-SHA256. Plain-text rows still verify and are
rehashed on the next successful login. Password lists are never returned by
any endpoint.

**Authorization as data.** `ACCESS_RULES` in `core/security.py` maps each
protected operation to the roles that may call it. Legacy `type=` writes use
the type name; GET dispatchers use `read:<type>`; routes use `<area>:<action>`.
A rule can also require admins to be in `ADMIN_EDITORS`, and can be NGO-scoped:
callers outside admin and ops may only touch their own NGO (for beneficiary
edits the stored row's NGO is checked, not just the submitted one). Roles match
exactly. Operations not in the table stay public.

| Operations | Allowed |
|---|---|
| Beneficiary data (`read:getUserData`) | admin, ops, ngo, doner, afe_approver |
| Laptops, preliminary, stage and issue reads, NGO reports | any signed-in user |
| Pickups (`read:pickupget`) | admin, ops, doner, afe_approver |
| Audit log, evidence upload, school list | admin, ops |
| NGO documents (`read:MultipleDocsGet`) | admin, own NGO |
| User lists (`getRegistration`, `getUsers`) | admin (viewers included) |
| Laptop writes, stage runs, issue logs, pickups status, school writes | admin editors, ops |
| `updateRegistration`, `deleteNgo`, `donorUpdate`, `deleteUser`, `NGOTimeline`, `updateDocStatus` | admin editors |
| Changing an existing NGO request (`NGO` with an `id`) | admin editors, afe_approver |
| `editUser`, `userdetails` | admin editors, ops, own NGO |
| NGO documents, MOU, monthly and yearly reports, status history | admin editors, own NGO |

**Field-level privacy.** The NGO registration list stays public because the
registration form needs it, but contact name, phone, email and registration
number are blank for anyone who is not admin, ops, a donor or that NGO itself.
When an "additional request" arrives with those fields blank, the server fills
them from the NGO's stored record. Monitor mode logs `would_redact` instead.

Still public on purpose: the pickup and donation forms, inquiries, and the
public impact statistics.

**Rollout switch.** `AUTH_MODE=monitor` (default) logs `auth-monitor
would_deny ...` and lets the call through; `enforce` rejects it. A rejected
session gets a 401 with `X-Sama-Auth: required`, and the frontend returns the
user to `/login`.

**Machine callers.** The RMS and JotForm webhooks, the `email-webhook`
operation and the RMS school lookups accept calls freely until
`RMS_WEBHOOK_SECRET`, `JOTFORM_WEBHOOK_SECRET`, `EMAIL_WEBHOOK_SECRET` or
`RMS_API_KEY` is set; from then on they require it.

**Other controls.** CORS allow-list (`thesama.in`, Amplify, localhost, IP
hosts; override with `CORS_ALLOW_ORIGINS`), login throttling (10 failures per
email and IP per 15 minutes), non-destructive forgot-password (temporary
password in `password_reset_request`, 60 minutes, single use, 3 per hour),
evidence upload limits (25 MB, no executable or HTML types), HTML-escaped email
templates, constant-time responses for unknown login emails, and a startup
check that refuses `AUTH_MODE=enforce` without `AUTH_TOKEN_SECRET`. A session
from before tokens existed is sent back to `/login` once enforcement starts.

`tests/test_routes.py` fails the build when a route is neither guarded, listed
as public, nor a legacy dispatcher, so new endpoints are classified on purpose.

## Data

PostgreSQL schema `sama_ops`. Numbered migrations live in `sql_scripts/` and
`scripts/db/migrate.py` records which ones a database has applied.

**Schema drift.** Production has columns and tables that no migration creates,
for example `laptop_labeling.is_deleted_from_sheet`, most
`external_registered_ngo` columns, the `user_profile_*` tables and the
`ngo_data_*` tables. Before relying on migrations alone, take a schema-only dump
of production (`pg_dump --schema-only`) and commit it as the baseline.

**Connections.** By default each `get_conn()` opens a new connection. With
`DB_POOL_ENABLED=true` each uvicorn worker keeps a pool (1 to 10 connections by
default) that checks a connection before lending it, replaces ones the server
dropped, and resets them on return. Transactions behave the same either way:
commit on success, rollback on error.

## Background jobs

Daily RMS inactivity checks and quarterly reminders, plus a five-minute sheet
sync, run in exactly one process per host (file lock). By default that is one
uvicorn worker; `backend/deploy/sama-worker.service` runs them as a dedicated
process instead.

## Frontend

Create React App. API plumbing lives in `src/api/`: `auth.js` (token
attachment and session-expiry handling) and `config.js` (backend URL
resolution for the login and signup pages). 43 files that no route reached
were removed; the production build was byte-for-byte identical before and
after.

## Status against the migration plan

| Phase | Done | Not done yet |
|---|---|---|
| 0 Contain | Passwords hidden and hashed, tokens, read and write access rules with NGO scoping and registration field privacy (monitor), safe reset, webhook secrets, CORS, upload limits, single job runner, `send_brevo_email` fix | Untrack `build/`, `KT_DOCUMENT.md`, `ngo_payloads/`; school login redesign; token revocation |
| 1 Foundation | Layered modules, `main.py` wiring only, request ids, migration runner, connection pool (opt-in), route, identity and pool tests | CI pipeline |
| 2 Strangle | Worker can run as its own process, vocabularies in one module | `/api/v1` resource routers with schemas, server-side pagination, status lookup table, outbox |
| 3 Retire | Unreachable frontend files removed | Delete legacy dispatchers, Vite + TypeScript, TanStack Query, RLS, materialized views |

The remaining items change API shapes, the build toolchain or production data,
so each needs its own reviewed change and a staging run rather than a
behaviour-preserving refactor.

## Verifying behaviour

The refactor was checked by recording the status and body of 113 requests
covering every route and legacy operation against a database built from
`sql_scripts/`, before and after the change; all were identical.

## Open items

- **Tokens cannot be revoked** before they expire (30 days). Shorten
  `AUTH_TOKEN_TTL_HOURS` or add a version claim checked against the user row.
- **Donor dashboards are not tenant-scoped on the server**: a signed-in donor
  can still request other donors' rows. Scoping needs server-side filters on the
  read queries, which changes their results, so it ships as its own change.
