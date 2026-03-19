/**
 * Minimal ICS parser — extracts VEVENT blocks from an ICS feed
 * and returns events for a given date.
 */

export interface ICSEvent {
  uid: string;
  summary: string;
  description: string;
  location: string;
  start: string; // ISO string
  end: string; // ISO string
  allDay: boolean;
}

function unfold(ics: string): string {
  // ICS line folding: lines starting with space/tab are continuations
  return ics.replace(/\r?\n[ \t]/g, "");
}

function parseICSDate(value: string): { date: Date; allDay: boolean } {
  // DTSTART;TZID=UTC:20260318T213000  or  DTSTART;VALUE=DATE:20260318
  const match = value.match(
    /(?:;TZID=([^:]*)|;VALUE=DATE)?:(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2}))?/
  );
  if (!match) return { date: new Date(0), allDay: false };

  const [, tzid, y, mo, d, h, mi, s] = match;
  const allDay = !h;

  if (allDay) {
    return { date: new Date(`${y}-${mo}-${d}T00:00:00`), allDay: true };
  }

  // If TZID is UTC, treat as UTC; otherwise treat as local for simplicity
  const iso = `${y}-${mo}-${d}T${h}:${mi}:${s}`;
  const date =
    tzid === "UTC" || tzid === "Etc/UTC"
      ? new Date(iso + "Z")
      : new Date(iso);

  return { date, allDay: false };
}

function unescapeICS(text: string): string {
  return text
    .replace(/\\n/g, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\{2}/g, "\\")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&rsquo;/g, "\u2019")
    .replace(/&ldquo;/g, "\u201C")
    .replace(/&rdquo;/g, "\u201D")
    .replace(/&mdash;/g, "\u2014");
}

export function parseICS(icsText: string, filterDate?: Date): ICSEvent[] {
  const unfolded = unfold(icsText);
  const lines = unfolded.split(/\r?\n/);
  const events: ICSEvent[] = [];

  let inEvent = false;
  let uid = "";
  let summary = "";
  let description = "";
  let location = "";
  let dtstart = "";
  let dtend = "";

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      inEvent = true;
      uid = summary = description = location = dtstart = dtend = "";
      continue;
    }

    if (line === "END:VEVENT") {
      inEvent = false;

      const start = parseICSDate(dtstart);
      const end = parseICSDate(dtend);

      // Filter to specific date if requested
      if (filterDate) {
        const dayStart = new Date(filterDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(filterDate);
        dayEnd.setHours(23, 59, 59, 999);

        // Event overlaps with the day if it starts before day ends AND ends after day starts
        const eventStart = start.date.getTime();
        const eventEnd = end.date.getTime();
        if (eventEnd <= dayStart.getTime() || eventStart > dayEnd.getTime()) {
          continue;
        }
      }

      events.push({
        uid,
        summary: unescapeICS(summary),
        description: unescapeICS(description),
        location: unescapeICS(location),
        start: start.date.toISOString(),
        end: end.date.toISOString(),
        allDay: start.allDay,
      });
      continue;
    }

    if (!inEvent) continue;

    if (line.startsWith("UID:")) uid = line.slice(4);
    else if (line.startsWith("SUMMARY:")) summary = line.slice(8);
    else if (line.startsWith("DESCRIPTION:")) description = line.slice(12);
    else if (line.startsWith("LOCATION:")) location = line.slice(9);
    else if (line.startsWith("DTSTART")) dtstart = line;
    else if (line.startsWith("DTEND")) dtend = line;
  }

  // Sort by start time
  events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  return events;
}
