import { useState, useEffect } from "react";
import CalendarPanel from "./CalendarPanel";
import ChatPanel from "./ChatPanel";

function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="font-mono text-lg text-gray-400">
      {time.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}
    </span>
  );
}

export default function KioskLayout() {
  return (
    <div className="h-screen w-screen bg-brutal-black flex flex-col overflow-hidden">
      {/* Shared header */}
      <header className="flex-none px-6 py-3 border-b-2 border-brutal-accent flex items-center justify-between">
        <h1 className="font-display text-2xl text-brutal-white font-bold tracking-tight">
          DISTILLERY LABS
        </h1>
        <LiveClock />
      </header>

      {/* Split panels */}
      <div className="flex-1 flex overflow-hidden">
        {/* Calendar — 57% */}
        <div className="w-[57%] border-r-2 border-brutal-accent overflow-hidden">
          <CalendarPanel />
        </div>

        {/* Chat — 43% */}
        <div className="w-[43%] overflow-hidden">
          <ChatPanel />
        </div>
      </div>
    </div>
  );
}
