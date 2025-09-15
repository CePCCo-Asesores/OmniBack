import { insert, query } from '../db/client';

export type UserRecord = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

/**
 * Registra un usuario en la base de datos si no existe.
 */
export const registerUser = async (id: string, email: string, name: string): Promise<UserRecord> => {
  const existing = await getUser(id);
  if (existing) return existing;

  await insert('users', { id, email, name });
  return {
    id,
    email,
    name,
    createdAt: new Date().toISOString()
  };
};

/**
 * Obtiene un usuario por ID desde la base de datos.
 */
export const getUser = async (id: string): Promise<UserRecord | null> => {
  const result = await query('SELECT * FROM users WHERE id = $1', [id]);
  return result[0] || null;
};
