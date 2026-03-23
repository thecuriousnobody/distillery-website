import { getPool } from "./neonPool";

/**
 * Fetches og:image from a URL and caches in kiosk_og_cache table.
 * Returns cached value if already fetched.
 */
export async function getOgImage(url: string): Promise<string | null> {
  if (!url) return null;

  const pool = getPool();

  // Check cache first
  const cached = await pool.query(
    `SELECT image_url FROM kiosk_og_cache WHERE url = $1 LIMIT 1`,
    [url]
  );
  if (cached.rows.length > 0) {
    return cached.rows[0].image_url || null;
  }

  // Fetch the page and extract og:image
  let imageUrl: string | null = null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; DistilleryKiosk/1.0)",
        Accept: "text/html",
      },
      redirect: "follow",
    });
    clearTimeout(timeout);

    if (res.ok) {
      // Only read first 50KB to find meta tags quickly
      const text = await res.text();
      const head = text.slice(0, 50000);

      // Match og:image or twitter:image meta tags
      const ogMatch = head.match(
        /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i
      ) || head.match(
        /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i
      );

      if (ogMatch) {
        imageUrl = ogMatch[1];
      } else {
        // Try twitter:image
        const twMatch = head.match(
          /<meta[^>]*(?:name|property)=["']twitter:image["'][^>]*content=["']([^"']+)["']/i
        ) || head.match(
          /<meta[^>]*content=["']([^"']+)["'][^>]*(?:name|property)=["']twitter:image["']/i
        );
        if (twMatch) {
          imageUrl = twMatch[1];
        }
      }
    }
  } catch {
    // Timeout or network error — cache as empty to avoid retrying
  }

  // Cache result (even empty — so we don't retry failed URLs)
  await pool.query(
    `INSERT INTO kiosk_og_cache (url, image_url) VALUES ($1, $2)
     ON CONFLICT (url) DO UPDATE SET image_url = $2, fetched_at = NOW()`,
    [url, imageUrl || ""]
  ).catch(() => {});

  return imageUrl;
}

/**
 * Batch-fetch OG images for multiple URLs.
 * Returns a map of url → imageUrl.
 */
export async function getOgImages(urls: string[]): Promise<Record<string, string>> {
  const unique = [...new Set(urls.filter(Boolean))];
  if (unique.length === 0) return {};

  const pool = getPool();
  const result: Record<string, string> = {};

  // Get all cached first
  const cached = await pool.query(
    `SELECT url, image_url FROM kiosk_og_cache WHERE url = ANY($1)`,
    [unique]
  );

  const cachedMap = new Map<string, string>();
  for (const row of cached.rows) {
    cachedMap.set(row.url as string, row.image_url as string);
  }

  const uncached: string[] = [];
  for (const url of unique) {
    if (cachedMap.has(url)) {
      const img = cachedMap.get(url)!;
      if (img) result[url] = img;
    } else {
      uncached.push(url);
    }
  }

  // Fetch uncached in parallel (max 5 at a time)
  for (let i = 0; i < uncached.length; i += 5) {
    const batch = uncached.slice(i, i + 5);
    const fetched = await Promise.allSettled(
      batch.map((url) => getOgImage(url))
    );
    for (let j = 0; j < batch.length; j++) {
      const f = fetched[j];
      if (f.status === "fulfilled" && f.value) {
        result[batch[j]] = f.value;
      }
    }
  }

  return result;
}

/**
 * Ensures the kiosk_og_cache table exists.
 */
export async function ensureOgCacheTable(): Promise<void> {
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS kiosk_og_cache (
      url TEXT PRIMARY KEY,
      image_url TEXT NOT NULL DEFAULT '',
      fetched_at TIMESTAMP DEFAULT NOW()
    )
  `);
}
