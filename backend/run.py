from __future__ import annotations

import os
from pathlib import Path

import uvicorn
from dotenv import load_dotenv


def _as_bool(value: str, default: bool) -> bool:
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def main() -> None:
    base_dir = Path(__file__).resolve().parent
    env_file = base_dir / ".env"

    if env_file.exists():
        load_dotenv(env_file)
    else:
        load_dotenv()

    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    reload_enabled = _as_bool(os.getenv("RELOAD", "true"), True)

    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=reload_enabled,
        app_dir=str(base_dir),
    )


if __name__ == "__main__":
    main()
