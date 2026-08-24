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

## Frontend change (only one key)

Set these keys in root `.env`:

```env
REACT_APP_LaptopAndBeneficiaryDetailsApi='http://localhost:8000/exec'
REACT_APP_UserDetailsApis='http://localhost:8000/user-exec'
```

Keep these keys as they are:

- `REACT_APP_NgoInformationApi`
- `REACT_APP_GetInvolvedForm`
