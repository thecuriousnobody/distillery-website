import { useState, useMemo } from "react";
import { useCalendarEvents } from "./useCalendarEvents";
import { useRoomBookings } from "./hooks/useRoomBookings";
import EventTile from "./EventTile";
import EventModal from "./EventModal";
import RoomSchedule from "./RoomSchedule";
import type { CalendarEvent } from "./types";

function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatMonthYear(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function formatFullDate(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function isToday(dateStr: string): boolean {
  return dateStr === toDateString(new Date());
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getMonthGrid(year: number, month: number): (string | null)[][] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks: (string | null)[][] = [];
  let week: (string | null)[] = new Array(firstDay).fill(null);

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    week.push(toDateString(d));
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

export default function CalendarPanel() {
  const today = toDateString(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const { events, loading, error } = useCalendarEvents(selectedDate);
  const { rooms, bookings, loading: roomsLoading } = useRoomBookings(selectedDate);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const weeks = useMemo(
    () => getMonthGrid(viewMonth.year, viewMonth.month),
    [viewMonth.year, viewMonth.month]
  );

  const prevMonth = () =>
    setViewMonth((v) => {
      const d = new Date(v.year, v.month - 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  const nextMonth = () =>
    setViewMonth((v) => {
      const d = new Date(v.year, v.month + 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  const goToday = () => {
    const d = new Date();
    setViewMonth({ year: d.getFullYear(), month: d.getMonth() });
    setSelectedDate(today);
  };

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Month navigation */}
        <div className="flex-none px-4 pt-4 pb-2">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={prevMonth}
              className="w-8 h-8 flex items-center justify-center border border-gray-600 text-gray-400 hover:border-brutal-white hover:text-brutal-white transition-colors font-mono text-lg"
            >
              &lsaquo;
            </button>
            <div className="text-center">
              <h2 className="font-display text-lg text-brutal-white font-bold">
                {formatMonthYear(new Date(viewMonth.year, viewMonth.month))}
              </h2>
            </div>
            <div className="flex gap-1">
              {(viewMonth.year !== new Date().getFullYear() ||
                viewMonth.month !== new Date().getMonth() ||
                selectedDate !== today) && (
                <button
                  onClick={goToday}
                  className="font-mono text-xs px-2 py-1 border border-brutal-accent text-brutal-accent hover:bg-brutal-accent hover:text-brutal-black transition-colors mr-1"
                >
                  Today
                </button>
              )}
              <button
                onClick={nextMonth}
                className="w-8 h-8 flex items-center justify-center border border-gray-600 text-gray-400 hover:border-brutal-white hover:text-brutal-white transition-colors font-mono text-lg"
              >
                &rsaquo;
              </button>
            </div>
          </div>

          {/* Month grid */}
          <table className="w-full table-fixed">
            <thead>
              <tr>
                {WEEKDAYS.map((d) => (
                  <th
                    key={d}
                    className="font-mono text-xs text-gray-500 font-normal pb-1 text-center"
                  >
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, wi) => (
                <tr key={wi}>
                  {week.map((dateStr, di) => {
                    if (!dateStr) {
                      return <td key={di} />;
                    }
                    const dayNum = new Date(`${dateStr}T12:00:00`).getDate();
                    const isSel = dateStr === selectedDate;
                    const isTod = dateStr === today;
                    return (
                      <td key={di} className="text-center p-0.5">
                        <button
                          onClick={() => setSelectedDate(dateStr)}
                          className={`w-8 h-8 font-mono text-xs rounded-sm transition-colors ${
                            isSel
                              ? "bg-brutal-accent text-brutal-black font-bold"
                              : isTod
                                ? "border border-brutal-accent text-brutal-accent"
                                : "text-gray-400 hover:text-brutal-white hover:bg-gray-700/50"
                          }`}
                        >
                          {dayNum}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Selected day label */}
        <div className="flex-none px-4 py-2 border-t border-b border-gray-700">
          <p className="font-mono text-sm text-gray-400">
            {isToday(selectedDate) ? "Today — " : ""}
            {formatFullDate(selectedDate)}
          </p>
        </div>

        {/* Events list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {loading && (
            <div className="flex items-center justify-center h-20">
              <div className="font-mono text-gray-400 text-sm animate-pulse">
                Loading events...
              </div>
            </div>
          )}

          {error && (
            <div className="font-mono text-xs text-red-400 p-3 border border-red-400/30">
              Failed to load calendar. Retrying...
            </div>
          )}

          {!loading && !error && events.length === 0 && (
            <div className="flex items-center justify-center h-20">
              <p className="font-mono text-sm text-gray-500">
                No events scheduled.
              </p>
            </div>
          )}

          {events.map((event) => (
            <EventTile
              key={event.id}
              event={event}
              onClick={() => setSelectedEvent(event)}
            />
          ))}

          {/* Room bookings timeline */}
          {(rooms.length > 0 || roomsLoading) && (
            <div className="mt-4 pt-3 border-t border-gray-700">
              <div className="flex items-center gap-2 px-0 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brutal-accent" />
                <span className="font-mono text-[10px] text-brutal-accent tracking-[0.2em] font-bold">
                  ROOM BOOKINGS
                </span>
              </div>
              <RoomSchedule
                rooms={rooms}
                bookings={bookings}
                date={selectedDate}
                loading={roomsLoading}
              />
            </div>
          )}
        </div>
      </div>

      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </>
  );
}
