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
            <h1 className="font-display text-2xl text-brutal-white tracking-wider leading-none">
              DISTILLERY LABS
            </h1>
            <p className="font-mono text-[10px] text-brutal-mid tracking-[0.2em]">PEORIA, ILLINOIS</p>
          </div>
        )}
        <LiveClock />
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
                    className="text-center"
                  >
                    <h1 className="font-display text-4xl text-brutal-white tracking-wider leading-none">
                      DISTILLERY
                    </h1>
                    <h1 className="font-display text-4xl text-brutal-accent tracking-wider leading-none">
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

      {/* Branding watermark */}
      <div className="absolute bottom-1 left-0 right-0 text-center pointer-events-none z-50">
        <span
          className="text-[9px] tracking-[0.35em] uppercase text-white/[0.08]"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          Idea Sandbox LLC
        </span>
      </div>
    </div>
  );
}
