import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Room, RoomBooking } from "./hooks/useRoomBookings";

interface RoomScheduleProps {
  rooms: Room[];
  bookings: RoomBooking[];
  date: string; // YYYY-MM-DD
  loading?: boolean;
}

function formatTime(isoStr: string): string {
  return new Date(isoStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function isNow(start: string, end: string): boolean {
  const now = Date.now();
  return now >= new Date(start).getTime() && now <= new Date(end).getTime();
}

function isUpcoming(start: string): boolean {
  const now = Date.now();
  const startMs = new Date(start).getTime();
  const twoHours = 2 * 60 * 60 * 1000;
  return startMs > now && startMs - now < twoHours;
}

// Extract room number from name (e.g., "Conference Room 226" → "226")
function getRoomNumber(name: string): string | null {
  const match = name.match(/\b(\d{3})\b/);
  return match ? match[1] : null;
}

// Friendly short name for tile display
function getShortTitle(title: string): string {
  // Trim long titles
  if (title.length > 50) return title.slice(0, 47) + "...";
  return title;
}

// Floor hint from room number
function getFloorHint(roomNumber: string | null): string {
  if (!roomNumber) return "";
  const floor = roomNumber.charAt(0);
  return floor === "1" ? "1st Floor" : floor === "2" ? "2nd Floor" : `Floor ${floor}`;
}

interface SelectedBooking {
  booking: RoomBooking;
  room: Room;
}

export default function RoomSchedule({ rooms, bookings, date, loading }: RoomScheduleProps) {
  const [selected, setSelected] = useState<SelectedBooking | null>(null);

  // Filter bookings for the selected date
  const dayBookings = useMemo(() => {
    return bookings.filter((b) => {
      const localDate = new Date(b.start).toLocaleDateString("en-CA");
      return localDate === date;
    });
  }, [bookings, date]);

  // Build tile data: each booking paired with its room
  const tiles = useMemo(() => {
    const roomMap = new Map(rooms.map((r) => [r.id, r]));
    return dayBookings
      .map((b) => ({
        booking: b,
        room: roomMap.get(b.roomId),
      }))
      .filter((t) => t.room != null)
      .sort((a, b) => a.booking.start.localeCompare(b.booking.start)) as {
      booking: RoomBooking;
      room: Room;
    }[];
  }, [dayBookings, rooms]);

  if (loading) {
    return (
      <div className="py-3">
        <div className="font-mono text-sm text-gray-500 animate-pulse">
          Loading rooms...
        </div>
      </div>
    );
  }

  if (tiles.length === 0) {
    return (
      <div className="py-3">
        <p className="font-mono text-sm text-gray-500">
          No room bookings for this day.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2 py-2">
        {tiles.map(({ booking, room }) => {
          const active = isNow(booking.start, booking.end);
          const soon = !active && isUpcoming(booking.start);
          const roomNum = getRoomNumber(room.name);

          return (
            <button
              key={booking.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelected({ booking, room });
              }}
              className={`relative text-left p-3 rounded-sm border transition-all ${
                active
                  ? "border-brutal-accent bg-brutal-accent/10"
                  : "border-gray-700 bg-gray-800/60 hover:border-gray-500 hover:bg-gray-800"
              }`}
            >
              {/* Room color stripe on left */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-sm"
                style={{ backgroundColor: room.color }}
              />

              {/* NOW badge */}
              {active && (
                <span className="absolute top-2 right-2 font-mono text-[9px] font-bold text-brutal-accent tracking-wider animate-pulse">
                  NOW
                </span>
              )}
              {soon && (
                <span className="absolute top-2 right-2 font-mono text-[9px] font-bold text-yellow-400 tracking-wider">
                  SOON
                </span>
              )}

              {/* Event title */}
              <p className="font-display text-sm font-semibold text-brutal-white leading-snug pr-10 mb-1.5">
                {getShortTitle(booking.title)}
              </p>

              {/* Time */}
              <p className="font-mono text-xs text-gray-400 mb-1">
                {formatTime(booking.start)} – {formatTime(booking.end)}
              </p>

              {/* Room info */}
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full flex-none"
                  style={{ backgroundColor: room.color }}
                />
                <span className="font-mono text-[10px] text-gray-400 truncate">
                  {room.name}
                  {roomNum && (
                    <span className="text-gray-500 ml-1">
                      · {getFloorHint(roomNum)}
                    </span>
                  )}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70" />

            <motion.div
              className="relative bg-brutal-gray border-2 p-8 w-full max-w-lg"
              style={{ borderColor: selected.room.color }}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 font-mono text-gray-400 hover:text-brutal-white text-2xl leading-none"
              >
                ✕
              </button>

              {/* Event title */}
              <h2 className="font-display text-2xl text-brutal-white font-bold mb-5 pr-8">
                {selected.booking.title}
              </h2>

              {/* Details grid */}
              <div className="space-y-4">
                {/* Room */}
                <div className="flex items-start gap-3">
                  <div
                    className="w-4 h-4 rounded-full flex-none mt-0.5"
                    style={{ backgroundColor: selected.room.color }}
                  />
                  <div>
                    <p className="font-mono text-xs text-gray-400 mb-0.5">Room</p>
                    <p className="font-display text-lg text-brutal-white font-semibold">
                      {selected.room.name}
                    </p>
                    {getRoomNumber(selected.room.name) && (
                      <p className="font-mono text-xs text-gray-400 mt-0.5">
                        {getFloorHint(getRoomNumber(selected.room.name))} · Seats {selected.room.seats}
                      </p>
                    )}
                  </div>
                </div>

                {/* Time */}
                <div className="pl-7">
                  <p className="font-mono text-xs text-gray-400 mb-0.5">Time</p>
                  <p className="font-display text-lg text-brutal-white">
                    {formatTime(selected.booking.start)} – {formatTime(selected.booking.end)}
                  </p>
                  {isNow(selected.booking.start, selected.booking.end) && (
                    <span className="inline-block font-mono text-[10px] font-bold text-brutal-accent mt-1 tracking-wider animate-pulse">
                      HAPPENING NOW
                    </span>
                  )}
                </div>

                {/* Booked by */}
                {selected.booking.bookedBy && selected.booking.bookedBy !== "Private" && (
                  <div className="pl-7">
                    <p className="font-mono text-xs text-gray-400 mb-0.5">Reserved by</p>
                    <p className="font-display text-base text-brutal-white">
                      {selected.booking.bookedBy}
                    </p>
                  </div>
                )}
              </div>

              {/* Close hint */}
              <p className="font-mono text-[10px] text-gray-500 mt-6 text-center">
                Tap anywhere to close
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
