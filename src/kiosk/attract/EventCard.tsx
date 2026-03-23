import type { StartupEvent } from "./types";

export default function EventCard({ event }: { event: StartupEvent }) {
  const handleTap = (e: React.MouseEvent) => {
    if (event.url) {
      e.stopPropagation();
      window.open(event.url, "_blank", "noopener");
    }
  };

  return (
    <div
      className={`bg-brutal-gray border-2 border-gray-700 p-6 h-full flex flex-col ${event.url ? "cursor-pointer" : ""}`}
      onClick={handleTap}
    >
      {/* Header badges */}
      <div className="flex items-center gap-2 mb-4">
        <span className="font-mono text-xs font-bold px-2 py-1 bg-brutal-yellow text-brutal-black">
          EVENT
        </span>
        {event.platform && (
          <span className="font-mono text-xs font-bold px-2 py-1 border border-brutal-yellow text-brutal-yellow">
            {event.platform.toUpperCase()}
          </span>
        )}
        {event.category && (
          <span className="font-mono text-xs text-gray-500">
            {event.category}
          </span>
        )}
      </div>

      {/* Event name */}
      <h3 className="font-display text-lg text-brutal-white font-bold leading-tight mb-3">
        {event.name}
      </h3>

      {/* Description */}
      {event.description && (
        <p className="font-mono text-sm text-gray-400 leading-relaxed flex-1 line-clamp-3">
          {event.description}
        </p>
      )}

      {/* Details + link hint */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-700">
        <div className="space-y-1">
          {event.date && (
            <p className="font-mono text-xs text-brutal-accent">
              {new Date(event.date).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          )}
          {event.location && (
            <p className="font-mono text-xs text-gray-500 truncate">
              {event.location}
            </p>
          )}
        </div>
        {event.url && (
          <span className="font-mono text-[10px] text-brutal-yellow">
            TAP FOR DETAILS &rarr;
          </span>
        )}
      </div>
    </div>
  );
}
