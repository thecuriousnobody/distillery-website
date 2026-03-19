import { useState, useEffect, useCallback } from "react";
import type { CalendarEvent } from "./types";

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useCalendarEvents(date?: string) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      const params = date ? `?date=${date}` : "";
      const res = await fetch(`/api/events${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setEvents(data.events);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      console.error("Failed to fetch events:", message);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    setLoading(true);
    fetchEvents();
    const interval = setInterval(fetchEvents, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  return { events, loading, error, refetch: fetchEvents };
}
