import { Router, Request, Response } from 'express';
import { Pool } from 'pg';

export const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const url = process.env.DATABASE_URL;
  if (!url) return res.json({ status: 'ready', db: 'skipped' });

  const pool = new Pool({ connectionString: url, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined });

  try {
    const r = await pool.query('SELECT 1');
    if (r?.rowCount === 1) {
      return res.json({ status: 'ready', db: 'ok' });
    }
    return res.status(503).json({ status: 'not_ready', db: 'fail' });
  } catch (e: any) {
    return res.status(503).json({ status: 'not_ready', db: 'fail', error: e?.message || 'db_error' });
  } finally {
    await pool.end().catch(() => void 0);
  }
});
