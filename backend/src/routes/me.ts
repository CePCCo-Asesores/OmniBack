import { Router, Request, Response } from 'express';
import { verifyToken } from '../auth/session'; // <-- corregido: antes apuntaba a ../utils/jwt (no existe)

export const router = Router();

/**
 * GET /me
 * Lee el Bearer token, lo verifica y devuelve los claims mínimos.
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.substring(7) : null;
    if (!token) {
      return res.status(401).json({ error: 'Missing bearer token' });
    }
    const payload = verifyToken(token);
    return res.json({ user: payload });
  } catch (e: any) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
});
