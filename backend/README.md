# Python backend for API migration

This backend now replaces:

- `REACT_APP_LaptopAndBeneficiaryDetailsApi` -> `http://localhost:8000/exec`
- `REACT_APP_UserDetailsApis` -> `http://localhost:8000/user-exec`

The other frontend APIs remain unchanged.

## What is migrated now

- `type=getLaptopData` (GET)
- `type=getUserData` (GET)
- `type=getpre` (GET)
- `type=pickupget` (GET)
- `type=audit` (GET)
- `type=UpdateLaptopComment` (POST)
- `type=updatepickupstatus` (POST)
- `type=assign` (POST)
- `type=laptopLabeling` (POST)
- `type=userdetails`, `type=editUser`, `type=deleteUser` (POST)

### Stage and checklist engine (`/exec`)

- `GET /exec?type=getStageTemplate`
- `GET /exec?type=getStageTemplate&stageId=1`
- `GET /exec?type=getStageTemplate&stageCode=RECEIVED`
- `GET /exec?type=getStageMap` (dashboard/admin stage lookup)
- `GET /exec?type=getStageMap&includeInactive=1`
- `GET /exec?type=getLaptopStageRuns&laptopId=<SERIAL>`
- `GET /exec?type=getStageRunResponses&runId=<RUN_ID>`
- `POST /exec` with `type=startStageRun`
- `POST /exec` with `type=submitChecklistResponses`
- `POST /exec` with `type=evaluateStageRun`
- `POST /exec` with `type=completeStageRun`

`startStageRun` accepts `stageId` (preferred) and `stageCode` (backward compatible).

Migration file for this module:

- `sql_scripts/phase1_006_stage_checklist_engine.sql`

### User details API (`/user-exec`)

- `GET /user-exec` -> login user list (from `user_profile_userrole` + approved registrations)
- `GET /user-exec?type=getRegistration` -> registration table list
- `POST /user-exec` with `type=addRegistration`
- `POST /user-exec` with `type=updateRegistration`
- `POST /user-exec` with `type=forgotPassword`

Public website forms use `POST /exec` with `type=publicInquiry`. The backend
saves submissions to `sama_ops.public_inquiries` and forwards the same payload
to `LEGACY_GET_INVOLVED_FORM` so the database and Google Sheet stay in sync.

All other `type` values on this endpoint are proxied to legacy Apps Script when `LEGACY_LAPTOP_API_URL` is set.

## Environment variables

Create `backend/.env`:

```env
DATABASE_URL=postgresql://postgres@localhost:5432/sama
DB_SCHEMA=sama_ops
PORT=8000
```

The backend is database-only. Apps Script is not used at runtime. To perform
the one-time migration of all supported sheet data (laptops, audit, preliminary
requests, and NGO registrations), run:

```bash
RUN_ONE_TIME_SHEET_SYNC=true python backend/sync.py
```

Leave `RUN_ONE_TIME_SHEET_SYNC` unset or set to `false` after the migration.

## Security settings

Authentication and access rules live in `app/core/security.py`. The defaults keep
the dashboard working while access rules are verified.

| Variable | Default | Purpose |
|---|---|---|
| `AUTH_MODE` | `monitor` | `monitor` logs requests that would be denied (`auth-monitor would_deny ...`) but allows them. `enforce` rejects them. `off` disables checks. |
| `AUTH_TOKEN_SECRET` | derived from `DATABASE_URL` | Key that signs login tokens. Required for `AUTH_MODE=enforce` (the server will not start without it). Changing it signs everyone out. |
| `AUTH_TOKEN_TTL_HOURS` | `720` | How long a login token stays valid. |
| `ADMIN_EDITORS` | the two current editors | Comma-separated admin emails allowed to make admin changes. Keep in sync with `src/utils/authPermissions.js`. |
| `RMS_API_KEY` | unset | When set, the RMS school lookups (`/api/schools/udise-map`, `/api/schools/{school_id}`) require it in `X-API-Key`. |
| `CORS_ALLOW_ORIGINS` | `thesama.in`, Amplify, localhost and IP origins | Comma-separated browser origins allowed to call the API. `*` allows all. |
| `RMS_WEBHOOK_SECRET`, `JOTFORM_WEBHOOK_SECRET`, `EMAIL_WEBHOOK_SECRET` | unset | When set, the webhook must send it in `X-Webhook-Secret`, `X-API-Key` or `?token=`. |
| `PASSWORD_RESET_TTL_MINUTES` | `60` | Lifetime of the temporary password emailed by forgot-password. |
| `EVIDENCE_MAX_MB` | `25` | Upload limit for `/evidence-upload`. |
| `LOGIN_MAX_FAILURES`, `LOGIN_WINDOW_SECONDS` | `10`, `900` | Failed logins allowed per email and IP before a short lockout. |
| `DB_POOL_ENABLED` | `false` | Reuse database connections from a per-process pool instead of opening one per query. |
| `DB_POOL_MIN_SIZE`, `DB_POOL_MAX_SIZE` | `1`, `10` | Pool size per uvicorn worker. With `--workers 2` the API holds at most twice `DB_POOL_MAX_SIZE` connections; keep that below the RDS connection limit. |
| `DB_POOL_TIMEOUT` | `30` | Seconds a request waits for a free pooled connection before failing. |

Which roles may call which operation is defined in `ACCESS_RULES` in
`app/core/security.py`. Operations not listed there stay public.

Passwords are stored as PBKDF2 hashes. Accounts that still hold a plain-text
password keep working and are upgraded on their next successful login.
Forgot-password stores the temporary password as a pending reset in
`password_reset_request`; the current password keeps working until the
temporary one is used.

Background jobs run in only one process, chosen by a file lock
(`BACKGROUND_JOB_LOCK_FILE`, default in the system temp directory). By default
that is one of the uvicorn workers. To run them in a dedicated process instead,
start `python -m app.workers` from `backend/` (see `deploy/sama-worker.service`)
and set `ENABLE_BACKGROUND_JOBS=false` for the web server.

### Rolling out enforcement

1. Deploy with `AUTH_MODE=monitor` and a new `AUTH_TOKEN_SECRET`.
2. Watch the logs for `auth-monitor would_deny` and `would_redact` for one to
   two weeks. Entries
   with `caller=anonymous` from users who logged in before this release
   disappear once they log in again.
3. Adjust `ACCESS_RULES` for any legitimate caller that shows up, then set
   `AUTH_MODE=enforce`. Users without a valid token, including sessions started
   before this release, are sent back to `/login` once and continue after
   signing in.

## Run locally

```bash
pip install -r backend/requirements.txt
uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8000 --reload
```

Or run with one command:

```bash
python backend/run.py
```

Health check:

```bash
curl http://localhost:8000/health
```

## Code layout

See `ARCHITECTURE.md` at the repository root for the full design. In short:

```
app/
  main.py            wiring only: middleware, routers, startup
  core/              config, db, security, logging, paths
  api/legacy.py      /exec, /ngo-exec, /user-exec dispatchers
  api/routes/        one router per area (schools, rms, public, ...)
  domain/            business logic per area (identity, laptops, ngos, ...)
  integrations/      email, S3, Mistral
  workers/           background job loops (`python -m app.workers`)
tests/               unittest suite
```

## Tests

```bash
cd backend
python -m unittest discover -s tests -t .
```

Database flow tests run only when `SAMA_TEST_DATABASE_URL` points at a
disposable PostgreSQL database; they create and drop a `sama_test` schema.
Never point it at production.

`tests/test_routes.py` fails when a new route is neither guarded nor listed as
public, so every endpoint has to be classified on purpose.

## Database migrations

Numbered SQL files live in `sql_scripts/`. `scripts/db/migrate.py` records
which ones a database has applied:

```bash
python scripts/db/migrate.py                         # status only
python scripts/db/migrate.py --baseline phase1_021   # once, on an existing database
python scripts/db/migrate.py --apply                 # run pending files
```

## Frontend change (only one key)

Set these keys in root `.env`:

```env
REACT_APP_LaptopAndBeneficiaryDetailsApi='http://localhost:8000/exec'
REACT_APP_UserDetailsApis='http://localhost:8000/user-exec'
```

Keep these keys as they are:

- `REACT_APP_NgoInformationApi`
- `REACT_APP_GetInvolvedForm`
