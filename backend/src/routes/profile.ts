import { Router, Request, Response } from 'express';

export const router = Router();

/**
 * GET /profile
 * Devuelve la configuración visible de la instancia/branding/UI
 * (basado en lo que ya manejas en resolveUI/engine/profiles en tu repo).
 */
router.get('/', (_req: Request, res: Response) => {
  const instanceName = process.env.INSTANCE_NAME || 'default';
  const brand = process.env.BRAND_NAME || 'OmniBack';
  const publicUrl = process.env.PUBLIC_URL || '';
  const backendUrl = process.env.BACKEND_URL || '';
  const allowed = process.env.ALLOWED_ORIGIN?.split(',').map(s => s.trim()) || [];

  return res.json({
    instance: instanceName,
    brand,
    urls: { publicUrl, backendUrl },
    allowedOrigins: allowed,
    features: {
      googleAuth: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
  });
});
