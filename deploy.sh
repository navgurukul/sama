#!/bin/bash
# =============================================
# Sama Project - EC2 Deployment Script
# Stops existing services, deploys React + FastAPI behind nginx
# =============================================
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step()  { echo -e "\n${BLUE}========== $1 ==========${NC}"; }

# =============================================
# CONFIGURATION (edit if needed)
# =============================================
REPO_URL="https://github.com/navgurukul/sama.git"
BRANCH="AWS_Data"           # change to AWS_Data if deploying that branch
APP_DIR="/var/www/sama"
BACKEND_PORT=8000
NGINX_SITE="sama"

# =============================================
# STEP 0: Get server IP/domain
# =============================================
echo ""
echo -e "${BLUE}=============================================${NC}"
echo -e "${BLUE}     SAMA PROJECT EC2 DEPLOYMENT SCRIPT     ${NC}"
echo -e "${BLUE}=============================================${NC}"

# Try to auto-detect public IP from AWS metadata
PUBLIC_IP=$(curl -s --max-time 3 http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null \
  || curl -s --max-time 5 ifconfig.me 2>/dev/null \
  || echo "")

if [ -n "$PUBLIC_IP" ]; then
    log_info "Detected public IP: $PUBLIC_IP"
    read -p "Use '$PUBLIC_IP' as server address? Press Enter to confirm, or type your domain: " INPUT
    SERVER_ADDR="${INPUT:-$PUBLIC_IP}"
else
    read -p "Enter your EC2 public IP or domain (e.g. 13.234.56.78): " SERVER_ADDR
fi

log_info "Server address: $SERVER_ADDR"

# =============================================
# STEP 1: Stop all existing services
# =============================================
log_step "STEP 1: Stopping existing services"

# Stop PM2 (common Node.js process manager)
if command -v pm2 &>/dev/null; then
    log_info "Stopping PM2 processes..."
    pm2 stop all 2>/dev/null || true
    pm2 delete all 2>/dev/null || true
fi

# Kill uvicorn / gunicorn (Python backend)
log_info "Killing any running uvicorn/gunicorn processes..."
pkill -f "uvicorn" 2>/dev/null || true
pkill -f "gunicorn" 2>/dev/null || true
pkill -f "python.*run.py" 2>/dev/null || true

# Kill any React dev server that might be running
log_info "Killing any Node dev servers..."
pkill -f "react-scripts" 2>/dev/null || true
pkill -f "node.*start" 2>/dev/null || true

# Stop systemd service if it exists from a previous deploy
if systemctl is-active --quiet sama-backend 2>/dev/null; then
    log_info "Stopping existing sama-backend systemd service..."
    sudo systemctl stop sama-backend
fi

log_info "All existing processes stopped."

# =============================================
# STEP 2: Install system dependencies
# =============================================
log_step "STEP 2: Installing system dependencies"

sudo apt-get update -qq

# Node.js 18
if ! command -v node &>/dev/null; then
    log_info "Installing Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - -q
    sudo apt-get install -y nodejs -qq
else
    log_info "Node.js $(node --version) already installed."
fi

# Python 3 + venv
if ! command -v python3 &>/dev/null; then
    log_info "Installing Python 3..."
    sudo apt-get install -y python3 python3-pip python3-venv -qq
else
    log_info "Python $(python3 --version) already installed."
fi

# Nginx
if ! command -v nginx &>/dev/null; then
    log_info "Installing nginx..."
    sudo apt-get install -y nginx -qq
else
    log_info "Nginx already installed."
fi

sudo apt-get install -y git curl -qq

# =============================================
# STEP 3: Clone or update repository
# =============================================
log_step "STEP 3: Setting up repository"

if [ -d "$APP_DIR/.git" ]; then
    log_info "Repository exists at $APP_DIR. Pulling latest..."
    cd "$APP_DIR"
    git fetch origin
    git checkout "$BRANCH"
    git pull origin "$BRANCH"
else
    log_info "Cloning repository into $APP_DIR..."
    sudo mkdir -p "$APP_DIR"
    sudo chown "$USER:$USER" "$APP_DIR"
    git clone -b "$BRANCH" "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi

cd "$APP_DIR"

# =============================================
# STEP 4: Backend .env setup
# =============================================
log_step "STEP 4: Backend environment (.env)"

if [ ! -f "$APP_DIR/backend/.env" ]; then
    log_warn "backend/.env not found! Creating a template..."
    cat > "$APP_DIR/backend/.env" << 'EOF'
# PostgreSQL on AWS RDS
DATABASE_URL=postgresql://ops_sama:PASSWORD@db-pg.XXXXXX.ap-south-1.rds.amazonaws.com:5432/sama?sslmode=require
DB_SCHEMA=sama_ops

# Legacy Apps Script fallback
LEGACY_LAPTOP_API_URL=https://script.google.com/macros/s/XXXXXX/exec
LEGACY_GET_INVOLVED_FORM=https://script.google.com/macros/s/XXXXXX/exec

# Uvicorn settings
HOST=127.0.0.1
PORT=8000
RELOAD=false

# AWS credentials
AWS_ACCESS_KEY_ID=YOUR_KEY
AWS_SECRET_ACCESS_KEY=YOUR_SECRET
AWS_REGION=ap-south-1
AWS_ROLE_ARN=arn:aws:iam::ACCOUNT_ID:role/S3-SamaSocial-Role
S3_BUCKET=sama-ops
EOF
    log_warn "IMPORTANT: Edit $APP_DIR/backend/.env with your real credentials before continuing!"
    read -p "Press Enter after you've edited the backend .env file..."
else
    log_info "backend/.env already exists. Skipping (using existing credentials)."
fi

# =============================================
# STEP 5: Frontend .env setup
# =============================================
log_step "STEP 5: Frontend environment (.env)"

# API calls go through nginx on same domain, so use relative paths won't work
# with CRA - we use the full URL pointing to this server
FRONTEND_ENV="$APP_DIR/.env"

if [ -f "$FRONTEND_ENV" ]; then
    # Backup existing
    cp "$FRONTEND_ENV" "${FRONTEND_ENV}.bak"
    log_info "Backed up existing .env to .env.bak"
fi

log_info "Writing frontend .env with server address: $SERVER_ADDR"

# Preserve all existing vars but override the API URLs
EXISTING_VARS=""
if [ -f "${FRONTEND_ENV}.bak" ]; then
    EXISTING_VARS=$(grep -v "REACT_APP_LaptopAndBeneficiaryDetailsApi\|REACT_APP_UserDetailsApis\|REACT_APP_NgoInformationApi" "${FRONTEND_ENV}.bak" 2>/dev/null || true)
fi

cat > "$FRONTEND_ENV" << EOF
# API endpoints pointing to nginx proxy on this server
REACT_APP_LaptopAndBeneficiaryDetailsApi=http://${SERVER_ADDR}/exec
REACT_APP_UserDetailsApis=http://${SERVER_ADDR}/user-exec
REACT_APP_NgoInformationApi=http://${SERVER_ADDR}/ngo-exec

# --- Restore other env vars below (Firebase, etc.) ---
${EXISTING_VARS}
EOF

log_warn "Review $APP_DIR/.env — make sure Firebase keys are present!"
echo "--- Current .env ---"
cat "$FRONTEND_ENV"
echo "--------------------"
read -p "Press Enter to continue (or Ctrl+C to edit it first)..."

# =============================================
# STEP 6: Install backend dependencies
# =============================================
log_step "STEP 6: Backend — Python dependencies"

cd "$APP_DIR"

# Create virtual environment inside backend/
python3 -m venv backend/venv
source backend/venv/bin/activate

pip install --upgrade pip -q
pip install -r backend/requirements.txt -q

deactivate
log_info "Backend dependencies installed in backend/venv."

# =============================================
# STEP 7: Build frontend
# =============================================
log_step "STEP 7: Frontend — npm install & build"

cd "$APP_DIR"

if [ -d "$APP_DIR/build" ]; then
    log_info "Build folder already exists. Skipping npm install & build."
else
    npm install --legacy-peer-deps
    NODE_OPTIONS=--max-old-space-size=1536 npm run build
    log_info "React build complete. Static files in $APP_DIR/build/"
fi

# =============================================
# STEP 8: Create systemd service for backend
# =============================================
log_step "STEP 8: Systemd service for FastAPI backend"

sudo tee /etc/systemd/system/sama-backend.service > /dev/null << EOF
[Unit]
Description=Sama FastAPI Backend (uvicorn)
After=network.target

[Service]
Type=simple
User=${USER}
WorkingDirectory=${APP_DIR}/backend
Environment="PATH=${APP_DIR}/backend/venv/bin:/usr/local/bin:/usr/bin:/bin"
EnvironmentFile=${APP_DIR}/backend/.env
ExecStart=${APP_DIR}/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port ${BACKEND_PORT} --workers 2
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable sama-backend
sudo systemctl start sama-backend

sleep 3

if systemctl is-active --quiet sama-backend; then
    log_info "sama-backend service is running!"
else
    log_error "Backend failed to start. Check logs:"
    sudo journalctl -u sama-backend --no-pager -n 40
    exit 1
fi

# =============================================
# STEP 9: Configure nginx
# =============================================
log_step "STEP 9: Nginx configuration"

# Remove old default site
sudo rm -f /etc/nginx/sites-enabled/default

sudo tee /etc/nginx/sites-available/$NGINX_SITE > /dev/null << EOF
server {
    listen 80;
    server_name ${SERVER_ADDR} _;

    # Serve React static build
    root ${APP_DIR}/build;
    index index.html;

    # React Router support — all unknown paths serve index.html
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # ---- FastAPI proxy endpoints ----

    location /api {
        proxy_pass         http://127.0.0.1:${BACKEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header   Host \$host;
        proxy_set_header   X-Real-IP \$remote_addr;
        proxy_set_header   X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_read_timeout 120s;
        client_max_body_size 50M;
    }

    location /exec {
        proxy_pass         http://127.0.0.1:${BACKEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header   Host \$host;
        proxy_set_header   X-Real-IP \$remote_addr;
        proxy_set_header   X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_read_timeout 120s;
        client_max_body_size 50M;
    }

    location /user-exec {
        proxy_pass         http://127.0.0.1:${BACKEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header   Host \$host;
        proxy_set_header   X-Real-IP \$remote_addr;
        proxy_set_header   X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_read_timeout 120s;
        client_max_body_size 50M;
    }

    location /ngo-exec {
        proxy_pass         http://127.0.0.1:${BACKEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header   Host \$host;
        proxy_set_header   X-Real-IP \$remote_addr;
        proxy_set_header   X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_read_timeout 120s;
        client_max_body_size 50M;
    }

    location /health {
        proxy_pass         http://127.0.0.1:${BACKEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header   Host \$host;
    }

    location /docs {
        proxy_pass         http://127.0.0.1:${BACKEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header   Host \$host;
    }

    location /openapi.json {
        proxy_pass         http://127.0.0.1:${BACKEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header   Host \$host;
    }

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;
}
EOF

sudo ln -sf /etc/nginx/sites-available/$NGINX_SITE /etc/nginx/sites-enabled/$NGINX_SITE

log_info "Testing nginx config..."
sudo nginx -t

log_info "Reloading nginx..."
sudo systemctl reload nginx
sudo systemctl enable nginx

# =============================================
# STEP 10: Verify
# =============================================
log_step "STEP 10: Verification"

sleep 2

BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${BACKEND_PORT}/health 2>/dev/null || echo "000")
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/ 2>/dev/null || echo "000")

if [ "$BACKEND_STATUS" = "200" ]; then
    log_info "Backend /health: HTTP $BACKEND_STATUS - OK"
else
    log_warn "Backend /health returned HTTP $BACKEND_STATUS"
fi

if [ "$FRONTEND_STATUS" = "200" ]; then
    log_info "Frontend (nginx): HTTP $FRONTEND_STATUS - OK"
else
    log_warn "Frontend returned HTTP $FRONTEND_STATUS"
fi

echo ""
echo -e "${GREEN}=============================================${NC}"
echo -e "${GREEN}          DEPLOYMENT COMPLETE!              ${NC}"
echo -e "${GREEN}=============================================${NC}"
echo ""
echo -e "  Frontend:  ${BLUE}http://${SERVER_ADDR}${NC}"
echo -e "  Backend:   ${BLUE}http://${SERVER_ADDR}/exec${NC}"
echo -e "  Health:    ${BLUE}http://${SERVER_ADDR}/health${NC}"
echo -e "  API Docs:  ${BLUE}http://${SERVER_ADDR}/docs${NC}"
echo ""
echo "Useful commands:"
echo "  sudo systemctl status sama-backend        # Backend status"
echo "  sudo journalctl -u sama-backend -f        # Backend logs (live)"
echo "  sudo systemctl status nginx               # Nginx status"
echo "  sudo nginx -t                             # Test nginx config"
echo "  sudo systemctl restart sama-backend       # Restart backend"
echo ""
log_warn "Make sure EC2 Security Group allows inbound HTTP (port 80) from the internet!"
