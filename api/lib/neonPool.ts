import * as pg from "pg";
const { Pool } = pg;

let pool: InstanceType<typeof Pool> | null = null;

export function getPool() {
  if (!pool) {
    const connectionString =
      process.env.MEDIA_BRIEF_DB_URL || process.env.POSTGRES_CONNECTION_STRING;
    if (!connectionString) {
      throw new Error("No database connection string configured");
    }
    pool = new Pool({
      connectionString,
      max: 1,
      connectionTimeoutMillis: 3000,
      idleTimeoutMillis: 10000,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}
