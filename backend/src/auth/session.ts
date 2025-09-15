// src/auth/session.ts
import jwt, { Secret } from "jsonwebtoken";

/**
 * Payload básico del access token.
 * Agrega aquí los campos que uses (orgId, roles, etc.).
 */
export type AccessTokenPayload = {
  sub: string;           // user id
  email?: string;
  name?: string;
  [k: string]: any;
};

const JWT_SECRET: Secret = (process.env.JWT_SECRET || "change_me_in_prod") as Secret;

/**
 * Crea un JWT de acceso.
 * NOTA: expiresIn debe ser string o number compatible con jsonwebtoken (ej: "1h", 3600).
 */
export function createAccessToken(
  payload: AccessTokenPayload,
  expiresIn: string | number = "1h"
): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Verifica y decodifica el access token. Devuelve null si es inválido/expirado.
 */
export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AccessTokenPayload;
  } catch {
    return null;
  }
}

/**
 * Extrae el token Bearer del request. No imponemos tipos de Express para evitar dependencias aquí.
 * Busca en Authorization: Bearer <token> o en query ?token=<...>
 */
export function getBearerToken(req: { headers?: any; query?: any }): string | null {
  const auth = req?.headers?.authorization as string | undefined;
  if (auth && /^Bearer\s+/i.test(auth)) {
    return auth.replace(/^Bearer\s+/i, "").trim();
  }
  const q = req?.query?.token as string | undefined;
  return q ? String(q) : null;
}
