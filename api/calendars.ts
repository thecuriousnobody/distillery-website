import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getCalendarClient, CALENDAR_ID } from "./lib/calendarClient.js";

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
    const calendar = getCalendarClient();

    // Use explicit calendar IDs from env, falling back to default
    const calendarIds = process.env.KIOSK_CALENDAR_IDS
      ? process.env.KIOSK_CALENDAR_IDS.split(",").map((id) => id.trim())
      : [CALENDAR_ID];

    // Fetch metadata for each calendar in parallel
    const results = await Promise.allSettled(
      calendarIds.map((calId) =>
        calendar.calendars.get({ calendarId: calId })
      )
    );

    const calendars = results
      .map((result, i) => {
        if (result.status !== "fulfilled") {
          console.error(`Failed to fetch calendar ${calendarIds[i]}:`, result.reason);
          // Still include it with minimal info so it can be toggled
          return {
            id: calendarIds[i],
            summary: calendarIds[i].split("@")[0],
            description: "",
            backgroundColor: "#4285f4",
            primary: i === 0,
          };
        }
        const cal = result.value.data;
        return {
          id: cal.id || calendarIds[i],
          summary: cal.summary || "Untitled Calendar",
          description: cal.description || "",
          backgroundColor: "#4285f4",
          primary: i === 0,
        };
      });

    return res.status(200).json({ calendars });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Calendars API error:", message);
    return res.status(500).json({
      error: "Failed to fetch calendars",
      details: message,
    });
  }
}
