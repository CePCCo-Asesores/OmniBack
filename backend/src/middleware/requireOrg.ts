// src/middleware/requireOrg.ts
import { Request, Response, NextFunction } from "express";
import {
  getBearerToken,
  verifyAccessToken,
  AccessTokenPayload,
} from "../auth/session";

type Claims = AccessTokenPayload & {
  orgId?: string;
  orgRole?: string;
  role?: string;
  roles?: string[];
  orgRoles?: Record<string, string>;
  isOrgAdmin?: boolean;
};

// --- Helpers --- //
function extractClaims(req: Request, res: Response): Claims | null {
  const token = getBearerToken(req);
  if (!token) {
    res.status(401).json({ error: "No token" });
    return null;
  }
  const claims = verifyAccessToken(token) as Claims | null;
  if (!claims) {
    res.status(401).json({ error: "Invalid token" });
    return null;
  }
  return claims;
}

function ensureOrg(claims: Claims, res: Response): string | null {
  const orgId =
    claims.orgId ||
    (claims as any)?.org?.id ||
    (claims as any)?.organizationId ||
    (claims as any)?.organisationId;

  if (!orgId) {
    res.status(403).json({ error: "Org required" });
    return null;
  }
  return String(orgId);
}

function isAdminForOrg(claims: Claims, orgId: string): boolean {
  if (claims.isOrgAdmin === true) return true;
  if (claims.orgId === orgId && claims.orgRole === "admin") return true;
  if (claims.role === "admin") return true;
  if (Array.isArray(claims.roles) && claims.roles.includes("admin")) return true;
  if (claims.orgRoles && claims.orgRoles[orgId] === "admin") return true;
  return false;
}

function isMemberForOrg(claims: Claims, orgId: string): boolean {
  if (claims.orgId === orgId) return true;
  if (claims.orgRoles && typeof claims.orgRoles[orgId] === "string") return true;
  if (claims.orgRole && claims.orgId === orgId) return true;
  return false;
}

// --- Middlewares --- //
export function requireOrg(req: Request, res: Response, next: NextFunction) {
  const claims = extractClaims(req, res);
  if (!claims) return;

  const orgId = ensureOrg(claims, res);
  if (!orgId) return;

  (req as any).user = claims;
  (req as any).orgId = orgId;
  next();
}

export function requireOrgMember(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const claims = extractClaims(req, res);
  if (!claims) return;

  const orgId = ensureOrg(claims, res);
  if (!orgId) return;

  if (!isMemberForOrg(claims, orgId)) {
    res.status(403).json({ error: "Org membership required" });
    return;
  }

  (req as any).user = claims;
  (req as any).orgId = orgId;
  next();
}

export function requireOrgAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const claims = extractClaims(req, res);
  if (!claims) return;

  const orgId = ensureOrg(claims, res);
  if (!orgId) return;

  if (!isAdminForOrg(claims, orgId)) {
    res.status(403).json({ error: "Admin role required" });
    return;
  }

  (req as any).user = claims;
  (req as any).orgId = orgId;
  next();
}

// Default export para compatibilidad
export default requireOrg;
