import { randomUUID, createHash, randomBytes } from 'crypto';
import { query } from '../db/pool';

export type User = {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  roles?: string[];
  last_login_at?: string;
};

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function upsertUserFromGoogle(opts: {
  googleId: string;
  email: string;
  name?: string;
  picture?: string;
}): Promise<User> {
  const { googleId, email, name, picture } = opts;

  // 1) Asegurar usuario por email
  let user = await findUserByEmail(email);
  if (!user) {
    const id = randomUUID();
    await query(
      `INSERT INTO users (id, email, name, picture) VALUES ($1, $2, $3, $4)`,
      [id, email, name || null, picture || null]
    );
    user = { id, email, name: name || undefined, picture: picture || undefined, roles: ['user'] };
  } else {
    await query(`UPDATE users SET name=$1, picture=$2, updated_at=NOW() WHERE id=$3`, [
      name || null,
      picture || null,
      user.id,
    ]);
  }

  // 2) Asegurar cuenta por proveedor
  const acc = await query<{ id: string }>(
    `SELECT id FROM accounts WHERE provider=$1 AND provider_id=$2`,
    ['google', googleId]
  );
  if (acc.rows.length === 0) {
    await query(
      `INSERT INTO accounts (id, user_id, provider, provider_id) VALUES ($1, $2, $3, $4)`,
      [randomUUID(), user.id, 'google', googleId]
    );
  }

  // 3) Marcar último login
  await query(`UPDATE users SET last_login_at=NOW(), updated_at=NOW() WHERE id=$1`, [user.id]);

  // 4) Obtener usuario final con roles
  const final = await query<User>(`SELECT id, email, name, picture, roles, last_login_at FROM users WHERE id=$1`, [
    user.id,
  ]);
  return final.rows[0];
}

export async function findUserById(id: string): Promise<User | null> {
  const r = await query<User>(`SELECT id, email, name, picture, roles, last_login_at FROM users WHERE id=$1`, [id]);
  return r.rows[0] || null;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const r = await query<User>(`SELECT id, email, name, picture, roles, last_login_at FROM users WHERE email=$1`, [
    email,
  ]);
  return r.rows[0] || null;
}

/** Refresh tokens (rotativos) */
export function generateRefreshTokenValue(): string {
  // Token opaco aleatorio (no JWT) → solo guardamos HASH
  return randomBytes(48).toString('hex');
}

export async function storeRefreshToken(params: {
  userId: string;
  tokenValue: string;
  ttlMs: number;
  userAgent?: string;
  ip?: string;
}): Promise<void> {
  const { userId, tokenValue, ttlMs, userAgent, ip } = params;
  const id = randomUUID();
  const token_hash = hashToken(tokenValue);
  const expires_at = new Date(Date.now() + ttlMs).toISOString();
  await query(
    `INSERT INTO refresh_tokens (id, user_id, token_hash, user_agent, ip, expires_at) VALUES ($1, $2, $3, $4, $5, $6)`,
    [id, userId, token_hash, userAgent || null, ip || null, expires_at]
  );
}

export async function rotateRefreshToken(oldValue: string, userId: string, ttlMs: number, ua?: string, ip?: string) {
  const oldHash = hashToken(oldValue);
  await query(`UPDATE refresh_tokens SET revoked=TRUE WHERE user_id=$1 AND token_hash=$2`, [userId, oldHash]);
  const newVal = generateRefreshTokenValue();
  await storeRefreshToken({ userId, tokenValue: newVal, ttlMs, userAgent: ua, ip });
  return newVal;
}

export async function verifyRefreshToken(tokenValue: string): Promise<{ valid: boolean; userId?: string }> {
  const h = hashToken(tokenValue);
  const r = await query<{ user_id: string }>(
    `SELECT user_id FROM refresh_tokens WHERE token_hash=$1 AND revoked=FALSE AND expires_at > NOW() LIMIT 1`,
    [h]
  );
  if (r.rows.length === 0) return { valid: false };
  return { valid: true, userId: r.rows[0].user_id };
}

export async function revokeRefreshToken(tokenValue: string, userId: string): Promise<void> {
  const h = hashToken(tokenValue);
  await query(`UPDATE refresh_tokens SET revoked=TRUE WHERE user_id=$1 AND token_hash=$2`, [userId, h]);
}
