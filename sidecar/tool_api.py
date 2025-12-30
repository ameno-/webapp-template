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


def is_youtube_url(url: str) -> bool:
    """Check if URL is a YouTube video."""
    from urllib.parse import urlparse
    parsed = urlparse(url)
    return parsed.netloc in ('youtube.com', 'www.youtube.com', 'youtu.be', 'm.youtube.com')


async def run_tool(input_data: dict[str, Any]) -> Any:
    """
    Run the tool with the provided input.

    Auto-detects YouTube URLs and routes accordingly.
    Uses fabric patterns for AI-powered analysis.
    """
    url = input_data.get("url")
    mode = input_data.get("mode", "quick")

    if not url:
        raise ValueError("URL is required")

    logger.info(f"Analyzing URL: {url} (mode: {mode})")

    # Auto-detect YouTube URLs
    if is_youtube_url(url):
        return await run_youtube_analyzer(url, mode)
    else:
        return await run_content_analyzer(url, mode)


def extract_video_id(url: str) -> str | None:
    """Extract YouTube video ID from URL."""
    import re
    from urllib.parse import urlparse, parse_qs

    parsed = urlparse(url)

    # Handle youtu.be/VIDEO_ID
    if parsed.netloc == 'youtu.be':
        return parsed.path.lstrip('/')

    # Handle youtube.com/watch?v=VIDEO_ID
    if 'youtube.com' in parsed.netloc:
        if parsed.path == '/watch':
            return parse_qs(parsed.query).get('v', [None])[0]
        # Handle youtube.com/v/VIDEO_ID or youtube.com/embed/VIDEO_ID
        match = re.match(r'^/(v|embed)/([^/?]+)', parsed.path)
        if match:
            return match.group(2)

    return None


def get_youtube_transcript(video_id: str) -> str | None:
    """Get transcript for a YouTube video using youtube-transcript-api."""
    try:
        from youtube_transcript_api import YouTubeTranscriptApi

        # Instantiate the API and fetch transcript
        api = YouTubeTranscriptApi()
        transcript_data = api.fetch(video_id, languages=['en', 'en-US', 'en-GB'])
        # Combine all text segments
        transcript = ' '.join([entry.text for entry in transcript_data])
        return transcript
    except Exception as e:
        logger.warning(f"Could not get transcript: {e}")
        return None


async def run_youtube_analyzer(url: str, mode: str) -> dict[str, Any]:
    """
    Run YouTube video analysis using fabric patterns.

    Modes:
    - quick: extract_wisdom only
    - standard: extract_wisdom + extract_insights + summarize
    - deep: All patterns (wisdom, insights, recommendations, references, summarize)
    """
    import shutil

    # Check if fabric is available
    fabric_path = shutil.which("fabric")
    if not fabric_path:
        return {
            "content": f"# Analysis Unavailable\n\nThe fabric CLI is not installed.\n\nURL: {url}\nMode: {mode}",
            "format": "markdown",
        }

    # Extract video ID
    video_id = extract_video_id(url)
    if not video_id:
        return {
            "content": f"# Invalid URL\n\nCould not extract video ID from URL.\n\nURL: {url}",
            "format": "markdown",
        }

    # Get transcript
    logger.info(f"Fetching transcript for video: {video_id}")
    transcript = get_youtube_transcript(video_id)

    if not transcript or len(transcript) < 100:
        return {
            "content": f"# No Transcript\n\nNo captions available for this video.\n\nURL: {url}\nVideo ID: {video_id}",
            "format": "markdown",
        }

    logger.info(f"Transcript length: {len(transcript)} chars")

    # Define patterns based on mode
    patterns = {
        "quick": ["extract_wisdom"],
        "standard": ["extract_wisdom", "extract_insights", "summarize"],
        "deep": ["extract_wisdom", "extract_insights", "extract_recommendations", "extract_references", "summarize"],
    }

    selected_patterns = patterns.get(mode, patterns["quick"])
    results = []

    for pattern in selected_patterns:
        logger.info(f"Running pattern: {pattern}")
        output = run_fabric_pattern(transcript, pattern, timeout=180)
        if output:
            pattern_title = pattern.replace('_', ' ').title()
            results.append(f"## {pattern_title}\n\n{output}")
        else:
            results.append(f"## {pattern.replace('_', ' ').title()}\n\n*Pattern execution failed*")

    content = f"# YouTube Video Analysis\n\n**URL:** {url}\n**Mode:** {mode}\n\n---\n\n" + "\n\n---\n\n".join(results)

    return {"content": content, "format": "markdown"}


def extract_text_from_html(html: str) -> str:
    """Extract readable text from HTML content."""
    import re
    # Remove script and style elements
    text = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL | re.IGNORECASE)
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', ' ', text)
    # Decode HTML entities
    import html as html_module
    text = html_module.unescape(text)
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def run_fabric_pattern(content: str, pattern: str, timeout: int = 120) -> str | None:
    """Run a fabric pattern on content."""
    import subprocess
    import shutil

    fabric_path = shutil.which("fabric")
    if not fabric_path:
        return None

    try:
        result = subprocess.run(
            ["fabric", "-p", pattern],
            input=content,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        if result.returncode == 0 and result.stdout.strip():
            return result.stdout.strip()
        return None
    except Exception as e:
        logger.warning(f"Fabric pattern {pattern} failed: {e}")
        return None


async def run_content_analyzer(url: str, mode: str) -> dict[str, Any]:
    """
    Run content analysis on a URL using fabric patterns.

    Modes:
    - quick: summarize only
    - standard: summarize + extract_wisdom
    - deep: summarize + extract_wisdom + extract_insights + extract_recommendations
    """
    import subprocess
    import shutil
    import requests
    from urllib.parse import urlparse

    # Check if fabric is available
    fabric_path = shutil.which("fabric")
    if not fabric_path:
        return {
            "content": f"# Analysis Unavailable\n\nThe fabric CLI is not installed.\n\nURL: {url}\nMode: {mode}",
            "format": "markdown",
        }

    # Fetch content
    try:
        response = requests.get(url, timeout=30, headers={
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        })
        response.raise_for_status()
        html_content = response.text
    except Exception as e:
        return {
            "content": f"# Fetch Failed\n\nCould not fetch URL: {url}\n\nError: {e}",
            "format": "markdown",
        }

    # Extract text from HTML
    text_content = extract_text_from_html(html_content)

    if len(text_content) < 100:
        return {
            "content": f"# Insufficient Content\n\nThe page has too little text content to analyze.\n\nURL: {url}",
            "format": "markdown",
        }

    # Define patterns based on mode
    patterns = {
        "quick": ["summarize"],
        "standard": ["summarize", "extract_wisdom"],
        "deep": ["summarize", "extract_wisdom", "extract_insights", "extract_recommendations"],
    }

    selected_patterns = patterns.get(mode, patterns["quick"])
    results = []
    parsed_url = urlparse(url)

    for pattern in selected_patterns:
        logger.info(f"Running pattern: {pattern}")
        output = run_fabric_pattern(text_content, pattern)
        if output:
            pattern_title = pattern.replace('_', ' ').title()
            results.append(f"## {pattern_title}\n\n{output}")
        else:
            results.append(f"## {pattern.replace('_', ' ').title()}\n\n*Pattern execution failed*")

    content = f"# Content Analysis\n\n**URL:** {url}\n**Domain:** {parsed_url.netloc}\n**Mode:** {mode}\n\n---\n\n" + "\n\n---\n\n".join(results)

    return {"content": content, "format": "markdown"}


if __name__ == "__main__":
    import uvicorn

    logger.info(f"Starting Tool API on port {API_PORT}")
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=API_PORT,
        log_level="info",
    )
