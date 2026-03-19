import { motion, AnimatePresence } from "framer-motion";
import type { CalendarEvent } from "./types";

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function EventModal({
  event,
  onClose,
}: {
  event: CalendarEvent | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {event && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70"
            onClick={onClose}
          />

          {/* Modal — wide, horizontally centered, scrollable if needed */}
          <motion.div
            className="relative bg-brutal-gray border-2 border-brutal-accent p-8 w-full max-w-4xl max-h-[85vh] overflow-y-auto"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 font-mono text-gray-400 hover:text-brutal-white text-2xl leading-none"
            >
              ✕
            </button>

            <h2 className="font-display text-3xl text-brutal-white font-bold mb-6 pr-8">
              {event.summary}
            </h2>

            {/* Meta info in a horizontal row */}
            <div className="flex flex-wrap gap-6 mb-6 font-mono text-sm">
              <div>
                <span className="text-gray-400 block mb-1">Time</span>
                <span className="text-brutal-white text-base">
                  {event.allDay
                    ? "All Day"
                    : `${formatTime(event.start)} – ${formatTime(event.end)}`}
                </span>
              </div>

              {event.location && (
                <div>
                  <span className="text-gray-400 block mb-1">Location</span>
                  <span className="text-brutal-white text-base">{event.location}</span>
                </div>
              )}

              {event.organizer && (
                <div>
                  <span className="text-gray-400 block mb-1">Organizer</span>
                  <span className="text-brutal-white text-base">{event.organizer}</span>
                </div>
              )}
            </div>

            {event.description && (
              <div className="pt-4 border-t border-gray-700">
                <p className="text-gray-400 font-mono text-sm mb-2">Description</p>
                <div className="text-brutal-white font-mono text-sm whitespace-pre-wrap leading-relaxed">
                  {event.description}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
