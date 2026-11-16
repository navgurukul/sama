"""Run background jobs as a standalone process: `python -m app.workers` from backend/.

Deploy it with ENABLE_BACKGROUND_JOBS=false on the web server so jobs only run here.
"""

import asyncio

from .scheduler import run_forever

if __name__ == "__main__":
    asyncio.run(run_forever())
