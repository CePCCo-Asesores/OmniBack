import jwt from 'jsonwebtoken';

export type Claims = {
  sub: string;               // id del proveedor (Google profile.id)
  provider: 'google' | string;
  email?: string;
  name?: string;
  picture?: string;
  roles?: string[];
  [k: string]: any;          // espacio para metadata futura
};

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

const JWT_SECRET = requireEnv('JWT_SECRET');
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Firma un JWT con los claims completos del usuario (no solo el id).
 */
export function createToken(claims: Claims): string {
  // Por seguridad, evita sobreescribir 'exp' si llega desde fuera
  const { exp, iat, nbf, ...safeClaims } = claims as any;
  return jwt.sign(safeClaims, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verifica y decodifica un JWT, devolviendo los claims.
 * Lanza si es inválido o expiró.
 */
export function verifyToken(token: string): Claims {
  return jwt.verify(token, JWT_SECRET) as Claims;
}

/**
 * Intenta extraer el Bearer token de un header Authorization estándar.
 * Devuelve null si no existe o no tiene el formato correcto.
 */
export function getBearerToken(authHeader?: string | null): string | null {
  if (!authHeader) return null;
  if (!authHeader.toLowerCase().startsWith('bearer ')) return null;
  return authHeader.slice(7).trim();
}
