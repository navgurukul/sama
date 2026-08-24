#!/bin/bash
# Sama - Quick update script (run on EC2 after pushing changes)
set -e

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

APP_DIR="/var/www/sama"
cd "$APP_DIR"

log_info "Pulling latest changes..."
git pull origin AWS_Data

# Re-enable swap if not active (it doesn't persist across reboots)
if ! swapon --show | grep -q swapfile; then
    log_info "Re-enabling swap..."
    sudo swapon /swapfile 2>/dev/null || true
fi

# Ask what changed
echo ""
echo "What did you change?"
echo "  1) Frontend only (src/)"
echo "  2) Backend only (backend/)"
echo "  3) Both"
read -p "Enter 1, 2, or 3: " CHOICE

if [ "$CHOICE" = "1" ] || [ "$CHOICE" = "3" ]; then
    log_info "Rebuilding frontend..."
    sudo rm -rf "$APP_DIR/build"
    NODE_OPTIONS=--max-old-space-size=1536 npm run build
    sudo chmod -R 755 "$APP_DIR/build"
    sudo systemctl reload nginx
    log_info "Frontend updated."
fi

if [ "$CHOICE" = "2" ] || [ "$CHOICE" = "3" ]; then
    log_info "Restarting backend..."
    source "$APP_DIR/backend/venv/bin/activate"
    pip install -r "$APP_DIR/backend/requirements.txt" -q
    deactivate
    sudo systemctl restart sama-backend
    log_info "Backend updated."
fi

echo ""
log_info "Done! Site: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
