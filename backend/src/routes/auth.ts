import { Router, Request, Response } from 'express';
import { verifyRefreshToken, rotateRefreshToken, revokeRefreshToken, findUserById } from '../models/user';
import { createAccessToken } from '../auth/session';

const router = Router();

/**
 * POST /auth/refresh
 * Lee cookie 'rt' (refresh token opaco), valida y rota → devuelve nuevo access token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  const rt = (req as any).cookies?.rt as string | undefined;
  if (!rt) return res.status(401).json({ error: 'missing_refresh_token' });

  const check = await verifyRefreshToken(rt);
  if (!check.valid || !check.userId) {
    res.clearCookie('rt', { path: '/' });
    return res.status(401).json({ error: 'invalid_refresh_token' });
  }

  const user = await findUserById(check.userId);
  if (!user) {
    res.clearCookie('rt', { path: '/' });
    return res.status(401).json({ error: 'user_not_found' });
  }

  // Rota el refresh y emite uno nuevo
  const ttlMs = Number(process.env.REFRESH_TOKEN_TTL_MS || 1000 * 60 * 60 * 24 * 7);
  const newRefresh = await rotateRefreshToken(
    rt,
    user.id,
    ttlMs,
    req.get('user-agent') || undefined,
    (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || undefined
  );

  res.cookie('rt', newRefresh, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: ttlMs,
    path: '/',
  });

  const claims = {
    sub: user.id,
    email: user.email,
    name: user.name,
    picture: user.picture,
    roles: user.roles || ['user'],
    provider: 'google',
  };
  const access = createAccessToken(claims, process.env.ACCESS_TOKEN_TTL || '15m');

  return res.json({ token: access });
});

/**
 * POST /auth/logout
 * Revoca el refresh token actual (si existe) y limpia cookie
 */
router.post('/logout', async (req: Request, res: Response) => {
  const rt = (req as any).cookies?.rt as string | undefined;
  if (rt) {
    const userId = (req as any).user?.sub as string | undefined; // si montas middleware de auth, úsalo
    if (userId) {
      await revokeRefreshToken(rt, userId).catch(() => void 0);
    }
  }
  res.clearCookie('rt', { path: '/' });
  return res.json({ ok: true });
});

export default router;
