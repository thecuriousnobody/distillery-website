import type { CalendarEvent } from "./types";

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function isNow(start: string, end: string): boolean {
  const now = Date.now();
  return now >= new Date(start).getTime() && now < new Date(end).getTime();
}

export default function EventTile({
  event,
  onClick,
}: {
  event: CalendarEvent;
  onClick: () => void;
}) {
  const now = !event.allDay && isNow(event.start, event.end);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 border-2 transition-colors ${
        now
          ? "border-brutal-accent bg-brutal-accent/10"
          : "border-gray-700 hover:border-brutal-accent"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-sm text-gray-400">
          {event.allDay
            ? "All Day"
            : `${formatTime(event.start)} – ${formatTime(event.end)}`}
        </span>
        {now && (
          <span className="font-mono text-xs px-2 py-0.5 bg-brutal-accent text-brutal-black font-bold">
            NOW
          </span>
        )}
      </div>
      <h3 className="font-display text-lg text-brutal-white font-bold leading-tight">
        {event.summary}
      </h3>
      {event.location && (
        <p className="font-mono text-sm text-gray-400 mt-1">
          📍 {event.location}
        </p>
      )}
    </button>
  );
}
