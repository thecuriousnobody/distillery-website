import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getCalendarClient, CALENDAR_ID } from "./lib/calendarClient.js";
import { parseICS } from "./lib/icsParser.js";

const PROXIMITY_ICS_URL = "https://distillerylabs.proximity.app/events/ics";

interface EventOut {
  id: string;
  summary: string;
  description: string;
  location: string;
  organizer: string;
  calendarId: string;
  start: string;
  end: string;
  allDay: boolean;
  source: "google" | "proximity";
}

async function fetchProximityEvents(today: Date): Promise<EventOut[]> {
  try {
    const res = await fetch(PROXIMITY_ICS_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const icsText = await res.text();
    const events = parseICS(icsText, today);
    return events.map((e) => ({
      id: `prox-${e.uid}`,
      summary: e.summary,
      description: e.description,
      location: e.location || "Distillery Labs",
      organizer: "Distillery Labs",
      calendarId: "proximity",
      start: e.start,
      end: e.end,
      allDay: e.allDay,
      source: "proximity" as const,
    }));
  } catch (error) {
    console.error("Proximity ICS fetch error:", error);
    return [];
  }
}

async function fetchGoogleEvents(
  calendarIds: string[],
  timeMin: Date,
  timeMax: Date
): Promise<EventOut[]> {
  if (calendarIds.length === 0) return [];

  try {
    const calendar = getCalendarClient();
    const results = await Promise.allSettled(
      calendarIds.map((calId) =>
        calendar.events.list({
          calendarId: calId.trim(),
          timeMin: timeMin.toISOString(),
          timeMax: timeMax.toISOString(),
          singleEvents: true,
          orderBy: "startTime",
          maxResults: 25,
        })
      )
    );

    return results.flatMap((result, i) => {
      if (result.status !== "fulfilled") {
        console.error(`Failed to fetch calendar ${calendarIds[i]}:`, result.reason);
        return [];
      }
      return (result.value.data.items || []).map((event) => ({
        id: event.id || "",
        summary: event.summary || "Untitled Event",
        description: event.description || "",
        location: event.location || "",
        organizer: event.organizer?.displayName || event.organizer?.email || "",
        calendarId: calendarIds[i],
        start: event.start?.dateTime || event.start?.date || "",
        end: event.end?.dateTime || event.end?.date || "",
        allDay: !event.start?.dateTime,
        source: "google" as const,
      }));
    });
  } catch (error) {
    console.error("Google Calendar fetch error:", error);
    return [];
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Accept optional ?date=YYYY-MM-DD for day navigation
    const dateParam = req.query.date;
    const targetDate = dateParam
      ? new Date(`${Array.isArray(dateParam) ? dateParam[0] : dateParam}T12:00:00`)
      : new Date();
    const timeMin = new Date(targetDate);
    timeMin.setHours(0, 0, 0, 0);
    const timeMax = new Date(timeMin);
    timeMax.setHours(23, 59, 59, 999);

    // Google calendar IDs (optional, from query or env)
    const calendarIdsParam = req.query.calendarIds;
    const googleCalendarIds: string[] = calendarIdsParam
      ? (Array.isArray(calendarIdsParam) ? calendarIdsParam[0] : calendarIdsParam).split(",")
      : [CALENDAR_ID];

    // Fetch from both sources in parallel
    const [proximityEvents, googleEvents] = await Promise.all([
      fetchProximityEvents(targetDate),
      fetchGoogleEvents(googleCalendarIds, timeMin, timeMax),
    ]);

    // Merge and deduplicate by summary (Proximity events may also be in Google Calendar)
    const seen = new Set<string>();
    const allEvents: EventOut[] = [];

    // Proximity events take priority (more detailed)
    for (const event of proximityEvents) {
      const key = event.summary.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        allEvents.push(event);
      }
    }

    for (const event of googleEvents) {
      const key = event.summary.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        allEvents.push(event);
      }
    }

    // Sort by start time
    allEvents.sort((a, b) => {
      if (a.allDay && !b.allDay) return -1;
      if (!a.allDay && b.allDay) return 1;
      return new Date(a.start).getTime() - new Date(b.start).getTime();
    });

    return res.status(200).json({
      date: timeMin.toISOString().split("T")[0],
      events: allEvents,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Events API error:", message);
    return res.status(500).json({
      error: "Failed to fetch events",
      details: message,
    });
  }
}
