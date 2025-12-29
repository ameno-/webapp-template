#!/usr/bin/env python3
"""
Tool API Wrapper
FastAPI wrapper for generic tool invocation

This is a generic tool API that can be customized for specific tools.
"""

import os
import json
import logging
from pathlib import Path
from typing import Any
from datetime import datetime

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("tool-api")

# Environment configuration
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
API_PORT = int(os.getenv("API_PORT", "8000"))
WORKERS_URL = os.getenv("WORKERS_URL", "http://localhost:8787")

# Initialize FastAPI
app = FastAPI(
    title="Tool API",
    description="Generic API wrapper for tool execution",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ExecuteRequest(BaseModel):
    """Request model for tool execution."""
    input: dict[str, Any]


class ExecuteResponse(BaseModel):
    """Response model for tool execution."""
    success: bool
    result: Any | None = None
    error: str | None = None
    execution_time: float | None = None


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    tool: str
    version: str
    environment: str
    timestamp: str


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="ok",
        tool="generic-tool",
        version="1.0.0",
        environment=ENVIRONMENT,
        timestamp=datetime.utcnow().isoformat(),
    )


@app.post("/execute", response_model=ExecuteResponse)
async def execute_tool(request: ExecuteRequest):
    """
    Execute the tool with provided input.

    This endpoint is called by the job processor for direct execution.
    """
    import time
    start_time = time.time()

    try:
        # Import and run the tool
        result = await run_tool(request.input)

        return ExecuteResponse(
            success=True,
            result=result,
            execution_time=time.time() - start_time,
        )
    except Exception as e:
        logger.exception(f"Tool execution failed: {e}")
        return ExecuteResponse(
            success=False,
            error=str(e),
            execution_time=time.time() - start_time,
        )


async def run_tool(input_data: dict[str, Any]) -> Any:
    """
    Run the tool with the provided input.

    This implementation supports:
    - YouTube video analysis (url + mode)
    - Generic URL content analysis

    Configure TOOL_TYPE environment variable:
    - "youtube-analyzer" - YouTube video analysis
    - "content-analyzer" - Generic content analysis
    - "generic" - Placeholder (default)
    """
    import subprocess
    import tempfile

    tool_type = os.getenv("TOOL_TYPE", "generic")
    logger.info(f"Running {tool_type} with input: {input_data}")

    url = input_data.get("url")
    mode = input_data.get("mode", "quick")

    if not url:
        raise ValueError("URL is required")

    if tool_type == "youtube-analyzer":
        return await run_youtube_analyzer(url, mode)
    elif tool_type == "content-analyzer":
        return await run_content_analyzer(url, mode)
    else:
        # Generic placeholder
        return {
            "message": "Tool execution placeholder - set TOOL_TYPE env var",
            "tool_type": tool_type,
            "input_received": input_data,
            "timestamp": datetime.utcnow().isoformat(),
        }


async def run_youtube_analyzer(url: str, mode: str) -> dict[str, Any]:
    """
    Run YouTube video analysis using fabric patterns.

    Modes:
    - quick: extract_wisdom only
    - standard: extract_wisdom + extract_insights
    - deep: All patterns (wisdom, insights, recommendations, references)
    """
    import subprocess
    import tempfile
    import shutil

    # Check if fabric is available
    fabric_path = shutil.which("fabric")
    if not fabric_path:
        return {
            "content": f"# Analysis Unavailable\n\nThe fabric CLI is not installed. Please install it to enable YouTube analysis.\n\nURL: {url}\nMode: {mode}",
            "format": "markdown",
        }

    # Download transcript using yt-dlp
    try:
        import subprocess
        yt_result = subprocess.run(
            ["yt", "--transcript", url],
            capture_output=True,
            text=True,
            timeout=60,
        )
        transcript = yt_result.stdout if yt_result.returncode == 0 else None
    except Exception as e:
        logger.warning(f"Could not get transcript: {e}")
        transcript = None

    if not transcript:
        return {
            "content": f"# Transcript Unavailable\n\nCould not extract transcript from: {url}\n\nPlease ensure the video has captions available.",
            "format": "markdown",
        }

    # Define patterns based on mode
    patterns = {
        "quick": ["extract_wisdom"],
        "standard": ["extract_wisdom", "extract_insights"],
        "deep": ["extract_wisdom", "extract_insights", "extract_recommendations", "extract_references"],
    }

    selected_patterns = patterns.get(mode, patterns["quick"])
    results = []

    for pattern in selected_patterns:
        try:
            result = subprocess.run(
                ["fabric", "-p", pattern],
                input=transcript,
                capture_output=True,
                text=True,
                timeout=120,
            )
            if result.returncode == 0 and result.stdout.strip():
                results.append(f"## {pattern.replace('_', ' ').title()}\n\n{result.stdout}")
        except Exception as e:
            logger.warning(f"Pattern {pattern} failed: {e}")
            results.append(f"## {pattern.replace('_', ' ').title()}\n\n*Analysis failed: {e}*")

    content = f"# YouTube Video Analysis\n\n**URL:** {url}\n**Mode:** {mode}\n\n" + "\n\n---\n\n".join(results)

    return {"content": content, "format": "markdown"}


async def run_content_analyzer(url: str, mode: str) -> dict[str, Any]:
    """
    Run generic content analysis on a URL.
    Uses requests to fetch content and basic analysis.
    """
    import requests
    from urllib.parse import urlparse

    try:
        response = requests.get(url, timeout=30, headers={
            "User-Agent": "Mozilla/5.0 (compatible; ContentAnalyzer/1.0)"
        })
        response.raise_for_status()
        content = response.text

        # Basic analysis
        word_count = len(content.split())
        char_count = len(content)
        parsed_url = urlparse(url)

        result = f"""# Content Analysis Report

**URL:** {url}
**Domain:** {parsed_url.netloc}
**Mode:** {mode}

## Statistics
- **Characters:** {char_count:,}
- **Words:** ~{word_count:,}
- **Reading Time:** ~{word_count // 200} minutes

## Content Preview
```
{content[:500]}{"..." if len(content) > 500 else ""}
```

---
*Analysis completed at {datetime.utcnow().isoformat()}*
"""
        return {"content": result, "format": "markdown"}

    except Exception as e:
        return {
            "content": f"# Analysis Failed\n\nCould not analyze URL: {url}\n\nError: {e}",
            "format": "markdown",
        }


if __name__ == "__main__":
    import uvicorn

    logger.info(f"Starting Tool API on port {API_PORT}")
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=API_PORT,
        log_level="info",
    )
