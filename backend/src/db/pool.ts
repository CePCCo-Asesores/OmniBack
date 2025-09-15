// src/db/pool.ts
import { QueryResult, QueryResultRow } from "pg";
import { createPool, pool } from "./connection";

// Re-export para compatibilidad
export { createPool, pool };

/**
 * Helper de consulta con tipado correcto.
 * T debe extender QueryResultRow para que encaje con las defs de pg.
 */
export function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}
