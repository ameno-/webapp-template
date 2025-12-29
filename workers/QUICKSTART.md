# Quick Start Guide

Get the Workers API up and running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- Cloudflare account (for deployment)

## Local Development Setup

### 1. Install Dependencies

```bash
cd workers
npm install
```

### 2. Create Local D1 Database

```bash
# Create the database locally
npx wrangler d1 create webapp-template-db

# You'll see output like:
# database_id = "abc123-def456-ghi789"
# Copy this ID!
```

### 3. Update Configuration

Edit `wrangler.toml` and replace `your-database-id-here` with your actual database ID:

```toml
[[d1_databases]]
binding = "DB"
database_name = "webapp-template-db"
database_id = "abc123-def456-ghi789"  # <-- Your actual ID here
```

### 4. Run Database Migration

```bash
# Apply schema to local database
npm run db:migrate:local
```

### 5. Start Development Server

```bash
npm run dev
```

The API will be available at http://localhost:8787

## Test the API

### Health Check

```bash
curl http://localhost:8787/
```

Expected response:
```json
{
  "status": "ok",
  "project": "webapp-template",
  "tool": "webapp-tool",
  "timestamp": "2024-05-12T12:00:00.000Z"
}
```

### Create a Job

```bash
curl -X POST http://localhost:8787/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "type": "test_job",
    "input_data": {"message": "Hello World"}
  }'
```

Expected response:
```json
{
  "job": {
    "id": "job_1234567890_xyz",
    "status": "pending",
    "type": "test_job",
    "input_data": {"message": "Hello World"},
    "result_data": null,
    "error": null,
    "created_at": 1234567890,
    "updated_at": 1234567890,
    "started_at": null,
    "completed_at": null
  }
}
```

### List Jobs

```bash
curl http://localhost:8787/api/jobs
```

### Get Specific Job

```bash
curl http://localhost:8787/api/jobs/job_1234567890_xyz
```

### Update Job Status

```bash
curl -X PUT http://localhost:8787/api/jobs/job_1234567890_xyz \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "result_data": {"output": "Success!"}
  }'
```

## Production Deployment

### 1. Deploy to Cloudflare Workers

```bash
npm run deploy
```

### 2. Run Production Migration

```bash
npm run db:migrate
```

### 3. Test Production API

Your API will be available at:
`https://webapp-template-api.your-account.workers.dev`

## Troubleshooting

### Database Not Found

If you get a "database not found" error:

1. Make sure you created the D1 database
2. Verify the database_id in wrangler.toml is correct
3. Run the migration: `npm run db:migrate:local`

### CORS Errors

If you get CORS errors from your frontend:

1. Check that your frontend URL is in the CORS_ORIGINS list in wrangler.toml
2. Make sure the origin matches exactly (including protocol and port)
3. Restart the dev server after changing wrangler.toml

### TypeScript Errors

If you see TypeScript errors:

```bash
# Check for errors
npx tsc --noEmit

# If you see errors, install types
npm install --save-dev @cloudflare/workers-types
```

## Next Steps

- Customize job types for your application
- Add authentication/authorization
- Implement rate limiting
- Add monitoring and logging
- Configure production environment variables

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run db:migrate:local # Apply schema locally

# Production
npm run deploy           # Deploy to Cloudflare
npm run db:migrate       # Apply schema to production

# Database Management
npx wrangler d1 execute webapp-template-db --command "SELECT * FROM jobs"
npx wrangler d1 execute webapp-template-db --local --command "SELECT * FROM jobs"
```

## Environment Variables

Set these in wrangler.toml under `[vars]`:

- `PROJECT_NAME`: Your project identifier
- `TOOL_NAME`: Your tool identifier
- `CORS_ORIGINS`: Comma-separated allowed origins
- `ENVIRONMENT`: dev or production

## Support

For more details, see the main [README.md](./README.md)
