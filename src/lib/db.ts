import pg from 'pg';
const { Pool } = pg;

const connectionString =
  process.env.DATABASE_URL ?? process.env.SUPABASE_DB_URL;

const pool = new Pool({
  connectionString,
  max: 10,
  // Managed Postgres (Supabase / Replit) presents a chain that Node can't
  // verify by default. Accept the cert without full chain verification —
  // the connection is still TLS-encrypted.
  ssl: connectionString ? { rejectUnauthorized: false } : undefined,
});

export default pool;
