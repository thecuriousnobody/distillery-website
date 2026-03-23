import { useState, useEffect, useCallback } from "react";
import type { SocialFeedResponse } from "../attract/types";

const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes

export function useSocialFeed() {
  const [data, setData] = useState<SocialFeedResponse>({
    socialPosts: [],
    signals: [],
    events: [],
    news: [],
    digested: [],
    lastUpdated: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = useCallback(async () => {
    try {
      const res = await fetch("/api/social-feed");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: SocialFeedResponse = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      console.error("Failed to fetch social feed:", message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
    const interval = setInterval(fetchFeed, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchFeed]);

  return { ...data, loading, error, refetch: fetchFeed };
}
