// src/auth/session.ts
import jwt, { Secret, SignOptions } from "jsonwebtoken";

/** Payload del access token */
export type AccessTokenPayload = {
  sub: string;           // user id
  email?: string;
  name?: string;
  [k: string]: any;
};

const JWT_SECRET: Secret = (process.env.JWT_SECRET || "change_me_in_prod");

/**
 * Crea un JWT de acceso. `expiresIn` puede ser "1h", "30m", 3600, etc.
 * Forzamos el tipo en las options para que seleccione el overload correcto.
 */
export function createAccessToken(
  payload: AccessTokenPayload,
  expiresIn: string | number = "1h"
): string {
  const options: SignOptions = { expiresIn: expiresIn as any };
  return jwt.sign(payload as object, JWT_SECRET, options);
}

/** Verifica y decodifica el token. Devuelve null si es inválido/expirado. */
export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AccessTokenPayload;
  } catch {
    return null;
  }
}

/**
 * Extrae el token Bearer del request (Authorization o query ?token=).
 * Firma “request-like” para no depender de tipos de Express aquí.
 */
export function getBearerToken(req: { headers?: any; query?: any }): string | null {
  const auth = req?.headers?.authorization as string | undefined;
  if (auth && /^Bearer\s+/i.test(auth)) {
    return auth.replace(/^Bearer\s+/i, "").trim();
  }
  const q = req?.query?.token as string | undefined;
  return q ? String(q) : null;
}

/** Alias para compatibilidad con código que importe verifyToken */
export const verifyToken = verifyAccessToken;
