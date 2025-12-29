#!/bin/bash
# Start local development environment for webapp-template
# Runs: Vite frontend + Cloudflare Workers + Python sidecar

set -e

echo "=== Starting webapp-template local development ==="

# Check dependencies
command -v npm >/dev/null 2>&1 || { echo "npm is required but not installed."; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "python3 is required but not installed."; exit 1; }

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "=== Shutting down... ==="
    pkill -f "wrangler dev" 2>/dev/null || true
    pkill -f "tool_api.py" 2>/dev/null || true
    pkill -f "job_processor.py" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

if [ ! -d "workers/node_modules" ]; then
    echo "Installing workers dependencies..."
    (cd workers && npm install)
fi

# Create Python virtual environment if needed
if [ ! -d "sidecar/.venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv sidecar/.venv
    source sidecar/.venv/bin/activate
    pip install -r sidecar/requirements.txt
else
    source sidecar/.venv/bin/activate
fi

# Initialize D1 database if needed
echo "Setting up D1 database..."
(cd workers && npx wrangler d1 execute webapp-template-db --local --file=schema.sql 2>/dev/null || true)

# Start Workers API (port 8787)
echo "Starting Workers API on http://localhost:8787..."
(cd workers && npx wrangler dev --local --port 8787 2>&1 | sed 's/^/[workers] /') &
sleep 3

# Start Python sidecar API (port 8000)
echo "Starting Python sidecar API on http://localhost:8000..."
(cd sidecar && WORKERS_URL=http://localhost:8787 python3 tool_api.py 2>&1 | sed 's/^/[sidecar-api] /') &
sleep 2

# Start Python job processor
echo "Starting job processor..."
(cd sidecar && WORKERS_URL=http://localhost:8787 TOOL_API_URL=http://localhost:8000 python3 job_processor.py 2>&1 | sed 's/^/[processor] /') &
sleep 1

# Start Vite frontend (port 5173)
echo "Starting Vite frontend on http://localhost:5173..."
(npm run dev -- --port 5173 2>&1 | sed 's/^/[frontend] /') &
sleep 3

echo ""
echo "=== All services started ==="
echo "  Frontend:    http://localhost:5173"
echo "  Workers API: http://localhost:8787"
echo "  Sidecar API: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for all background processes
wait
