import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getPool } from "../lib/neonPool.js";
import { generateNewsDigest, digestSignals } from "../lib/newsRadar.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const pool = getPool();

    // Ensure cache tables exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS kiosk_news_cache (
        id SERIAL PRIMARY KEY,
        content JSONB NOT NULL,
        region TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS kiosk_digest_cache (
        id SERIAL PRIMARY KEY,
        content JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Run news generation + signal digestion in parallel
    const [newsResult, signalsResult] = await Promise.allSettled([
      generateNewsDigest(),
      // Get top non-Reddit signals and digest them through Claude
      pool.query(
        `SELECT title, description, source, source_url
         FROM si_signals
         WHERE title IS NOT NULL AND title != ''
           AND source NOT IN ('reddit')
         ORDER BY detected_at DESC LIMIT 10`
      ).then((r: { rows: Record<string, unknown>[] }) => {
        const raw = r.rows.map((row: Record<string, unknown>) => ({
          title: (row.title as string) || "",
          description: (row.description as string) || "",
          source: (row.source as string) || "",
          url: (row.source_url as string) || "",
        }));
        return digestSignals(raw);
      }),
    ]);

    const newsItems = newsResult.status === "fulfilled" ? newsResult.value : [];
    const digestedSignals = signalsResult.status === "fulfilled" ? signalsResult.value : [];

    const dayOfWeek = new Date().getDay();
    const regions = ["Statewide", "Peoria", "Springfield", "UIUC", "IIN", "Western IL", "Eastern IL"];
    const region = regions[dayOfWeek];

    // Store news
    if (newsItems.length > 0) {
      await pool.query(
        `INSERT INTO kiosk_news_cache (content, region) VALUES ($1, $2)`,
        [JSON.stringify(newsItems), region]
      );
    }

    // Store digested signals
    if (digestedSignals.length > 0) {
      await pool.query(
        `INSERT INTO kiosk_digest_cache (content) VALUES ($1)`,
        [JSON.stringify(digestedSignals)]
      );
    }

    // Clean up old entries
    await pool.query(
      `DELETE FROM kiosk_news_cache WHERE created_at < NOW() - INTERVAL '7 days'`
    );
    await pool.query(
      `DELETE FROM kiosk_digest_cache WHERE created_at < NOW() - INTERVAL '48 hours'`
    );

    return res.status(200).json({
      ok: true,
      newsItems: newsItems.length,
      digestedSignals: digestedSignals.length,
      region,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("refresh-feed error:", err);
    return res.status(500).json({
      error: "Failed to refresh feed",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
}
