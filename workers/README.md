# Webapp Template Workers API

Cloudflare Workers API backend for webapp-template, built with Hono and D1.

## Features

- **Job Management API**: CRUD operations for async job tracking
- **Webhook Handler**: Receives callbacks from sidecar processes
- **D1 Database**: SQLite database for persistent storage
- **CORS Support**: Configured for localhost and Cloudflare Pages
- **TypeScript**: Full type safety with Zod validation

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Create D1 Database

```bash
# Create the database
npx wrangler d1 create webapp-template-db

# Copy the database_id from the output and update wrangler.toml
```

### 3. Run Migrations

```bash
# For local development
npm run db:migrate:local

# For production
npm run db:migrate
```

### 4. Update wrangler.toml

Replace `your-database-id-here` with your actual D1 database ID.

## Development

```bash
# Start local development server
npm run dev

# The API will be available at http://localhost:8787
```

## Deployment

```bash
# Deploy to Cloudflare Workers
npm run deploy
```

## API Endpoints

### Jobs API (`/api/jobs`)

- `GET /api/jobs` - List all jobs (last 100)
- `GET /api/jobs/:id` - Get a specific job
- `POST /api/jobs` - Create a new job
- `PUT /api/jobs/:id` - Update a job
- `DELETE /api/jobs/:id` - Delete a job

### Webhook API (`/api/webhook`)

- `POST /api/webhook/callback` - Handle sidecar callbacks
- `GET /api/webhook/logs` - Get webhook logs (debugging)
- `GET /api/webhook/logs/:job_id` - Get logs for a specific job

### Health Check

- `GET /` - Health check endpoint

## Request Examples

### Create a Job

```bash
curl -X POST http://localhost:8787/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "type": "process_data",
    "input_data": {
      "file": "data.csv",
      "options": {"validate": true}
    }
  }'
```

### Update a Job

```bash
curl -X PUT http://localhost:8787/api/jobs/job_123 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "result_data": {
      "rows_processed": 1000,
      "errors": 0
    }
  }'
```

### Webhook Callback

```bash
curl -X POST http://localhost:8787/api/webhook/callback \
  -H "Content-Type: application/json" \
  -d '{
    "job_id": "job_123",
    "status": "completed",
    "result_data": {
      "output": "success"
    }
  }'
```

## Environment Variables

Configure in `wrangler.toml`:

- `PROJECT_NAME`: Project identifier (default: "webapp-template")
- `TOOL_NAME`: Tool identifier (default: "webapp-tool")
- `CORS_ORIGINS`: Comma-separated list of allowed origins
- `ENVIRONMENT`: Environment name (dev/production)

## Database Schema

### Jobs Table

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Primary key, auto-generated |
| status | TEXT | pending, running, completed, failed |
| type | TEXT | Job type identifier |
| input_data | TEXT | JSON-encoded input data |
| result_data | TEXT | JSON-encoded result data |
| error | TEXT | Error message if failed |
| created_at | INTEGER | Unix timestamp |
| updated_at | INTEGER | Unix timestamp |
| started_at | INTEGER | Unix timestamp |
| completed_at | INTEGER | Unix timestamp |

### Webhook Logs Table

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Auto-increment primary key |
| job_id | TEXT | Foreign key to jobs table |
| payload | TEXT | JSON-encoded webhook payload |
| headers | TEXT | JSON-encoded request headers |
| received_at | INTEGER | Unix timestamp |
| processed | BOOLEAN | Processing status flag |

## CORS Configuration

The API allows requests from:

- `http://localhost:3000` - React dev server
- `http://localhost:5173` - Vite dev server
- `https://*.pages.dev` - Cloudflare Pages deployments

Configure additional origins in `wrangler.toml` via the `CORS_ORIGINS` variable.

## TypeScript Types

All endpoints use Zod schemas for validation:

- `createJobSchema`: Validates job creation
- `updateJobSchema`: Validates job updates
- `webhookPayloadSchema`: Validates webhook callbacks

## Error Handling

The API returns standard HTTP status codes:

- `200`: Success
- `201`: Created
- `204`: No content (OPTIONS)
- `400`: Validation error
- `404`: Not found
- `500`: Server error

All error responses include an `error` field with a description.
