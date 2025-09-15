import { Router, Request, Response } from 'express';
import { Pool } from 'pg';

const startedAt = new Date();
export const router = Router();

function getPool(): Pool | null {
  try {
    const url = process.env.DATABASE_URL;
    if (!url) return null;
    return new Pool({ connectionString: url, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined });
  } catch {
    return null;
  }
}

router.get('/', async (_req: Request, res: Response) => {
  const uptimeSec = Math.floor(process.uptime());
  const payload: any = {
    status: 'ok',
    service: process.env.SERVICE_NAME || 'omni-back',
    env: process.env.NODE_ENV || 'development',
    startedAt: startedAt.toISOString(),
    now: new Date().toISOString(),
    uptimeSec,
  };

  // Chequeo DB (si hay DATABASE_URL)
  const pool = getPool();
  if (pool) {
    try {
      const r = await pool.query('SELECT 1');
      payload.db = r?.rowCount === 1 ? 'ok' : 'fail';
    } catch {
      payload.db = 'fail';
    } finally {
      await pool.end().catch(() => void 0);
    }
  } else {
    payload.db = 'skipped';
  }

  return res.json(payload);
});
