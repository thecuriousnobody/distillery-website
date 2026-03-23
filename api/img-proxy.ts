import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Image proxy — fetches external images server-side to avoid browser
 * blocking (ad blockers, CORS, CDN hotlink protection).
 *
 * Usage: /api/img-proxy?url=https://scontent-ord5-1.cdninstagram.com/...
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { url } = req.query;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Missing url parameter" });
  }

  // Allow image CDN domains we trust + common news/media image hosts
  const allowed = [
    "cdninstagram.com",
    "fbcdn.net",
    "scontent.",
    "media.licdn.com",
    "img.evbuc.com",
    "secure.meetupstatic.com",
    "images.lumacdn.com",
    // News / article OG images
    "techcrunch.com",
    "wp.com",
    "imgur.com",
    "medium.com",
    "substackcdn.com",
    "cloudfront.net",
    "amazonaws.com",
    "googleusercontent.com",
    "ytimg.com",
    "arstechnica.com",
    "wired.com",
    "theverge.com",
    "bloomberg.com",
    "reuters.com",
    "apnews.com",
    "npr.org",
    "cnbc.com",
    "sj-r.com",
    "pjstar.com",
    "news-gazette.com",
    "pantagraph.com",
    "herald-review.com",
    "civicnation.org",
    "illinois.edu",
    "bradley.edu",
    "icc.edu",
    // Screenshot service
    "image.thum.io",
  ];

  try {
    const parsed = new URL(url);
    const isAllowed = allowed.some(
      (d) => parsed.hostname.includes(d) || parsed.hostname.endsWith(d)
    );
    if (!isAllowed) {
      return res.status(403).json({ error: "Domain not allowed" });
    }
  } catch {
    return res.status(400).json({ error: "Invalid URL" });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const upstream = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "image/*",
      },
    });
    clearTimeout(timeout);

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: "Upstream error" });
    }

    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    const buffer = Buffer.from(await upstream.arrayBuffer());

    // Cache for 7 days on CDN, 1 day in browser
    res.setHeader("Cache-Control", "public, s-maxage=604800, max-age=86400");
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", buffer.length);
    return res.send(buffer);
  } catch (err) {
    console.error("img-proxy error:", err);
    return res.status(502).json({ error: "Failed to fetch image" });
  }
}
