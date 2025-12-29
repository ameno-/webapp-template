#!/usr/bin/env python3
"""
Job Processor
Polls for pending jobs and processes them using the tool API

This processor:
- Polls /api/jobs?status=pending every 5 seconds (configurable)
- Uses exponential backoff on errors (1s to 30s max)
- Marks jobs as started, executes them, and reports completion
"""

import os
import sys
import time
import json
import logging
import requests
from datetime import datetime
from typing import Any

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("job-processor")

# Environment configuration
WORKERS_URL = os.getenv("WORKERS_URL", "http://localhost:8787")
TOOL_API_URL = os.getenv("TOOL_API_URL", "http://localhost:8000")
POLL_INTERVAL = int(os.getenv("POLL_INTERVAL", "5"))
MAX_RETRIES = int(os.getenv("MAX_RETRIES", "3"))


def poll_for_jobs() -> list[dict]:
    """Poll the Workers API for pending jobs."""
    try:
        response = requests.get(
            f"{WORKERS_URL}/api/jobs",
            params={"status": "pending", "limit": "5"},
            timeout=10,
        )
        response.raise_for_status()
        data = response.json()
        return data.get("jobs", [])
    except requests.RequestException as e:
        logger.error(f"Failed to poll for jobs: {e}")
        return []


def mark_job_started(job_id: str, webhook_secret: str) -> bool:
    """Mark a job as processing via webhook."""
    try:
        response = requests.post(
            f"{WORKERS_URL}/api/webhook/job-started",
            json={
                "job_id": job_id,
                "webhook_secret": webhook_secret,
            },
            timeout=10,
        )
        response.raise_for_status()
        return True
    except requests.RequestException as e:
        logger.error(f"Failed to mark job {job_id} as started: {e}")
        return False


def execute_job(job: dict) -> tuple[bool, Any, str | None]:
    """Execute a job using the tool API."""
    job_id = job["id"]
    input_data = job["input"]

    try:
        response = requests.post(
            f"{TOOL_API_URL}/execute",
            json={"input": input_data},
            timeout=300,  # 5 minute timeout for tool execution
        )
        response.raise_for_status()
        result = response.json()

        if result.get("success"):
            return True, result.get("result"), None
        else:
            return False, None, result.get("error", "Unknown error")

    except requests.Timeout:
        return False, None, "Execution timed out"
    except requests.RequestException as e:
        return False, None, f"API error: {str(e)}"
    except Exception as e:
        return False, None, f"Unexpected error: {str(e)}"


def report_job_complete(
    job_id: str,
    webhook_secret: str,
    success: bool,
    result: Any = None,
    error: str | None = None,
) -> bool:
    """Report job completion via webhook."""
    try:
        payload = {
            "job_id": job_id,
            "status": "completed" if success else "failed",
            "webhook_secret": webhook_secret,
        }

        if success and result is not None:
            payload["result"] = result
        if not success and error:
            payload["error"] = error

        response = requests.post(
            f"{WORKERS_URL}/api/webhook/job-complete",
            json=payload,
            timeout=10,
        )
        response.raise_for_status()
        return True
    except requests.RequestException as e:
        logger.error(f"Failed to report job {job_id} completion: {e}")
        return False


def process_job(job: dict) -> bool:
    """Process a single job."""
    job_id = job["id"]
    webhook_secret = job.get("webhook_secret", "")

    logger.info(f"Processing job {job_id}")

    # Mark as started
    if not mark_job_started(job_id, webhook_secret):
        logger.warning(f"Could not mark job {job_id} as started, skipping")
        return False

    # Execute the tool
    success, result, error = execute_job(job)

    # Report completion
    reported = report_job_complete(
        job_id=job_id,
        webhook_secret=webhook_secret,
        success=success,
        result=result,
        error=error,
    )

    if success:
        logger.info(f"Job {job_id} completed successfully")
    else:
        logger.error(f"Job {job_id} failed: {error}")

    return success and reported


def calculate_backoff(consecutive_errors: int, min_backoff: int = 1, max_backoff: int = 30) -> int:
    """
    Calculate exponential backoff time in seconds.

    Args:
        consecutive_errors: Number of consecutive errors
        min_backoff: Minimum backoff time in seconds (default: 1)
        max_backoff: Maximum backoff time in seconds (default: 30)

    Returns:
        Backoff time in seconds
    """
    if consecutive_errors <= 0:
        return 0

    # Exponential backoff: 2^n seconds, capped at max_backoff
    backoff = min(max_backoff, min_backoff * (2 ** (consecutive_errors - 1)))
    return backoff


def run_processor():
    """Main processor loop."""
    logger.info(f"Starting job processor")
    logger.info(f"  Workers URL: {WORKERS_URL}")
    logger.info(f"  Tool API URL: {TOOL_API_URL}")
    logger.info(f"  Poll interval: {POLL_INTERVAL}s")

    # Check health of tool API
    try:
        response = requests.get(f"{TOOL_API_URL}/health", timeout=5)
        response.raise_for_status()
        logger.info(f"Tool API is healthy: {response.json()}")
    except requests.RequestException as e:
        logger.warning(f"Tool API health check failed: {e}")

    consecutive_errors = 0

    while True:
        try:
            # Poll for pending jobs
            jobs = poll_for_jobs()

            if jobs:
                logger.info(f"Found {len(jobs)} pending job(s)")

                for job in jobs:
                    try:
                        process_job(job)
                    except Exception as e:
                        logger.exception(f"Error processing job {job['id']}: {e}")

                consecutive_errors = 0

            # Wait before next poll
            time.sleep(POLL_INTERVAL)

        except KeyboardInterrupt:
            logger.info("Shutting down processor")
            break
        except Exception as e:
            consecutive_errors += 1
            logger.exception(f"Processor error: {e}")

            # Exponential backoff on consecutive errors
            backoff = calculate_backoff(consecutive_errors)
            if backoff > 0:
                logger.warning(f"Backing off for {backoff}s due to {consecutive_errors} consecutive error(s)")
                time.sleep(backoff)
            else:
                time.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    run_processor()
