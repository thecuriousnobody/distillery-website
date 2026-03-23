import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const results: Record<string, string> = {};

  try {
    await import("@neondatabase/serverless");
    results["@neondatabase/serverless"] = "OK";
  } catch (e) {
    results["@neondatabase/serverless"] = (e as Error).message;
  }

  try {
    await import("ai");
    results["ai"] = "OK";
  } catch (e) {
    results["ai"] = (e as Error).message;
  }

  try {
    await import("@ai-sdk/groq");
    results["@ai-sdk/groq"] = "OK";
  } catch (e) {
    results["@ai-sdk/groq"] = (e as Error).message;
  }

  try {
    const { getPool } = await import("./lib/neonPool.js");
    results["neonPool"] = "getPool loaded";
    const pool = getPool();
    const r = await pool.query("SELECT 1 as ok");
    results["db"] = `connected: ${JSON.stringify(r.rows[0])}`;
  } catch (e) {
    results["neonPool/db"] = (e as Error).message;
  }

  return res.status(200).json(results);
}
