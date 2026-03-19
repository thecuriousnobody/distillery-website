import { useState, useEffect, useCallback } from "react";
import type { CalendarInfo } from "./types";

const STORAGE_KEY = "kiosk-selected-calendars";

function loadSelection(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveSelection(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function useCalendarList() {
  const [calendars, setCalendars] = useState<CalendarInfo[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(loadSelection);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCalendars = useCallback(async () => {
    try {
      const res = await fetch("/api/calendars");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCalendars(data.calendars);

      // If no selection stored yet, select all by default
      const stored = loadSelection();
      if (stored.length === 0 && data.calendars.length > 0) {
        const allIds = data.calendars.map((c: CalendarInfo) => c.id);
        setSelectedIds(allIds);
        saveSelection(allIds);
      }

      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      console.error("Failed to fetch calendars:", message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCalendars();
  }, [fetchCalendars]);

  const toggleCalendar = useCallback(
    (id: string) => {
      setSelectedIds((prev) => {
        const next = prev.includes(id)
          ? prev.filter((x) => x !== id)
          : [...prev, id];
        saveSelection(next);
        return next;
      });
    },
    []
  );

  const selectAll = useCallback(() => {
    const allIds = calendars.map((c) => c.id);
    setSelectedIds(allIds);
    saveSelection(allIds);
  }, [calendars]);

  const selectNone = useCallback(() => {
    setSelectedIds([]);
    saveSelection([]);
  }, []);

  return {
    calendars,
    selectedIds,
    loading,
    error,
    toggleCalendar,
    selectAll,
    selectNone,
  };
}
