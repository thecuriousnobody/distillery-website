import { motion } from "framer-motion";

export default function TouchPrompt() {
  return (
    <div className="h-full flex flex-col items-center justify-center relative overflow-hidden">
      {/* Subtle ambient glow — reduced so side panels stay readable */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        className="absolute pointer-events-none z-0"
        style={{
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background:
            "conic-gradient(from 0deg, transparent 0%, rgba(232,93,4,0.03) 25%, transparent 50%, rgba(232,93,4,0.02) 75%, transparent 100%)",
        }}
      />

      {/* Nebula ambient — very subtle */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        className="absolute pointer-events-none z-0"
        style={{
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at 30% 40%, rgba(232,93,4,0.04) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(255,140,0,0.03) 0%, transparent 50%)",
          filter: "blur(40px)",
        }}
      />

      {/* === HOURGLASS LAYOUT === */}
      <div className="flex flex-col items-center relative z-10 h-full justify-center">

        {/* TOP: DISTILLERY ⚗ LABS — horizontal */}
        <motion.div
          animate={{ opacity: [0.75, 1, 0.75] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="flex items-baseline gap-3 mb-2"
        >
          <h1 className="font-display text-5xl text-brutal-white tracking-[0.15em] leading-none font-extrabold">
            DISTILLERY
          </h1>
          <span className="text-4xl" style={{ filter: "drop-shadow(0 0 8px rgba(232,93,4,0.5))" }}>
            &#x2697;
          </span>
          <h1 className="font-display text-5xl text-brutal-accent tracking-[0.15em] leading-none font-extrabold">
            LABS
          </h1>
        </motion.div>

        <p className="font-mono text-[9px] text-brutal-mid tracking-[0.5em] mb-10">
          PEORIA, ILLINOIS
        </p>

        {/* HOURGLASS NECK — tapered lines converging to the orb */}
        <div className="relative flex flex-col items-center" style={{ height: "60px" }}>
          {/* Left taper line */}
          <div
            className="absolute"
            style={{
              left: "-60px",
              top: "0",
              width: "1px",
              height: "100%",
              background: "linear-gradient(to bottom, rgba(232,93,4,0.3), rgba(232,93,4,0.08))",
              transform: "rotate(25deg)",
              transformOrigin: "bottom center",
            }}
          />
          {/* Right taper line */}
          <div
            className="absolute"
            style={{
              right: "-60px",
              top: "0",
              width: "1px",
              height: "100%",
              background: "linear-gradient(to bottom, rgba(232,93,4,0.3), rgba(232,93,4,0.08))",
              transform: "rotate(-25deg)",
              transformOrigin: "bottom center",
            }}
          />
          {/* Center taper gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to bottom, transparent, rgba(232,93,4,0.03))",
              clipPath: "polygon(30% 0%, 70% 0%, 52% 100%, 48% 100%)",
            }}
          />
        </div>

        {/* === THE BEAKER BELLY — touch orb === */}
        <div className="relative flex items-center justify-center my-4">
          {/* Outer ambient glow — gentle */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.04, 0.015, 0.04] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute rounded-full bg-brutal-accent"
            style={{ width: "360px", height: "360px" }}
          />

          {/* Mid glow */}
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.03, 0.08] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute rounded-full bg-brutal-accent"
            style={{ width: "300px", height: "300px", filter: "blur(20px)" }}
          />

          {/* Inner corona ring */}
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.15, 0.06, 0.15],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            className="absolute rounded-full"
            style={{
              width: "260px",
              height: "260px",
              border: "1px solid rgba(232,93,4,0.2)",
              background: "radial-gradient(circle, transparent 55%, rgba(232,93,4,0.06) 100%)",
            }}
          />

          {/* The button — glassmorphic orb */}
          <motion.div
            animate={{
              scale: [1, 1.025, 1],
              boxShadow: [
                "0 0 40px rgba(232,93,4,0.3), 0 0 100px rgba(232,93,4,0.1), inset 0 0 40px rgba(232,93,4,0.04)",
                "0 0 60px rgba(232,93,4,0.45), 0 0 130px rgba(232,93,4,0.18), inset 0 0 60px rgba(232,93,4,0.06)",
                "0 0 40px rgba(232,93,4,0.3), 0 0 100px rgba(232,93,4,0.1), inset 0 0 40px rgba(232,93,4,0.04)",
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative rounded-full border border-brutal-accent/40 flex items-center justify-center"
            style={{
              width: "220px",
              height: "220px",
              background:
                "radial-gradient(circle at 38% 38%, rgba(232,93,4,0.08) 0%, rgba(10,10,10,0.96) 45%, rgba(10,10,10,0.99) 100%)",
              backdropFilter: "blur(8px)",
            }}
          >
            {/* Glass specular highlight */}
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                top: "14%",
                left: "16%",
                width: "32%",
                height: "22%",
                background:
                  "radial-gradient(ellipse, rgba(255,255,255,0.05) 0%, transparent 70%)",
                transform: "rotate(-15deg)",
              }}
            />

            {/* Button text — thin, elegant */}
            <motion.div
              animate={{ opacity: [0.55, 1, 0.55] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="text-center"
            >
              <p
                className="text-brutal-accent tracking-[0.35em] leading-relaxed"
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontWeight: 300,
                  fontSize: "15px",
                  letterSpacing: "0.35em",
                }}
              >
                TOUCH TO
              </p>
              <p
                className="text-brutal-accent"
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontWeight: 300,
                  fontSize: "28px",
                  letterSpacing: "0.25em",
                }}
              >
                START
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* HOURGLASS FLARE — taper lines below the orb expanding back out */}
        <div className="relative flex flex-col items-center" style={{ height: "60px" }}>
          {/* Left flare line */}
          <div
            className="absolute"
            style={{
              left: "-60px",
              bottom: "0",
              width: "1px",
              height: "100%",
              background: "linear-gradient(to top, rgba(232,93,4,0.3), rgba(232,93,4,0.08))",
              transform: "rotate(-25deg)",
              transformOrigin: "top center",
            }}
          />
          {/* Right flare line */}
          <div
            className="absolute"
            style={{
              right: "-60px",
              bottom: "0",
              width: "1px",
              height: "100%",
              background: "linear-gradient(to top, rgba(232,93,4,0.3), rgba(232,93,4,0.08))",
              transform: "rotate(25deg)",
              transformOrigin: "top center",
            }}
          />
          {/* Center flare gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to top, transparent, rgba(232,93,4,0.03))",
              clipPath: "polygon(48% 0%, 52% 0%, 70% 100%, 30% 100%)",
            }}
          />
        </div>

        {/* BOTTOM tagline — below the hourglass */}
        <motion.p
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="font-mono text-[10px] text-gray-500 tracking-[0.3em] mt-8"
        >
          WHERE IDEAS BECOME REALITY
        </motion.p>
      </div>

      {/* Hint at very bottom */}
      <div className="absolute bottom-8 text-center">
        <motion.p
          animate={{ opacity: [0.12, 0.35, 0.12] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="font-mono text-[9px] text-gray-600"
        >
          Tap anywhere on screen
        </motion.p>
      </div>
    </div>
  );
}
