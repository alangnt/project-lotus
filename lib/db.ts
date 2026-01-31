import { Pool } from 'pg';

/**
 * Centralized database connection pool
 * Ensures proper connection management and prevents connection leaks
 */

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.POSTGRES_URL;
    
    if (!connectionString) {
      throw new Error('POSTGRES_URL environment variable is not set');
    }

    pool = new Pool({
      connectionString,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection cannot be established
    });

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle database client', err);
      process.exit(-1);
    });
  }

  return pool;
}

/**
 * Close the database pool (useful for graceful shutdown)
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
