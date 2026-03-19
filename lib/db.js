import { Pool } from 'pg';

let pool;

// This ensures that we re-use the database connection
// instead of creating a new one on every request in Next.js development.
if (!global.pgPool) {
  global.pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Add ssl: true if Railway requires strict SSL connections, but usually connectionString handles it.
  });
}

pool = global.pgPool;

export default pool;
