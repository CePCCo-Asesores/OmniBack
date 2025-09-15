// src/db/connection.ts
import { Pool } from "pg";

/**
 * Crea un Pool leyendo variables de entorno.
 * Mantiene compatibilidad con código existente exportando:
 *  - createPool()
 *  - db  (alias a pool)
 *  - pool (instancia única)
 */
export function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL/POSTGRES_URL is not set");
  }

  const ssl =
    process.env.DB_SSL?.toLowerCase() === "true"
      ? { rejectUnauthorized: false }
      : undefined;

  return new Pool({
    connectionString,
    ssl
  });
}

// Instancia única para toda la app
export const pool: Pool = createPool();

// Alias para compatibilidad con imports antiguos: import { db } from "./connection";
export const db: Pool = pool;
