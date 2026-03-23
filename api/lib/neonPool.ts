import { Pool, neonConfig } from "@neondatabase/serverless";

// Local dev: Neon serverless driver needs a WebSocket implementation.
// Vercel's runtime provides one automatically, so only load ws locally.
if (!process.env.VERCEL) {
  try {
    // Dynamic import so it doesn't crash when ws isn't installed (production)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    neonConfig.webSocketConstructor = require("ws");
  } catch {
    // ws not installed — fine in production, Vercel provides WebSocket natively
  }
}

let pool: Pool | null = null;

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
    });
  }
  return pool;
}
