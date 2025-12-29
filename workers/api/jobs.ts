import { Hono } from 'hono';
import { z } from 'zod';

type Bindings = {
  DB: D1Database;
};

export const jobsRouter = new Hono<{ Bindings: Bindings }>();

// Validation schemas
const createJobSchema = z.object({
  type: z.string().min(1),
  input_data: z.any().optional(),
});

const updateJobSchema = z.object({
  status: z.enum(['pending', 'running', 'completed', 'failed']).optional(),
  result_data: z.any().optional(),
  error: z.string().optional(),
});

// Helper function to generate unique ID
function generateId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper function to serialize data
function serializeData(data: any): string | null {
  if (data === null || data === undefined) return null;
  return typeof data === 'string' ? data : JSON.stringify(data);
}

// Helper function to deserialize data
function deserializeData(data: string | null): any {
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
}

// GET /api/jobs - List all jobs (supports ?status=pending filter)
jobsRouter.get('/', async (c) => {
  try {
    const status = c.req.query('status');
    const limit = Number(c.req.query('limit')) || 100;

    let query = 'SELECT * FROM jobs';
    const bindings: any[] = [];

    if (status) {
      query += ' WHERE status = ?';
      bindings.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    bindings.push(limit);

    const { results } = await c.env.DB.prepare(query).bind(...bindings).all();

    const jobs = results.map((job: any) => ({
      ...job,
      input_data: deserializeData(job.input_data),
      result_data: deserializeData(job.result_data),
    }));

    return c.json({ jobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return c.json({ error: 'Failed to fetch jobs' }, 500);
  }
});

// GET /api/jobs/:id - Get a specific job
jobsRouter.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM jobs WHERE id = ?'
    ).bind(id).all();

    if (results.length === 0) {
      return c.json({ error: 'Job not found' }, 404);
    }

    const job = results[0] as any;
    return c.json({
      job: {
        ...job,
        input_data: deserializeData(job.input_data),
        result_data: deserializeData(job.result_data),
      },
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    return c.json({ error: 'Failed to fetch job' }, 500);
  }
});

// POST /api/jobs - Create a new job
jobsRouter.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const validated = createJobSchema.parse(body);

    const id = generateId();
    const now = Date.now();

    await c.env.DB.prepare(
      `INSERT INTO jobs (id, status, type, input_data, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      'pending',
      validated.type,
      serializeData(validated.input_data),
      now,
      now
    ).run();

    return c.json({
      job: {
        id,
        status: 'pending',
        type: validated.type,
        input_data: validated.input_data,
        result_data: null,
        error: null,
        created_at: now,
        updated_at: now,
        started_at: null,
        completed_at: null,
      },
    }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation error', details: error.errors }, 400);
    }
    console.error('Error creating job:', error);
    return c.json({ error: 'Failed to create job' }, 500);
  }
});

// PUT /api/jobs/:id - Update a job
jobsRouter.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const validated = updateJobSchema.parse(body);

    // Check if job exists
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM jobs WHERE id = ?'
    ).bind(id).all();

    if (results.length === 0) {
      return c.json({ error: 'Job not found' }, 404);
    }

    const now = Date.now();
    const updates: string[] = ['updated_at = ?'];
    const bindings: any[] = [now];

    if (validated.status !== undefined) {
      updates.push('status = ?');
      bindings.push(validated.status);

      if (validated.status === 'running') {
        updates.push('started_at = ?');
        bindings.push(now);
      } else if (validated.status === 'completed' || validated.status === 'failed') {
        updates.push('completed_at = ?');
        bindings.push(now);
      }
    }

    if (validated.result_data !== undefined) {
      updates.push('result_data = ?');
      bindings.push(serializeData(validated.result_data));
    }

    if (validated.error !== undefined) {
      updates.push('error = ?');
      bindings.push(validated.error);
    }

    bindings.push(id);

    await c.env.DB.prepare(
      `UPDATE jobs SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...bindings).run();

    // Fetch updated job
    const { results: updatedResults } = await c.env.DB.prepare(
      'SELECT * FROM jobs WHERE id = ?'
    ).bind(id).all();

    const job = updatedResults[0] as any;
    return c.json({
      job: {
        ...job,
        input_data: deserializeData(job.input_data),
        result_data: deserializeData(job.result_data),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation error', details: error.errors }, 400);
    }
    console.error('Error updating job:', error);
    return c.json({ error: 'Failed to update job' }, 500);
  }
});

// DELETE /api/jobs/:id - Delete a job
jobsRouter.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    // Check if job exists
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM jobs WHERE id = ?'
    ).bind(id).all();

    if (results.length === 0) {
      return c.json({ error: 'Job not found' }, 404);
    }

    await c.env.DB.prepare('DELETE FROM jobs WHERE id = ?').bind(id).run();

    return c.json({ success: true, message: 'Job deleted' });
  } catch (error) {
    console.error('Error deleting job:', error);
    return c.json({ error: 'Failed to delete job' }, 500);
  }
});
