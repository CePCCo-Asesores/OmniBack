// src/middleware/requireAuth.ts
import { Request, Response, NextFunction } from "express";
import {
  getBearerToken,
  verifyAccessToken,
  AccessTokenPayload
} from "../auth/session";

export default function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Pásale el request completo a getBearerToken (no un string)
  const token = getBearerToken(req);
  if (!token) return res.status(401).json({ error: "No token" });

  const claims = verifyAccessToken(token) as AccessTokenPayload | null;
  if (!claims) return res.status(401).json({ error: "Invalid token" });

  (req as any).user = claims;
  next();
}
