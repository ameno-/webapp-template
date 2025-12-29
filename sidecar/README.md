# Sidecar Service

Python-based sidecar service for processing jobs from the Workers API.

## Architecture

The sidecar consists of two components that run together:

1. **Tool API** (`tool_api.py`) - FastAPI server that exposes `/execute` endpoint for tool invocation
2. **Job Processor** (`job_processor.py`) - Background worker that polls for pending jobs and processes them

## Components

### tool_api.py

FastAPI wrapper for generic tool execution:
- **POST /execute** - Execute tool with provided input
- **GET /health** - Health check endpoint

The `run_tool()` function is a placeholder that should be replaced with your actual tool implementation.

### job_processor.py

Background job processor with these features:
- Polls `/api/jobs?status=pending` every 5 seconds (configurable via `POLL_INTERVAL`)
- Exponential backoff on errors (1s to 30s max)
- Job lifecycle management:
  1. Marks job as started via webhook
  2. Executes job via Tool API
  3. Reports completion/failure via webhook

## Configuration

Environment variables:

```bash
# Workers API URL (where jobs come from)
WORKERS_URL=http://localhost:8787

# Tool API URL (usually localhost)
TOOL_API_URL=http://localhost:8000

# How often to poll for jobs (seconds)
POLL_INTERVAL=5

# API port
API_PORT=8000

# Environment
ENVIRONMENT=development
```

## Local Development

### Prerequisites

- Python 3.11+
- pip or uv

### Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Or with uv
uv pip install -r requirements.txt
```

### Run Locally

Terminal 1 - Start Tool API:
```bash
python tool_api.py
```

Terminal 2 - Start Job Processor:
```bash
python job_processor.py
```

Or run both together:
```bash
python tool_api.py & python job_processor.py
```

### Testing

Test the Tool API:
```bash
curl http://localhost:8000/health

curl -X POST http://localhost:8000/execute \
  -H "Content-Type: application/json" \
  -d '{"input": {"test": "data"}}'
```

## Deployment

### Docker

Build and run with Docker:

```bash
docker build -t webapp-sidecar .
docker run -p 8000:8000 \
  -e WORKERS_URL=https://your-workers-url.workers.dev \
  webapp-sidecar
```

### Fly.io

Deploy to Fly.io:

```bash
# Login to Fly.io
fly auth login

# Update fly.toml with your app name and Workers URL

# Deploy
fly deploy

# Set secrets
fly secrets set ANTHROPIC_API_KEY=your-key-here

# View logs
fly logs

# Check status
fly status
```

## Customization

To customize for your specific tool:

1. **Edit `run_tool()` in tool_api.py** - Replace the placeholder with your tool logic:

   ```python
   async def run_tool(input_data: dict[str, Any]) -> Any:
       # Option 1: Call subprocess
       import subprocess
       result = subprocess.run(["your-tool", input_data["arg"]], ...)
       return {"output": result.stdout}

       # Option 2: Import Python module
       from tools.my_tool import process
       return await process(input_data)

       # Option 3: Call external API
       import requests
       response = requests.post("https://api.example.com", json=input_data)
       return response.json()
   ```

2. **Update requirements.txt** - Add your tool's dependencies

3. **Update Dockerfile** - Add any system dependencies your tool needs

4. **Update fly.toml** - Configure your app name and region

## Monitoring

The sidecar includes built-in logging:

- Info level: Job processing, polling activity
- Error level: Job failures, API errors
- Warning level: Backoff events, health check failures

Logs follow the format:
```
2024-01-15 10:30:45 - job-processor - INFO - Processing job abc123
2024-01-15 10:30:46 - job-processor - INFO - Job abc123 completed successfully
```

## Error Handling

The job processor implements exponential backoff:

- On first error: 1 second backoff
- On second error: 2 seconds backoff
- On third error: 4 seconds backoff
- Maximum backoff: 30 seconds

After successful job processing, the error counter resets.

## Architecture Diagram

```
┌─────────────────┐
│  React Frontend │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Cloudflare      │
│ Workers API     │
│ (Job Queue)     │
└────────┬────────┘
         │
         │ Polling
         ▼
┌─────────────────┐
│  Job Processor  │ ◄─── Exponential Backoff
│  (Sidecar)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Tool API      │
│  (FastAPI)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Your Tool      │
│  Implementation │
└─────────────────┘
```

## Files

- `tool_api.py` - FastAPI server for tool execution
- `job_processor.py` - Background job polling worker
- `requirements.txt` - Python dependencies
- `Dockerfile` - Container configuration
- `fly.toml` - Fly.io deployment configuration
- `README.md` - This file
