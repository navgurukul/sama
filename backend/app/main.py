"""FastAPI application wiring: middleware, routers and startup hooks.

Business logic lives in app.domain, external services in app.integrations and
HTTP endpoints in app.api. This module only assembles them.
"""

from __future__ import annotations

import asyncio
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import legacy
from .api.routes import afe, health, ngos, public, rms, schools, uploads, webhooks
from .core.db import close_pool
from .core.logging import RequestContextMiddleware
from .core.security import AUTH_REQUIRED_HEADER, validate_settings
from .workers.scheduler import start_jobs_when_leader

validate_settings()

app = FastAPI(title="Sama Laptop Backend", version="0.1.0")

# Browser origins allowed to call the API. CORS_ALLOW_ORIGINS (comma-separated)
# overrides the default; set it to "*" to allow every origin.
_DEFAULT_CORS_ORIGIN_REGEX = (
    r"https?://("
    r"([a-z0-9-]+\.)*thesama\.in"
    r"|([a-z0-9-]+\.)*amplifyapp\.com"
    r"|localhost|127\.0\.0\.1"
    r"|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}"
    r")(:\d+)?"
)
_cors_origins = [o.strip() for o in os.getenv("CORS_ALLOW_ORIGINS", "").split(",") if o.strip()]

app.add_middleware(RequestContextMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_origin_regex=None if _cors_origins else _DEFAULT_CORS_ORIGIN_REGEX,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=[AUTH_REQUIRED_HEADER, "X-Request-ID"],
)

# Order matters only where paths overlap; it matches the original route order.
for module in (uploads, health, afe, legacy, schools, rms, public, webhooks, ngos):
    app.include_router(module.router)


@app.on_event("startup")
async def start_background_jobs():
    background_jobs_enabled = os.getenv("ENABLE_BACKGROUND_JOBS", "true").strip().lower() in {
        "1", "true", "yes", "on"
    }
    if not background_jobs_enabled:
        print("Background jobs disabled.")
        return
    asyncio.create_task(start_jobs_when_leader())


@app.on_event("shutdown")
def close_database_pool():
    close_pool()
