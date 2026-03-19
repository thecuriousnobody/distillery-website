import { useState, useEffect } from "react";
import BottomNav, { type KioskTab } from "./BottomNav";
import TodayPanel from "./TodayPanel";
import ProgramsPanel from "./ProgramsPanel";
import AboutPanel from "./AboutPanel";
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
  const [activeTab, setActiveTab] = useState<KioskTab>("today");

  return (
    <div className="h-screen w-screen bg-brutal-black flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-none px-6 py-3 border-b-2 border-brutal-accent flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-brutal-white font-bold tracking-tight leading-none">
            Distillery Labs
          </h1>
          <p className="font-mono text-xs text-gray-400">Peoria, Illinois</p>
        </div>
        <LiveClock />
      </header>

      {/* Active tab content */}
      <main className="flex-1 overflow-hidden">
        {activeTab === "today" && <TodayPanel />}
        {activeTab === "programs" && <ProgramsPanel />}
        {activeTab === "about" && <AboutPanel />}
        {activeTab === "concierge" && <ChatPanel />}
      </main>

      {/* Bottom navigation */}
      <BottomNav active={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
