import 'dotenv/config';
import { readFileSync } from 'fs';
import path from 'path';
import { Client } from 'pg';

async function run() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  // __dirname en runtime = dist/scripts
  const sqlDir = path.resolve(__dirname, '../../sql');

  const files = [
    '001_init.sql',
    '002_multitenant.sql',
  ];

  const client = new Client({ connectionString: databaseUrl, ssl: getSSL() });

  try {
    console.log('[migrate] Connecting to DB...');
    await client.connect();

    for (const file of files) {
      const filePath = path.join(sqlDir, file);
      console.log(`[migrate] Executing ${file} ...`);
      const sql = readFileSync(filePath, 'utf8');
      await client.query(sql);
      console.log(`[migrate] OK: ${file}`);
    }

    console.log('[migrate] All migrations executed successfully.');
  } finally {
    await client.end().catch(() => {});
  }
}

function getSSL() {
  // Render Postgres suele requerir SSL. Si tu instancia no lo requiere, puedes devolver false.
  // Dejamos flexible: usa ?sslmode=require o fuerza aquí.
  if (process.env.PGSSL === 'disable') return false;
  return { rejectUnauthorized: false };
}

run().catch((err) => {
  console.error('[migrate] FAILED:', err);
  process.exit(1);
});
