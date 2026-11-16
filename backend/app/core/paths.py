"""Filesystem locations, resolved once so modules do not depend on their own depth."""

import os

APP_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.dirname(APP_DIR)
REPO_DIR = os.path.dirname(BACKEND_DIR)
