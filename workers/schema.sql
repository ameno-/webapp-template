-- Jobs table for tracking async operations
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK(status IN ('pending', 'running', 'completed', 'failed')),
  type TEXT NOT NULL,
  input_data TEXT,
  result_data TEXT,
  error TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  started_at INTEGER,
  completed_at INTEGER
);

-- Index for faster queries by status
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);

-- Index for faster queries by type
CREATE INDEX IF NOT EXISTS idx_jobs_type ON jobs(type);

-- Index for faster queries by created_at
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);

-- Webhook logs table for debugging
CREATE TABLE IF NOT EXISTS webhook_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id TEXT,
  payload TEXT NOT NULL,
  headers TEXT,
  received_at INTEGER NOT NULL,
  processed BOOLEAN DEFAULT 0,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- Index for faster queries by job_id
CREATE INDEX IF NOT EXISTS idx_webhook_logs_job_id ON webhook_logs(job_id);

-- Index for faster queries by received_at
CREATE INDEX IF NOT EXISTS idx_webhook_logs_received_at ON webhook_logs(received_at DESC);
