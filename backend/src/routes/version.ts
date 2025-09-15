import { Router, Request, Response } from 'express';

export const router = Router();

/**
 * GET /version
 * Devuelve la versión y commit del despliegue.
 * Usa variables de entorno para no depender de resolveJsonModule en TS.
 */
router.get('/', (_req: Request, res: Response) => {
  res.json({
    version: process.env.APP_VERSION || process.env.npm_package_version || '0.0.0',
    gitSha: process.env.GIT_SHA || 'unknown',
    buildTime: process.env.BUILD_TIME || 'unknown',
  });
});
