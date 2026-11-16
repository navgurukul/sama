"""Background job loops and the lock that keeps them to one process.

Jobs run either inside the web server (default, ENABLE_BACKGROUND_JOBS=true) or
in a dedicated process started with `python -m app.workers` from backend/.
Either way the file lock guarantees a single runner per host.
"""

from __future__ import annotations

import asyncio
import os

from ..domain.notifications.reminders import check_rms_inactivity, send_quarterly_impact_reminders


async def run_daily_background_scheduler():
    print("Background scheduler task initiated.")
    while True:
        try:
            # The job bodies are blocking (database, SMTP), so each runs in a worker
            # thread with its own event loop instead of stalling the server's loop.
            await asyncio.to_thread(asyncio.run, check_rms_inactivity())
            await asyncio.to_thread(asyncio.run, send_quarterly_impact_reminders())
        except Exception as e:
            print(f"Error in background scheduler iteration: {e}")
        await asyncio.sleep(24 * 60 * 60)


async def run_frequent_background_scheduler():
    print("Frequent background scheduler task initiated.")
    while True:
        try:
            print("Starting background laptop sync...")
            import sys
            process = await asyncio.create_subprocess_exec(
                sys.executable, "sync.py",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await process.communicate()
            if process.returncode != 0:
                print(f"Background sync failed: {stderr.decode()}")
            else:
                print("Background sync completed successfully.")
        except Exception as e:
            print(f"Error in frequent background scheduler: {e}")
        await asyncio.sleep(5 * 60)


_background_job_lock_handle = None


def try_acquire_job_lock() -> bool:
    """Take a host-wide file lock so only one process runs the job loops.

    The lock is held for the life of the process and released by the OS when
    it exits, so another worker can take over after a restart.
    """
    global _background_job_lock_handle
    import fcntl
    import tempfile

    lock_path = os.getenv(
        "BACKGROUND_JOB_LOCK_FILE",
        os.path.join(tempfile.gettempdir(), "sama-background-jobs.lock"),
    )
    handle = open(lock_path, "a")
    try:
        fcntl.flock(handle.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
    except OSError:
        handle.close()
        return False
    _background_job_lock_handle = handle
    return True


async def start_jobs_when_leader() -> None:
    """Wait for the job lock, then start the job loops in this event loop."""
    while not try_acquire_job_lock():
        await asyncio.sleep(60)
    print(f"Background jobs running in pid {os.getpid()}.")
    asyncio.create_task(run_daily_background_scheduler())
    asyncio.create_task(run_frequent_background_scheduler())


async def run_forever() -> None:
    """Entry point for the dedicated worker process."""
    await start_jobs_when_leader()
    await asyncio.Event().wait()
