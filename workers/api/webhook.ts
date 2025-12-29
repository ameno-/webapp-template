import { Hono } from 'hono';
import { z } from 'zod';

type Bindings = {
  DB: D1Database;
};

export const webhookRouter = new Hono<{ Bindings: Bindings }>();

// Validation schema for webhook payload
const webhookPayloadSchema = z.object({
  job_id: z.string(),
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  result_data: z.any().optional(),
  error: z.string().optional(),
});

// Helper function to serialize data
function serializeData(data: any): string | null {
  if (data === null || data === undefined) return null;
  return typeof data === 'string' ? data : JSON.stringify(data);
}

// POST /api/webhook/callback - Handle sidecar callbacks
webhookRouter.post('/callback', async (c) => {
  try {
    const body = await c.req.json();
    const validated = webhookPayloadSchema.parse(body);

    const now = Date.now();

    // Log the webhook for debugging
    const headers = JSON.stringify(Object.fromEntries(c.req.raw.headers));
    await c.env.DB.prepare(
      `INSERT INTO webhook_logs (job_id, payload, headers, received_at, processed)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(
      validated.job_id,
      JSON.stringify(body),
      headers,
      now,
      0
    ).run();

    // Check if job exists
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM jobs WHERE id = ?'
    ).bind(validated.job_id).all();

    if (results.length === 0) {
      return c.json({ error: 'Job not found' }, 404);
    }

    // Update job status
    const updates: string[] = ['status = ?', 'updated_at = ?'];
    const bindings: any[] = [validated.status, now];

    if (validated.status === 'running') {
      updates.push('started_at = ?');
      bindings.push(now);
    } else if (validated.status === 'completed' || validated.status === 'failed') {
      updates.push('completed_at = ?');
      bindings.push(now);
    }

    if (validated.result_data !== undefined) {
      updates.push('result_data = ?');
      bindings.push(serializeData(validated.result_data));
    }

    if (validated.error !== undefined) {
      updates.push('error = ?');
      bindings.push(validated.error);
    }

    bindings.push(validated.job_id);

    await c.env.DB.prepare(
      `UPDATE jobs SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...bindings).run();

    // Mark webhook as processed
    await c.env.DB.prepare(
      `UPDATE webhook_logs SET processed = 1
       WHERE job_id = ? AND received_at = ?`
    ).bind(validated.job_id, now).run();

    return c.json({
      success: true,
      message: 'Webhook processed successfully',
      job_id: validated.job_id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation error', details: error.errors }, 400);
    }
    console.error('Error processing webhook:', error);
    return c.json({ error: 'Failed to process webhook' }, 500);
  }
});

// GET /api/webhook/logs - Get webhook logs (for debugging)
webhookRouter.get('/logs', async (c) => {
  try {
    const limit = Number(c.req.query('limit')) || 50;
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM webhook_logs ORDER BY received_at DESC LIMIT ?'
    ).bind(limit).all();

    const logs = results.map((log: any) => ({
      ...log,
      payload: JSON.parse(log.payload),
      headers: JSON.parse(log.headers),
    }));

    return c.json({ logs });
  } catch (error) {
    console.error('Error fetching webhook logs:', error);
    return c.json({ error: 'Failed to fetch webhook logs' }, 500);
  }
});

// GET /api/webhook/logs/:job_id - Get webhook logs for a specific job
webhookRouter.get('/logs/:job_id', async (c) => {
  try {
    const jobId = c.req.param('job_id');
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM webhook_logs WHERE job_id = ? ORDER BY received_at DESC'
    ).bind(jobId).all();

    const logs = results.map((log: any) => ({
      ...log,
      payload: JSON.parse(log.payload),
      headers: JSON.parse(log.headers),
    }));

    return c.json({ logs });
  } catch (error) {
    console.error('Error fetching webhook logs:', error);
    return c.json({ error: 'Failed to fetch webhook logs' }, 500);
  }
});
