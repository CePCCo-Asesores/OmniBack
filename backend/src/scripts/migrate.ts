import { pool } from "../db/pool";

async function main() {
  // Ejemplo simple de migración idempotente
  await pool.query(`
    CREATE TABLE IF NOT EXISTS system_migrations (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);
  console.log("Migrations table ensured.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Migration error:", err);
    process.exit(1);
  });
