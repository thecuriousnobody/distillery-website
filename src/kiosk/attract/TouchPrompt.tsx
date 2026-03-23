import { motion } from "framer-motion";

export default function TouchPrompt() {
  return (
    <div className="h-full flex flex-col items-center justify-center relative overflow-hidden">
      {/* Subtle ambient glow */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        className="absolute pointer-events-none z-0"
        style={{
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background:
            "conic-gradient(from 0deg, transparent 0%, rgba(232,93,4,0.03) 25%, transparent 50%, rgba(232,93,4,0.02) 75%, transparent 100%)",
        }}
      />

      {/* === VERTICAL LAYOUT === */}
      <div className="flex flex-col items-center relative z-10 h-full justify-center gap-0 pt-10">

        {/* DISTILLERY — vertical letters, thicker */}
        <motion.div
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center leading-none"
        >
          {"DISTILLERY".split("").map((letter, i) => (
            <span
              key={i}
              className="text-brutal-white text-4xl font-bold tracking-widest"
              style={{
                fontFamily: "'Michroma', sans-serif",
                lineHeight: "1.25",
                textShadow: "0 0 20px rgba(245,245,245,0.15)",
              }}
            >
              {letter}
            </span>
          ))}
        </motion.div>

        {/* Taper line into orb */}
        <div className="w-px h-5 bg-gradient-to-b from-brutal-accent/30 to-brutal-accent/10" />

        {/* Touch orb with alembic */}
        <div className="relative flex items-center justify-center my-2">
          {/* The orb — thick ring is the glow */}
          <motion.div
            animate={{
              scale: [1, 1.03, 1],
              boxShadow: [
                "0 0 30px rgba(232,93,4,0.35), 0 0 60px rgba(232,93,4,0.12), inset 0 0 30px rgba(232,93,4,0.06)",
                "0 0 45px rgba(232,93,4,0.5), 0 0 80px rgba(232,93,4,0.2), inset 0 0 40px rgba(232,93,4,0.1)",
                "0 0 30px rgba(232,93,4,0.35), 0 0 60px rgba(232,93,4,0.12), inset 0 0 30px rgba(232,93,4,0.06)",
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative rounded-full flex flex-col items-center justify-center"
            style={{
              width: "148px",
              height: "148px",
              border: "4px solid rgba(232,93,4,0.7)",
              background:
                "radial-gradient(circle at 38% 38%, rgba(232,93,4,0.1) 0%, rgba(10,10,10,0.95) 45%, rgba(10,10,10,0.99) 100%)",
              backdropFilter: "blur(8px)",
            }}
          >
            {/* Specular highlight */}
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                top: "14%",
                left: "16%",
                width: "32%",
                height: "22%",
                background: "radial-gradient(ellipse, rgba(255,255,255,0.06) 0%, transparent 70%)",
                transform: "rotate(-15deg)",
              }}
            />

            <motion.div
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="text-center"
            >
              <span
                className="text-4xl block"
                style={{ filter: "drop-shadow(0 0 10px rgba(232,93,4,0.6))" }}
              >
                &#x2697;
              </span>
              <p
                className="text-white mt-1.5"
                style={{
                  fontFamily: "'Michroma', sans-serif",
                  fontSize: "13px",
                  letterSpacing: "0.3em",
                  textShadow: "0 0 12px rgba(255,255,255,0.4), 0 0 30px rgba(255,255,255,0.15)",
                }}
              >
                TOUCH
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Taper line from orb */}
        <div className="w-px h-5 bg-gradient-to-t from-brutal-accent/30 to-brutal-accent/10" />

        {/* LABS — vertical letters, thicker */}
        <motion.div
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="flex flex-col items-center leading-none"
        >
          {"LABS".split("").map((letter, i) => (
            <span
              key={i}
              className="text-brutal-accent text-4xl font-bold tracking-widest"
              style={{
                fontFamily: "'Michroma', sans-serif",
                lineHeight: "1.25",
                textShadow: "0 0 20px rgba(232,93,4,0.2)",
              }}
            >
              {letter}
            </span>
          ))}
        </motion.div>

        {/* Tagline */}
        <motion.p
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="font-mono text-[8px] text-gray-500 tracking-[0.3em] mt-6"
          style={{ writingMode: "vertical-rl" }}
        >
          PEORIA IL
        </motion.p>
      </div>
    </div>
  );
}
