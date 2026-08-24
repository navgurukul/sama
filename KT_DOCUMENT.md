# Sama Project — Knowledge Transfer Document

> **For new joiners.** This document covers everything you need to understand, run, and deploy the Sama project.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture](#3-architecture)
4. [Project Structure](#4-project-structure)
5. [Key Modules & Features](#5-key-modules--features)
6. [Database Schema](#6-database-schema)
7. [API Endpoints](#7-api-endpoints)
8. [External Integrations](#8-external-integrations)
9. [Local Development Setup](#9-local-development-setup)
10. [Environment Variables](#10-environment-variables)
11. [EC2 Deployment](#11-ec2-deployment)
12. [Updating the Live Site](#12-updating-the-live-site)
13. [Common Issues & Fixes](#13-common-issues--fixes)

---

## 1. Project Overview

**Sama** is a laptop refurbishment and distribution tracking platform built for **NavGurukul**, a nonprofit organization. The platform manages the full lifecycle of donated laptops — from intake to distribution to post-deployment monitoring.

### Who uses it?
| Role | What they do |
|------|-------------|
| **Admin** | Full access — manage users, view all data, reports |
| **OPS Staff** | Handle laptop intake, refurbishment, QC |
| **NGO Partners** | View and receive laptops for their beneficiaries |
| **Donors / CSR** | Donate laptops, track their impact |
| **Beneficiaries** | Receive laptops, tracked via NGO |
| **RMS Partners** | Remote monitoring after distribution |

### Laptop Lifecycle (6 Stages)
```
RECEIVED → REFURBISHMENT_TESTING → QC_CHECK → DISTRIBUTION → POST_DEPLOYMENT_15D → MONTHLY_MONITORING
```

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Redux Toolkit, Material UI (MUI) v5 |
| **Backend** | FastAPI (Python), Uvicorn ASGI server |
| **Database** | PostgreSQL on AWS RDS |
| **Auth** | Firebase (Google Sign-In) |
| **File Storage** | AWS S3 (`sama-ops` bucket) |
| **Web Server** | Nginx (reverse proxy + static file serving) |
| **Process Manager** | Systemd (`sama-backend` service) |
| **Legacy APIs** | Google Apps Script (fallback for older data) |
| **Hosting** | AWS EC2 (Ubuntu 24.04) |

---

## 3. Architecture

```
Browser
   │
   ▼
Nginx (port 80)
   ├── /              → serves React build (static files from /var/www/sama/build)
   ├── /exec          → proxies to FastAPI (port 8000)
   ├── /user-exec     → proxies to FastAPI (port 8000)
   └── /health        → proxies to FastAPI (port 8000)
                              │
                              ▼
                     FastAPI + Uvicorn
                     (systemd: sama-backend)
                              │
               ┌──────────────┼──────────────┐
               ▼              ▼              ▼
         PostgreSQL         AWS S3       Google Apps
         (AWS RDS)       (Documents)    Script (fallback)
```

**Key points:**
- Frontend is built as static files and served directly by nginx
- All API calls from the browser go to the same domain (no CORS issues) — nginx proxies them to the backend
- Backend connects to AWS RDS PostgreSQL using SSL
- Document uploads (evidence photos, checklists) go to S3

---

## 4. Project Structure

```
sama/
├── src/                        # React frontend source
│   ├── App.js                  # Root component, routing
│   ├── components/             # Shared UI components
│   │   ├── OPS/                # OPS laptop management tables
│   │   ├── AdminDashboard/     # Admin views
│   │   ├── NgoDashboard/       # NGO partner views
│   │   ├── RmsDetailsModal/    # Remote monitoring modal
│   │   ├── AttentionNeeded/    # Flagged laptops component
│   │   └── SubmissionSuccess/  # Form success screen
│   ├── Pages/                  # Full page views (routes)
│   │   ├── Login.js            # Google Sign-In page
│   │   ├── LaptopData.js       # Main laptop list
│   │   ├── LaptopTagging.js    # Tag/assign laptops
│   │   ├── BeneficiaryProfile/ # Beneficiary details
│   │   └── ...
│   ├── Dashboard/              # Dashboard pages
│   │   ├── AdminNgo/           # Admin NGO management
│   │   ├── BeneficiaryData/    # Beneficiary reports
│   │   ├── MonthlyReport/      # Monthly impact reports
│   │   ├── YearlyReport/       # Yearly impact reports
│   │   └── Redux/              # Redux store + slices
│   ├── CorporateDB/            # Corporate donor dashboards
│   └── theme/                  # MUI theme config
│
├── backend/
│   ├── app/
│   │   ├── main.py             # FastAPI app + all API endpoints
│   │   └── db.py               # PostgreSQL connection helper
│   ├── run.py                  # Uvicorn startup script
│   ├── requirements.txt        # Python dependencies
│   └── .env                    # Backend secrets (not in git)
│
├── sql_scripts/                # PostgreSQL migration files (phase1_*.sql)
├── scripts/                    # DB bootstrap and seeding scripts
├── appscript/                  # Google Apps Script (legacy)
├── public/                     # React public assets
├── .env                        # Frontend env vars (not in git)
├── deploy.sh                   # Full EC2 deployment script
└── update.sh                   # Quick update script for changes
```

---

## 5. Key Modules & Features

### OPS Laptop Management (`src/components/OPS/`)
- Main table showing all laptops with status, donor, NGO assignment
- Filter by stage, condition, NGO
- Bulk actions (assign, update status)
- Export to Excel/CSV/PDF

### Stage & Checklist Engine
- Each laptop goes through 6 defined stages
- Each stage has checklist sections and items (~145 total)
- OPS staff submit pass/fail responses with photo evidence
- Stage gates evaluate whether a laptop can proceed to the next stage

### Admin Dashboard (`src/Dashboard/`)
- Monthly and yearly impact reports
- Beneficiary data management
- NGO management
- User role management

### Corporate Dashboard (`src/CorporateDB/`)
- Impact metrics for corporate donors
- Location-based impact maps (leaflet)
- Monthly and yearly breakdowns

### Beneficiary Profile
- Full profile of each laptop recipient
- Employment status, education, post-deployment check-ins

### RMS (Remote Monitoring)
- 15-day and monthly follow-up after laptop distribution
- Issue logging with P1/P2/P3 severity

---

## 6. Database Schema

**Database:** PostgreSQL on AWS RDS  
**Schema:** `sama_ops`  
**22 tables total**

### Core Tables

| Table | Purpose |
|-------|---------|
| `laptop_labeling` | Device inventory — serial, condition, donor, specs |
| `laptop_user_map` | Maps laptops to beneficiaries |
| `pickup` | Donor pickup events |
| `preliminary` | Initial intake/assessment |
| `report` | Monthly impact reports |

### User & Organization

| Table | Purpose |
|-------|---------|
| `userdetails` | User profiles with NGO assignment |
| `external_registered_ngo` | NGO master data |
| `donor` | Corporate donor master |
| `user_profile_registration` | Registration queue |
| `user_profile_userrole` | Role assignments |

### Stage & Checklist Engine

| Table | Purpose |
|-------|---------|
| `stage_definition` | 6 stage definitions |
| `laptop_stage_run` | Per-device stage execution (with outcome) |
| `checklist_section` | Groups of checklist items per stage |
| `checklist_item` | ~145 individual checklist items |
| `checklist_response` | Per-item pass/fail + evidence URL |
| `stage_gate_rule` | Rules for stage progression |
| `stage_gate_evaluation` | Gate evaluation results |

### Audit & Monitoring

| Table | Purpose |
|-------|---------|
| `laptop_event_log` | Field-level audit trail (128k+ rows) |
| `laptop_versions` | Full JSON snapshots per change |
| `issue_log` | Issues with P1/P2/P3 severity |
| `monthly_check_in` | Post-deployment follow-ups |
| `metrics_base` | Carbon/material impact metrics |

---

## 7. API Endpoints

All endpoints are on the FastAPI backend, proxied through nginx.

### Main Exec Endpoint — `/exec`

| `type` param | Method | Description |
|-------------|--------|-------------|
| `getLaptopData` | GET | All laptop records |
| `getBeneficiaryData` | GET | All beneficiary records |
| `getStageTemplates` | GET | Stage definitions |
| `startStageRun` | POST | Begin a stage for a laptop |
| `submitChecklistResponses` | POST | Submit checklist answers |
| `evaluateStageRun` | POST | Run gate evaluation |
| `completeStageRun` | POST | Mark stage complete |
| `createIssueLog` | POST | Log an issue |
| `resolveIssueLog` | POST | Resolve an issue |

### User Exec Endpoint — `/user-exec`

| `type` param | Method | Description |
|-------------|--------|-------------|
| `getUserProfile` | GET | User profile by email |
| `registerUser` | POST | New user registration |
| `getUserRole` | GET | Role for a user |

### Utility

| Endpoint | Description |
|---------|-------------|
| `GET /health` | Health check — returns `{"status": "ok"}` |
| `GET /docs` | FastAPI Swagger UI (interactive API docs) |

---

## 8. External Integrations

### Firebase (Authentication)
- Google Sign-In for all users
- Firebase project configured in root `.env`
- User email is used as primary identifier across the DB

### Google Apps Script (Legacy Fallback)
- Located in `/appscript/`
- Used before the FastAPI migration
- Still active as fallback via `LEGACY_LAPTOP_API_URL`
- Handles some sheet-based operations not yet migrated

### AWS S3 (`sama-ops` bucket)
- Stores document uploads: evidence photos, checklist attachments
- Backend uses `boto3` with IAM role assumption
- Region: `ap-south-1` (Mumbai)

### AWS RDS (PostgreSQL)
- Managed PostgreSQL in `ap-south-1`
- SSL required (`sslmode=require`)
- Schema: `sama_ops`

---

## 9. Local Development Setup

### Prerequisites
- Node.js 18+
- Python 3.10+
- Git

### Frontend

```bash
git clone -b AWS_Data https://github.com/navgurukul/sama.git
cd sama

# Create .env file (ask a team member for values)
cp .env.example .env   # or create manually — see Section 10

npm install --legacy-peer-deps
npm start
# Runs at http://localhost:3000
```

### Backend

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create backend/.env (ask a team member for values — see Section 10)
# Then run:
python run.py
# Runs at http://localhost:8000
```

### Both must run together for full functionality.

---

## 10. Environment Variables

### Frontend — `.env` (project root)

```env
# Points to the backend API
REACT_APP_LaptopAndBeneficiaryDetailsApi=http://localhost:8000/exec
REACT_APP_UserDetailsApis=http://localhost:8000/user-exec

# Google Apps Script endpoints (legacy)
REACT_APP_NgoInformationApi=https://script.google.com/macros/s/.../exec
REACT_APP_GetInvolvedForm=https://script.google.com/macros/s/.../exec
```

> On EC2: the `localhost:8000` URLs are replaced with `http://<EC2-IP>/exec` so nginx can proxy them.

### Backend — `backend/.env`

```env
# PostgreSQL connection
DATABASE_URL=postgresql://user:password@host:5432/sama?sslmode=require
DB_SCHEMA=sama_ops

# Legacy fallback
LEGACY_LAPTOP_API_URL=https://script.google.com/macros/s/.../exec

# Uvicorn server config
HOST=127.0.0.1
PORT=8000
RELOAD=false              # Set to true in development

# AWS credentials for S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-south-1
AWS_ROLE_ARN=arn:aws:iam::ACCOUNT:role/S3-SamaSocial-Role
S3_BUCKET=sama-ops
```

> **Note:** Never commit `.env` files to git. Ask a team member for credentials.

---

## 11. EC2 Deployment

**Server:** AWS EC2 — Ubuntu 24.04 LTS  
**Instance:** `i-0b394856dedfa4c61` (Sama-Social-Dev)  
**Public IP:** `52.66.86.82`  
**App Directory:** `/var/www/sama`

### First-time deployment

```bash
# 1. Clone the repo on EC2
sudo mkdir -p /var/www/sama && sudo chown ubuntu:ubuntu /var/www/sama
git clone -b AWS_Data https://github.com/navgurukul/sama.git /var/www/sama

# 2. Create both .env files (see Section 10)
nano /var/www/sama/backend/.env
nano /var/www/sama/.env

# 3. Run the deploy script
cd /var/www/sama
chmod +x deploy.sh
./deploy.sh
```

### What `deploy.sh` does (automated)
1. Stops all existing processes (PM2, uvicorn, node dev servers)
2. Installs system dependencies (Node 18, Python 3, nginx)
3. Clones or pulls the repo
4. Checks for `.env` files
5. Creates Python virtualenv and installs backend deps
6. Builds React frontend (`npm run build`) — skips if `build/` exists
7. Creates systemd service `sama-backend` (auto-restart on crash)
8. Configures nginx (static files + API proxy)
9. Verifies backend health and frontend response

### Important EC2 notes
- **Swap file** at `/swapfile` (1GB) — needed for React build due to low RAM
  - Re-enable after reboot: `sudo swapon /swapfile`
- **Disk space** is limited (~6.8GB total) — don't leave old `node_modules` around
- **Systemd service** auto-starts on reboot: `sudo systemctl status sama-backend`

---

## 12. Updating the Live Site

After pushing changes to `AWS_Data` branch:

```bash
# On EC2
cd /var/www/sama
./update.sh
```

The script asks what changed:
- **Frontend only** — rebuilds React, reloads nginx
- **Backend only** — reinstalls Python deps, restarts the systemd service
- **Both** — does both

### Manual commands (if needed)

```bash
# Pull latest
git pull origin AWS_Data

# Rebuild frontend
sudo rm -rf /var/www/sama/build
NODE_OPTIONS=--max-old-space-size=1536 npm run build
sudo chmod -R 755 /var/www/sama/build
sudo systemctl reload nginx

# Restart backend
sudo systemctl restart sama-backend

# Check logs
sudo journalctl -u sama-backend -f
```

---

## 13. Common Issues & Fixes

### Build runs out of memory
React build needs ~1.5GB RAM. EC2 has 1.9GB. Always ensure swap is active before building.
```bash
sudo swapon /swapfile
NODE_OPTIONS=--max-old-space-size=1536 npm run build
```

### Disk full during `npm install`
```bash
sudo journalctl --vacuum-size=50M    # Clear old logs
rm -rf ~/.npm                        # Clear npm cache
sudo rm -rf /var/cache/apt/archives/*
df -h /                              # Check free space
```

### Frontend shows 403
Nginx can't read the build folder — fix permissions:
```bash
sudo chmod -R 755 /var/www/sama/build
sudo systemctl reload nginx
```

### Backend not starting
```bash
sudo journalctl -u sama-backend -n 50    # Check logs
sudo systemctl status sama-backend       # Check status
# Common cause: wrong DATABASE_URL in backend/.env
```

### `git pull` fails with "local changes would be overwritten"
```bash
git checkout -- .      # Discard local changes
git pull origin AWS_Data
```

### Swap not active after reboot
```bash
sudo swapon /swapfile
free -h                # Confirm swap is on
```

### API calls returning 502 Bad Gateway
Backend is down. Restart it:
```bash
sudo systemctl restart sama-backend
curl http://localhost:8000/health    # Should return 200
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Check backend status | `sudo systemctl status sama-backend` |
| View backend logs | `sudo journalctl -u sama-backend -f` |
| Restart backend | `sudo systemctl restart sama-backend` |
| Test nginx config | `sudo nginx -t` |
| Reload nginx | `sudo systemctl reload nginx` |
| Check disk space | `df -h /` |
| Check memory | `free -h` |
| Enable swap | `sudo swapon /swapfile` |
| Update site | `cd /var/www/sama && ./update.sh` |
| Backend health | `curl http://localhost:8000/health` |
| View live site | `http://52.66.86.82` |
| API docs | `http://52.66.86.82/docs` |

---

*Last updated: June 2026 — Branch: `AWS_Data`*
