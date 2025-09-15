// src/middleware/requireOrg.ts
import { Request, Response, NextFunction } from "express";
import { getBearerToken, verifyAccessToken, AccessTokenPayload } from "../auth/session";

export default function requireOrg(req: Request, res: Response, next: NextFunction) {
  const token = getBearerToken(req);
  if (!token) return res.status(401).json({ error: "No token" });

  const claims = verifyAccessToken(token) as AccessTokenPayload | null;
  if (!claims) return res.status(401).json({ error: "Invalid token" });

  if (!(claims as any).orgId) return res.status(403).json({ error: "Org required" });

  (req as any).user = claims;
  next();
}
