import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getPool } from "./lib/neonPool.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");

  try {
    const pool = getPool();

    const [socialResult, signalsResult, eventsResult, newsResult, digestResult] =
      await Promise.all([
        // Real social media posts (image_url populated by Apify scraping pipeline)
        pool.query(
          `SELECT id, title, description, original_link, source_platform,
                  image_url, organization, event_type, date, created_at
           FROM scraped_events
           ORDER BY created_at DESC
           LIMIT 20`
        ),
        // Startup intelligence signals (Reddit, HN, TechCrunch)
        pool.query(
          `SELECT id, signal_type, title, description, source, source_url,
                  score, comment_count, author, industry, detected_at
           FROM si_signals
           WHERE title IS NOT NULL AND title != ''
           ORDER BY detected_at DESC
           LIMIT 20`
        ),
        // Startup events (Eventbrite, Meetup, Luma)
        pool.query(
          `SELECT id, name, platform, event_date, location, description,
                  url, image_url, category
           FROM si_events
           WHERE name IS NOT NULL
           ORDER BY created_at DESC
           LIMIT 10`
        ),
        // Cached news digest — aggregate last 24 hours (hourly cron fills this)
        pool
          .query(
            `SELECT content, created_at FROM kiosk_news_cache
             WHERE created_at > NOW() - INTERVAL '24 hours'
             ORDER BY created_at DESC LIMIT 24`
          )
          .catch((): { rows: Record<string, unknown>[] } => ({ rows: [] })),
        // Digested signals — aggregate last 24 hours
        pool
          .query(
            `SELECT content, created_at FROM kiosk_digest_cache
             WHERE created_at > NOW() - INTERVAL '24 hours'
             ORDER BY created_at DESC LIMIT 24`
          )
          .catch((): { rows: Record<string, unknown>[] } => ({ rows: [] })),
      ]);

    // Map scraped social media posts (left panel)
    const socialPosts = socialResult.rows.map(
      (row: Record<string, unknown>) => {
        const link = (row.original_link as string) || "";
        const img = (row.image_url as string) || "";
        return {
          id: `social-${row.id}`,
          platform: detectPlatform(link),
          source: (row.organization as string) || "Peoria Ecosystem",
          title: (row.title as string) || "",
          text: (row.description as string) || "",
          url: link,
          // Proxy images through our API to avoid browser ad-blocker blocking
          imageUrl: img ? `/api/img-proxy?url=${encodeURIComponent(img)}` : undefined,
          date:
            (row.date as Date)?.toISOString() ||
            (row.created_at as Date)?.toISOString() ||
            new Date().toISOString(),
        };
      }
    );

    // Batch-lookup OG images for signal URLs from cache
    const signalUrls = signalsResult.rows
      .map((r: Record<string, unknown>) => (r as Record<string, unknown>).source_url as string)
      .filter(Boolean);
    let ogMap: Record<string, string> = {};
    if (signalUrls.length > 0) {
      try {
        const ogResult = await pool.query(
          `SELECT url, image_url FROM kiosk_og_cache
           WHERE url = ANY($1) AND image_url != ''`,
          [signalUrls]
        );
        for (const row of ogResult.rows) {
          ogMap[row.url as string] = row.image_url as string;
        }
      } catch { /* table may not exist yet */ }
    }

    // Map signals (right panel intel feed)
    const signals = signalsResult.rows.map(
      (row: Record<string, unknown>) => {
        const title = (row.title as string) || "";
        const desc = stripHtml((row.description as string) || "");
        const sourceUrl = (row.source_url as string) || "";
        const ogImg = ogMap[sourceUrl] || "";
        return {
          id: `signal-${row.id}`,
          platform: (row.source as string) || "community",
          title,
          text: desc || title,
          likes: row.score as number | undefined,
          comments: row.comment_count as number | undefined,
          date:
            (row.detected_at as Date)?.toISOString() ||
            new Date().toISOString(),
          url: sourceUrl || undefined,
          imageUrl: ogImg
            ? `/api/img-proxy?url=${encodeURIComponent(ogImg)}`
            : undefined,
          signalType: row.signal_type as string,
          source: row.source as string,
          author: row.author as string | undefined,
          industry: row.industry as string | undefined,
        };
      }
    );

    // Map events
    const events = eventsResult.rows.map((row: Record<string, unknown>) => ({
      id: `event-${row.id}`,
      name: row.name as string,
      platform: row.platform as string,
      date: row.event_date
        ? (row.event_date as Date).toISOString()
        : undefined,
      location: row.location as string | undefined,
      description: truncate((row.description as string) || "", 200),
      url: row.url as string | undefined,
      imageUrl: (row.image_url as string)
        ? `/api/img-proxy?url=${encodeURIComponent(row.image_url as string)}`
        : undefined,
      category: row.category as string | undefined,
    }));

    // News from cache — aggregate all recent batches, deduplicate by headline
    const news: unknown[] = [];
    const seenHeadlines = new Set<string>();
    for (const row of newsResult.rows) {
      const cached = row.content;
      const raw: Record<string, unknown>[] =
        typeof cached === "string" ? JSON.parse(cached) : cached;
      for (const item of raw) {
        const hl = ((item.headline as string) || "").toLowerCase();
        if (hl && seenHeadlines.has(hl)) continue;
        seenHeadlines.add(hl);
        const imgUrl = (item.imageUrl as string) || "";
        news.push({
          ...item,
          imageUrl: imgUrl
            ? `/api/img-proxy?url=${encodeURIComponent(imgUrl)}`
            : undefined,
        });
      }
    }

    // Digested signals — aggregate all recent batches, deduplicate
    const digested: unknown[] = [];
    const seenDigested = new Set<string>();
    for (const row of digestResult.rows) {
      const cached = row.content;
      const items = typeof cached === "string" ? JSON.parse(cached) : cached;
      for (const item of items as Record<string, unknown>[]) {
        const hl = ((item.headline as string) || "").toLowerCase();
        if (hl && seenDigested.has(hl)) continue;
        seenDigested.add(hl);
        digested.push(item);
      }
    }

    return res.status(200).json({
      socialPosts,
      signals,
      events,
      news,
      digested,
      lastUpdated: newsResult.rows[0]?.created_at || null,
    });
  } catch (err) {
    console.error("social-feed error:", err);
    return res.status(200).json({
      socialPosts: [],
      signals: [],
      events: [],
      news: [],
      lastUpdated: null,
    });
  }
}

function detectPlatform(url: string): string {
  if (url.includes("instagram.com")) return "instagram";
  if (url.includes("facebook.com")) return "facebook";
  if (url.includes("linkedin.com") || url.includes("lnkd.in")) return "linkedin";
  if (url.includes("proximity.app")) return "proximity";
  return "community";
}

function truncate(text: string, maxLen: number): string {
  if (!text || text.length <= maxLen) return text || "";
  return text.slice(0, maxLen) + "...";
}

function stripHtml(text: string): string {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&ndash;/g, "-")
    .replace(/&mdash;/g, "—")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
