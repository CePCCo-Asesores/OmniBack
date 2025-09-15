import { db } from './connection';

/**
 * Inserta un registro en la tabla especificada.
 */
export const insert = async (table: string, fields: Record<string, any>) => {
  const keys = Object.keys(fields);
  const values = Object.values(fields);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
  await db.query(query, values);
};

/**
 * Ejecuta una consulta SQL con parámetros.
 */
export const query = async (sql: string, params: any[] = []) => {
  const result = await db.query(sql, params);
  return result.rows;
};

