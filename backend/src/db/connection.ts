import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL/POSTGRES_URL is not set");
}

const ssl =
  process.env.DB_SSL?.toLowerCase() === "true"
    ? { rejectUnauthorized: false }
    : undefined;

// ÚNICA instancia exportada
export const pool = new Pool({
  connectionString,
  ssl
});
