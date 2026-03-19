import { tool } from "ai";
import { z } from "zod";
import { getCalendarClient, CALENDAR_ID } from "./calendarClient.js";
import { parseICS } from "./icsParser.js";

const PROXIMITY_ICS_URL = "https://distillerylabs.proximity.app/events/ics";

export const getCalendarEvents = tool({
  description:
    "Get upcoming events from Distillery Labs (Proximity + Google Calendar). Use this to answer questions about what's happening today, this week, room availability, or upcoming events.",
  parameters: z.object({
    date: z
      .string()
      .optional()
      .describe("Start date in YYYY-MM-DD format. Defaults to today."),
    daysAhead: z
      .number()
      .min(1)
      .max(7)
      .optional()
      .describe("Number of days to look ahead. Defaults to 1."),
  }),
  execute: async (args) => {
    const { date, daysAhead = 1 } = args || {};

    const now = date ? new Date(`${date}T00:00:00`) : new Date();
    const timeMin = new Date(now);
    timeMin.setHours(0, 0, 0, 0);

    const timeMax = new Date(timeMin);
    timeMax.setDate(timeMax.getDate() + daysAhead);
    timeMax.setHours(23, 59, 59, 999);

    // Fetch from both sources in parallel
    const [proximityEvents, googleEvents] = await Promise.allSettled([
      // Proximity ICS feed
      fetch(PROXIMITY_ICS_URL)
        .then((r) => r.text())
        .then((ics) => {
          // Parse events for each day in the range
          const allEvents = [];
          for (let d = new Date(timeMin); d <= timeMax; d.setDate(d.getDate() + 1)) {
            allEvents.push(...parseICS(ics, new Date(d)));
          }
          // Deduplicate by uid
          const seen = new Set<string>();
          return allEvents.filter((e) => {
            if (seen.has(e.uid)) return false;
            seen.add(e.uid);
            return true;
          });
        }),
      // Google Calendar
      getCalendarClient()
        .events.list({
          calendarId: CALENDAR_ID,
          timeMin: timeMin.toISOString(),
          timeMax: timeMax.toISOString(),
          singleEvents: true,
          orderBy: "startTime",
          maxResults: 25,
        })
        .then((response) =>
          (response.data.items || []).map((event) => ({
            uid: event.id || "",
            summary: event.summary || "Untitled Event",
            description: event.description || "",
            location: event.location || "",
            start: event.start?.dateTime || event.start?.date || "",
            end: event.end?.dateTime || event.end?.date || "",
            allDay: !event.start?.dateTime,
          }))
        ),
    ]);

    const events: Array<{
      summary: string;
      description: string;
      location: string;
      start: string;
      end: string;
      source: string;
    }> = [];

    const seen = new Set<string>();

    // Proximity events first (usually more detailed)
    if (proximityEvents.status === "fulfilled") {
      for (const e of proximityEvents.value) {
        const key = e.summary.toLowerCase().trim();
        if (!seen.has(key)) {
          seen.add(key);
          events.push({
            summary: e.summary,
            description: e.description.slice(0, 300),
            location: e.location || "Distillery Labs",
            start: e.start,
            end: e.end,
            source: "proximity",
          });
        }
      }
    }

    // Google Calendar events
    if (googleEvents.status === "fulfilled") {
      for (const e of googleEvents.value) {
        const key = e.summary.toLowerCase().trim();
        if (!seen.has(key)) {
          seen.add(key);
          events.push({
            summary: e.summary,
            description: (e.description || "").slice(0, 300),
            location: e.location || "",
            start: e.start,
            end: e.end,
            source: "google",
          });
        }
      }
    }

    // Sort by start time
    events.sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    );

    return {
      dateRange: {
        from: timeMin.toISOString(),
        to: timeMax.toISOString(),
      },
      eventCount: events.length,
      events,
    };
  },
});
