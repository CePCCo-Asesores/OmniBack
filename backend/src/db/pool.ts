// src/db/pool.ts
import { Pool, QueryResult } from "pg";
import { createPool, pool } from "./connection";

// Re-export para compatibilidad con imports que usen createPool/pool
export { createPool, pool };

// Helper opcional que muchos módulos suelen importar: { query } desde "../db/pool"
export function query<T = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}
