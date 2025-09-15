import { Router, Request, Response } from 'express';

const startedAt = new Date();

export const router = Router();

/**
 * GET /health
 * Respuesta simple de salud del servicio.
 * Si deseas incluir chequeo de DB, agrega aquí tu pool y un SELECT 1.
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const uptimeSec = Math.floor(process.uptime());

    // Si quieres checar DB, descomenta e integra tu pool:
    // let db = 'skipped';
    // try {
    //   const { rows } = await pool.query('SELECT 1');
    //   db = rows?.length === 1 ? 'ok' : 'fail';
    // } catch {
    //   db = 'fail';
    // }

    res.json({
      status: 'ok',
      service: process.env.SERVICE_NAME || 'omni-back',
      env: process.env.NODE_ENV || 'development',
      pid: process.pid,
      startedAt: startedAt.toISOString(),
      now: now.toISOString(),
      uptimeSec,
      // db,
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', error: err?.message || 'unknown' });
  }
});
