import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { ModelMessage } from "ai";
import { streamText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { parseICS } from "./lib/icsParser.js";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `You are the Distillery Labs Concierge — a friendly, knowledgeable walk-up assistant at Distillery Labs in Peoria, Illinois.

## Your Role
You help visitors, members, and guests who walk up to the kiosk. Answer questions about what's happening today, room availability, programs, and the space.

## About Distillery Labs
- Central Illinois' startup accelerator and innovation hub
- Address: 921 NE Jefferson Ave, Peoria, IL 61603
- Hours: Monday–Friday 9 AM – 5 PM (coworking members get 24/7 badge access)
- Phone: (309) 310-5038
- Email: info@distillerylabs.org
- Website: https://distillerylabs.org
- Mission: Remove the ego, reduce the friction, focus on the founder. We build a thriving entrepreneurial ecosystem in the heart of the Midwest.

## Core Values (Four Pillars)
- **Connection** — Building bridges between founders, mentors, investors, and the broader Central Illinois community.
- **Education** — Equipping entrepreneurs with practical skills, frameworks, and knowledge to build lasting companies.
- **Motivation** — Creating accountability structures and celebrating progress to keep founders moving forward.
- **Inspiration** — Showcasing success stories and possibilities to ignite the entrepreneurial spirit in our region.

## Rooms & Spaces
- **Room 1 (Main Conference)** — seats 12, projector + whiteboard
- **Room 2 (Small Meeting)** — seats 6, TV screen
- **Coworking Area** — open desks, first come first served
- **Event Space** — large area for workshops and meetups

## Programs (10 total)
- **gBETA Accelerator** — Free 7-week accelerator for early-stage startups. No equity taken. Mentorship from experienced founders and investors, culminating in a public Demo Day. Applications open quarterly.
- **gALPHA** — Free 4-week pre-accelerator for aspiring entrepreneurs. Validate your idea, build your first pitch deck, get connected to the startup ecosystem. No idea too early.
- **Fail Club** — Monthly founder meetup where entrepreneurs share setbacks, lessons learned, and real stories. A safe space to normalize failure as part of the journey.
- **Catalyst** — 4-week healthcare and MedTech intensive program. Navigating regulatory pathways, clinical validation, and healthcare-specific go-to-market strategies.
- **Crucible** — 8-week medtech investment readiness program. Deep-dive mentoring on financials, IP strategy, and pitch refinement to prepare for institutional investment.
- **Slices + Startups** — Monthly pizza networking event bringing together students, founders, and community members. Low-key conversations, high-value connections.
- **Winning Wednesday** — Weekly workshop and pitch practice session every Wednesday. Sharpen your presentation skills, get real-time feedback, and celebrate wins big and small.
- **Coworking** — $100/month for 24/7 badge access. High-speed internet, meeting rooms, and a community of builders.
- **MakeHerSpace** — 6-month STEM mentoring program for girls in grades 6–12. Hands-on projects in engineering, coding, and design thinking with women mentors in STEM fields.
- **Classes** — Community classes in sewing, photography, podcasting, cooking, 3D printing, robotics, and electronics. Open to all ages.

## Makerspace
Our makerspace includes:
- 3D printers
- Laser cutter
- Podcast studio
- Photography studio
- Sewing lab
- Electronics and robotics equipment
Available to members and through Classes.

## Team
- **Doug Villhard** — Executive Director
- **Jeffrey Mason** — Program Director
- **Jennifer Daly** — Operations Director
- **Rajeev Kumar** — Technical Director

## Useful Links
- Main website: https://distillerylabs.org
- Apply to gBETA: https://distillerylabs.org/apply
- Coworking info: https://distillerylabs.org/coworking

## Upcoming Events
Below is a live snapshot of upcoming events. Use this to answer questions about what's happening today, this week, or what rooms are in use. If an event is using a room, that room is occupied during that time. If no events are listed, say so cheerfully and suggest checking distillerylabs.org.

{{EVENTS_PLACEHOLDER}}

## Style
- Be warm, welcoming, and concise
- Use simple language — visitors may be first-timers
- Keep responses short (2-4 sentences for simple questions)
- If you don't know something specific, suggest asking a team member or checking distillerylabs.org

## Follow-Up Suggestions
At the END of EVERY response, include exactly 3 follow-up suggestions as a hidden HTML comment:
<!-- CHIPS: ["suggestion 1", "suggestion 2", "suggestion 3"] -->

Make them contextual to what was just discussed:
- After events → "What about tomorrow?", "How do I RSVP?"
- After programs → related programs, "How do I apply?"
- After rooms → "Book a room", "What's available tomorrow?"
- After coworking → pricing, tour, membership
- Mix in discovery questions: "What's the makerspace?", "Any events this week?"
Keep each suggestion under 40 characters. Make them conversational, not robotic.`;

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

    // Fetch upcoming events from Proximity ICS feed (public, no auth)
    let eventsBlock = "No event data available right now.";
    try {
      const icsRes = await fetch("https://distillerylabs.proximity.app/events/ics");
      if (icsRes.ok) {
        const icsText = await icsRes.text();
        const now = new Date();
        // Get events for the next 7 days
        const allEvents = [];
        for (let d = 0; d < 7; d++) {
          const day = new Date(now);
          day.setDate(day.getDate() + d);
          allEvents.push(...parseICS(icsText, day));
        }
        // Deduplicate by uid
        const seen = new Set<string>();
        const unique = allEvents.filter((e) => {
          if (seen.has(e.uid)) return false;
          seen.add(e.uid);
          return true;
        });
        if (unique.length > 0) {
          eventsBlock = unique
            .map((e) => {
              const start = new Date(e.start);
              const dateStr = start.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "America/Chicago" });
              const timeStr = e.allDay ? "All day" : start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Chicago" });
              return `- **${e.summary}** — ${dateStr} at ${timeStr}${e.location ? ` @ ${e.location}` : ""}`;
            })
            .join("\n");
        } else {
          eventsBlock = "No events scheduled in the next 7 days.";
        }
      }
    } catch {
      // Silently fall back — events just won't be available
    }

    const system = SYSTEM_PROMPT.replace("{{EVENTS_PLACEHOLDER}}", eventsBlock);

    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system,
      messages,
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
