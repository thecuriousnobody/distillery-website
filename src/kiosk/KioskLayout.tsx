import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BottomNav, { type KioskTab } from "./BottomNav";
import TodayPanel from "./TodayPanel";
import ProgramsPanel from "./ProgramsPanel";
import AboutPanel from "./AboutPanel";
import ChatPanel from "./ChatPanel";
import AttractMode from "./AttractMode";
import { useIdleTimer } from "./hooks/useIdleTimer";

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
  const [isAttractMode, setIsAttractMode] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const enterAttractMode = useCallback(() => {
    setIsAttractMode(true);
    setIsTransitioning(false);
    setActiveTab("today");
  }, []);

  const exitAttractMode = useCallback(() => {
    // Start the fly-up transition
    setIsTransitioning(true);
    // After animation completes, switch to interactive mode
    setTimeout(() => {
      setIsAttractMode(false);
      setIsTransitioning(false);
    }, 600);
  }, []);

  // 2 minutes idle in interactive mode → return to attract mode
  useIdleTimer(enterAttractMode, 120_000, !isAttractMode && !isTransitioning);

  // Wake Lock — prevent screen from dimming/sleeping (kiosk stays on)
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;

    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          wakeLock = await navigator.wakeLock.request("screen");
        }
      } catch {
        // Wake lock can fail if tab is not visible — silently ignore
      }
    };

    requestWakeLock();

    // Re-acquire on tab visibility change (browser releases it when hidden)
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") requestWakeLock();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      wakeLock?.release();
    };
  }, []);

  return (
    <div className="h-screen w-screen bg-brutal-black flex flex-col overflow-hidden relative">
      {/* Header — minimal in attract mode, full in interactive */}
      <header className="flex-none px-6 py-3 border-b-2 border-brutal-accent flex items-center justify-between relative z-50">
        {isAttractMode ? (
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-brutal-accent tracking-[0.3em]">
              {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toUpperCase()}
            </span>
          </div>
        ) : (
          <div>
            <h1 className="font-display text-2xl tracking-wider leading-none">
              <span className="text-brutal-white">DISTILLERY </span>
              <span className="text-brutal-accent">LABS</span>
            </h1>
            <p className="font-mono text-[10px] text-brutal-mid tracking-[0.2em]">PEORIA, ILLINOIS</p>
          </div>
        )}
        <div className="flex items-center gap-3">
          <div
            className="inline-flex items-center gap-2 select-none"
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: "10px",
              fontWeight: 300,
              letterSpacing: "2px",
              color: "#F5F5F5",
              opacity: 0.35,
              whiteSpace: "nowrap",
              textShadow:
                "0 0 8px rgba(245,245,245,0.3), 0 0 20px rgba(245,245,245,0.1)",
            }}
          >
            <svg width="12" height="16" viewBox="0 0 56 80" fill="none"
              style={{ filter: "drop-shadow(0 0 6px rgba(245,245,245,0.3))" }}
            >
              <circle cx="28" cy="14" r="11" fill="#F5F5F5" opacity="0.85" />
              <line x1="28" y1="26" x2="28" y2="54" stroke="#F5F5F5" strokeWidth="4" strokeLinecap="round" opacity="0.75" />
              <line x1="28" y1="34" x2="12" y2="48" stroke="#F5F5F5" strokeWidth="3.5" strokeLinecap="round" opacity="0.55" />
              <line x1="28" y1="34" x2="44" y2="48" stroke="#F5F5F5" strokeWidth="3.5" strokeLinecap="round" opacity="0.55" />
              <line x1="28" y1="54" x2="14" y2="76" stroke="#F5F5F5" strokeWidth="3.5" strokeLinecap="round" opacity="0.35" />
              <line x1="28" y1="54" x2="42" y2="76" stroke="#F5F5F5" strokeWidth="3.5" strokeLinecap="round" opacity="0.35" />
            </svg>
            <span style={{ opacity: 0.5 }}>|</span>
            {" the curious nobody "}
            <span style={{ opacity: 0.5 }}>|</span>
            {" the idea sandbox llc "}
          </div>
          <span className="text-gray-600 mx-1">|</span>
          <LiveClock />
        </div>
      </header>

      <AnimatePresence mode="wait">
        {isAttractMode ? (
          <motion.div
            key="attract"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 overflow-hidden relative"
          >
            <AttractMode onDismiss={exitAttractMode} />

            {/* Fly-to-header overlay animation */}
            <AnimatePresence>
              {isTransitioning && (
                <motion.div
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="absolute inset-0 z-40 pointer-events-none"
                >
                  {/* Flying brand element */}
                  <motion.div
                    initial={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      x: "-50%",
                      y: "-50%",
                      scale: 1,
                    }}
                    animate={{
                      top: "-20px",
                      left: "24px",
                      x: "0%",
                      y: "0%",
                      scale: 0.3,
                      opacity: 0,
                    }}
                    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                    className="text-center flex flex-col items-center"
                  >
                    <h1
                      className="text-4xl text-brutal-white tracking-wider leading-none"
                      style={{ fontFamily: "'Michroma', sans-serif" }}
                    >
                      DISTILLERY
                    </h1>
                    <span className="text-3xl my-1">&#x2697;</span>
                    <h1
                      className="text-4xl text-brutal-accent tracking-wider leading-none"
                      style={{ fontFamily: "'Michroma', sans-serif" }}
                    >
                      LABS
                    </h1>
                    {/* Shrinking glow */}
                    <motion.div
                      initial={{
                        width: 128,
                        height: 128,
                        opacity: 0.4,
                      }}
                      animate={{
                        width: 0,
                        height: 0,
                        opacity: 0,
                      }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="mx-auto mt-4 rounded-full bg-brutal-accent"
                      style={{ boxShadow: "0 0 60px rgba(232, 93, 4, 0.4)" }}
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="interactive"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Active tab content */}
            <main className="flex-1 overflow-hidden">
              {activeTab === "today" && <TodayPanel />}
              {activeTab === "programs" && <ProgramsPanel />}
              {activeTab === "about" && <AboutPanel />}
              {activeTab === "concierge" && <ChatPanel />}
            </main>

            {/* Bottom navigation */}
            <BottomNav active={activeTab} onTabChange={setActiveTab} />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
