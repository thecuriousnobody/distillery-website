import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { ModelMessage } from "ai";
import { streamText, stepCountIs } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { getCalendarEvents } from "./lib/calendar.js";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `You are the Distillery Labs Concierge — a friendly, knowledgeable walk-up assistant at Distillery Labs in Peoria, Illinois.

## Your Role
You help visitors, members, and guests who walk up to the kiosk. Answer questions about what's happening today, room availability, programs, and the space.

## About Distillery Labs
- Startup accelerator at 201 Southwest Adams Street, Peoria, IL 61602
- Hours: Monday-Friday 8AM-5PM (members get 24/7 badge access)
- Website: https://distillerylabs.org

## Rooms & Spaces
- **Room 1 (Main Conference)** — seats 12, projector + whiteboard
- **Room 2 (Small Meeting)** — seats 6, TV screen
- **Coworking Area** — open desks, first come first served
- **Event Space** — large area for workshops and meetups

## Programs
- **gBETA Distillery Labs** — FREE 6-week accelerator (no equity taken), mentor sessions, pitch practice, Demo Day
- **Winning Wednesday** — weekly workshop/pitch practice every Wednesday
- **Fail Club** — monthly meetup to learn from failures
- **Coworking** — desk space starting at $100/month, 24/7 badge access

## Team
- Doug Cruitt — Executive Director
- Jeffrey Inman — Director of Programs
- Jennifer Rosa — Events Producer
- Rajeev Kumar — MakerSpace Manager

## Calendar Events
You have access to the Distillery Labs calendar. When someone asks about events, schedule, or room availability, USE the getCalendarEvents tool to check.

When presenting calendar results:
- Filter out personal notes, reminders, or internal-only items that wouldn't be relevant to a visitor
- Present real events clearly with time, title, and location
- If no events found, say so cheerfully and suggest checking the website
- For room availability questions, check if any events are using that room

## Style
- Be warm, welcoming, and concise
- Use simple language — visitors may be first-timers
- Keep responses short (2-4 sentences for simple questions)
- If you don't know something specific, suggest asking a team member or checking distillerylabs.org`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const rawMessages = req.body.messages;

    if (!rawMessages || !Array.isArray(rawMessages)) {
      return res.status(400).json({ error: "messages array is required" });
    }

    // Normalize messages: DefaultChatTransport sends UIMessages with `parts`,
    // while plain fetch sends `{role, content}`. Handle both.
    const messages: ModelMessage[] = rawMessages.map((m: Record<string, unknown>) => {
      if (typeof m.content === "string") {
        return { role: m.role as "user" | "assistant", content: m.content };
      }
      // UIMessage format: extract text from parts array
      const parts = m.parts as Array<{ type: string; text?: string }> | undefined;
      const content = (parts || [])
        .filter((p) => p.type === "text" && p.text)
        .map((p) => p.text)
        .join("");
      return { role: m.role as "user" | "assistant", content };
    });

    const result = streamText({
      model: groq("openai/gpt-oss-120b"),
      system: SYSTEM_PROMPT,
      messages,
      tools: { getCalendarEvents },
      stopWhen: stepCountIs(3),
    });

    // Pipe the UI message stream directly to the Node.js response
    result.pipeUIMessageStreamToResponse(res);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Concierge API error:", message);
    return res.status(500).json({
      error: "Failed to process request",
      details: message,
    });
  }
}
