import jwt from 'jsonwebtoken';

export type Claims = {
  sub: string;               // user.id interno (NO el id de Google)
  email?: string;
  name?: string;
  picture?: string;
  roles?: string[];
  provider?: 'google' | string;
  iss?: string;
  aud?: string;
  [k: string]: any;
};

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

const JWT_SECRET = requireEnv('JWT_SECRET');

export function createAccessToken(claims: Claims, expiresIn: string = '15m'): string {
  const { exp, iat, nbf, ...safe } = claims as any;
  const base = { ...safe, iss: 'omni-back', aud: 'omni-frontend' };
  return jwt.sign(base, JWT_SECRET, { expiresIn });
}

export function verifyAccessToken(token: string): Claims {
  return jwt.verify(token, JWT_SECRET) as Claims;
}

export function getBearerToken(authHeader?: string | null): string | null {
  if (!authHeader) return null;
  if (!authHeader.toLowerCase().startsWith('bearer ')) return null;
  return authHeader.slice(7).trim();
}
