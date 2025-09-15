// src/middleware/requireAuth.ts
import { Request, Response, NextFunction } from 'express';
import { getBearerToken, verifyAccessToken } from '../auth/session';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = getBearerToken(req.headers.authorization || null);
    if (!token) return res.status(401).json({ error: 'unauthorized' });
    const claims = verifyAccessToken(token);
    (req as any).user = claims;
    return next();
  } catch {
    return res.status(401).json({ error: 'unauthorized' });
  }
}
