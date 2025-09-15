// src/auth/session.ts
import jwt, { Secret, SignOptions } from "jsonwebtoken";

/** Payload del access token */
export type AccessTokenPayload = {
  sub: string;           // user id
  email?: string;
  name?: string;
  [k: string]: any;
};

/**
 * El tipo que jsonwebtoken acepta para expiresIn NO es "string" genérico,
 * sino un "StringValue" (p.ej. "1h", "30m", "7d") o number (segundos).
 */
export type Expires =
  | number
  | `${number}ms`
  | `${number}s`
  | `${number}m`
  | `${number}h`
  | `${number}d`;

const JWT_SECRET: Secret = (process.env.JWT_SECRET || "change_me_in_prod") as Secret;

/**
 * Crea un JWT de acceso con typing compatible con jsonwebtoken@9.
 */
export function createAccessToken(
  payload: AccessTokenPayload,
  expiresIn: Expires = "1h"
): string {
  const options: SignOptions = { expiresIn };
  // Forzamos el overload correcto pasando options tipado.
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
 * Extrae el token Bearer de un request (Authorization o query ?token=).
 * Mantengo la firma “request-like” para evitar depender de tipos de Express aquí.
 */
export function getBearerToken(req: { headers?: any; query?: any }): string | null {
  const auth = req?.headers?.authorization as string | undefined;
  if (auth && /^Bearer\s+/i.test(auth)) {
    return auth.replace(/^Bearer\s+/i, "").trim();
  }
  const q = req?.query?.token as string | undefined;
  return q ? String(q) : null;
}

/** Alias para compatibilidad con código que importe verifyToken */***
