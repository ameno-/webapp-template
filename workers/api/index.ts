import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jobsRouter } from './jobs';
import { webhookRouter } from './webhook';

type Bindings = {
  DB: D1Database;
  PROJECT_NAME: string;
  TOOL_NAME: string;
  CORS_ORIGINS: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS middleware
app.use('*', async (c, next) => {
  const corsOrigins = c.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173';
  const allowedOrigins = corsOrigins.split(',').map((origin) => origin.trim());

  const origin = c.req.header('Origin') || '';

  // Check if origin matches any allowed pattern (supporting wildcards)
  const isAllowed = allowedOrigins.some((allowed) => {
    if (allowed.includes('*')) {
      const pattern = allowed.replace(/\*/g, '.*');
      return new RegExp(`^${pattern}$`).test(origin);
    }
    return allowed === origin;
  });

  if (isAllowed) {
    c.header('Access-Control-Allow-Origin', origin);
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    c.header('Access-Control-Max-Age', '86400');
  }

  if (c.req.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  await next();
});

// Health check
app.get('/', (c) => {
  const projectName = c.env.PROJECT_NAME || 'webapp-template';
  const toolName = c.env.TOOL_NAME || 'webapp-tool';

  return c.json({
    status: 'ok',
    project: projectName,
    tool: toolName,
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.route('/api/jobs', jobsRouter);
app.route('/api/webhook', webhookRouter);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json(
    {
      error: 'Internal server error',
      message: err.message,
    },
    500
  );
});

export default app;
