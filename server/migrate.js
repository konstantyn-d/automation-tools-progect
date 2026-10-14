// Applies db/migrations/*.sql in order, each once, each in its own transaction.
// Run: npm run db:migrate
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import pg from 'pg';

const dir = new URL('../db/migrations/', import.meta.url);
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
  name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`);

const done = new Set((await client.query('SELECT name FROM schema_migrations')).rows.map((r) => r.name));
const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();

for (const file of files) {
  if (done.has(file)) continue;
  const sql = await readFile(join(dir.pathname.replace(/^\/([A-Z]:)/, '$1'), file), 'utf8');
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
    await client.query('COMMIT');
    console.log(`applied ${file}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`failed ${file}: ${err.message}`);
    process.exitCode = 1;
    break;
  }
}
await client.end();
