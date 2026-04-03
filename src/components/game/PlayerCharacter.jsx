import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";

const BRAILLE_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

export default function PlayerCharacter({ y, isCharging, isGrounded, isHit, speedMultiplier = 1 }) {
  const [frameIndex, setFrameIndex] = useState(0);
  const [trail, setTrail] = useState([]);
  const prevY = useRef(0);

  // Cycle braille frames based on game speed
  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndex((i) => (i + 1) % BRAILLE_FRAMES.length);
    }, Math.max(40, 80 / speedMultiplier));
    return () => clearInterval(interval);
  }, [speedMultiplier]);

  // Update motion trail when airborne
  useEffect(() => {
    if (!isGrounded) {
      setTrail((prev) => {
        const next = [prevY.current, ...prev].slice(0, 3);
        return next;
      });
    } else {
      setTrail([]);
    }
    prevY.current = y;
  }, [y, isGrounded]);

  const color = isHit ? "#EF4444" : isCharging ? "#86EFAC" : "#4ADE80";

  return (
    <div
      className="absolute left-[15%] pointer-events-none"
      style={{
        bottom: `${32 - y}px`,
        transition: "none",
      }}
    >
      {/* Motion trail */}
      <AnimatePresence>
        {trail.map((trailY, i) => (
          <motion.span
            key={`trail-${i}`}
            className="absolute font-mono text-xl"
            style={{
              color: "#4ADE80",
              opacity: 0.15 - i * 0.05,
              bottom: `${-y + trailY}px`,
              left: `${-(i + 1) * 8}px`,
            }}
            initial={{ opacity: 0.2 }}
            animate={{ opacity: 0.15 - i * 0.05 }}
            exit={{ opacity: 0 }}
          >
            {BRAILLE_FRAMES[(frameIndex - i - 1 + BRAILLE_FRAMES.length) % BRAILLE_FRAMES.length]}
          </motion.span>
        ))}
      </AnimatePresence>

      {/* Main character */}
      <span
        className="font-mono text-xl relative z-10"
        style={{
          color,
          textShadow: isCharging
            ? `0 0 8px ${color}, 0 0 16px ${color}`
            : isHit
            ? "0 0 8px #EF4444"
            : "none",
          transition: "color 0.1s, text-shadow 0.1s",
        }}
      >
        {BRAILLE_FRAMES[frameIndex]}
      </span>

      {/* Charge indicator */}
      {isCharging && (
        <motion.span
          className="absolute -bottom-4 left-0 text-xs font-mono"
          style={{ color: "#6B7280" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ repeat: Infinity, duration: 0.6 }}
        >
          ...
        </motion.span>
      )}
    </div>
  );
}
