// src/middleware/requireRole.ts
import { Request, Response, NextFunction } from 'express';
export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    const has = (user?.roles || []).some((r: string) => roles.includes(r));
    if (!has) return res.status(403).json({ error: 'forbidden' });
    next();
  };
}
