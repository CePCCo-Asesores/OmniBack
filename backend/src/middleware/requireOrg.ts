import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, getBearerToken } from '../auth/session';
import { userRoleInOrg } from '../models/org';

export function requireOrgMember() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = getBearerToken(req.headers.authorization || null);
      if (!token) return res.status(401).json({ error: 'unauthorized' });
      const claims = verifyAccessToken(token);
      (req as any).user = claims;

      const orgId = (req.params.orgId || req.body.orgId || req.query.orgId) as string;
      if (!orgId) return res.status(400).json({ error: 'missing_org' });

      const role = await userRoleInOrg(orgId, claims.sub);
      if (!role) return res.status(403).json({ error: 'forbidden' });

      (req as any).orgId = orgId;
      (req as any).orgRole = role;
      next();
    } catch {
      return res.status(401).json({ error: 'unauthorized' });
    }
  };
}

export function requireOrgAdmin() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const base = requireOrgMember();
    await base(req, res, (err?: any) => {
      if (err) return next(err);
      const role = (req as any).orgRole as string;
      if (role !== 'admin') return res.status(403).json({ error: 'forbidden_admin_only' });
      next();
    });
  };
}
