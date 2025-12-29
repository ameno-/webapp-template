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

    Override this function with actual tool invocation logic.

    Example implementations:

    1. For a subprocess-based tool:
        import subprocess
        result = subprocess.run(
            ["python3", "tools/my_tool.py", input_data.get("arg")],
            capture_output=True,
            text=True,
            timeout=300,
        )
        return {"output": result.stdout}

    2. For a Python module:
        from tools.my_tool import process
        return await process(input_data)

    3. For an external API:
        import requests
        response = requests.post("https://api.example.com", json=input_data)
        return response.json()
    """
    logger.info(f"Running tool with input: {input_data}")

    # TODO: Replace with actual tool invocation
    # This is a placeholder that echoes back the input
    return {
        "message": "Tool execution placeholder - replace run_tool() with actual implementation",
        "input_received": input_data,
        "timestamp": datetime.utcnow().isoformat(),
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
