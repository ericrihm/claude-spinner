import { useState, useEffect } from "react";

const BRAILLE_FRAMES = ["\u280B", "\u2819", "\u2839", "\u2838", "\u283C", "\u2834", "\u2826", "\u2827", "\u2807", "\u280F"];

const TYPE_COLORS = {
  collectible: "#4ADE80",
  hazard: "#EF4444",
  golden: "#D97706",
  powerup: "#D97706",
};

export default function VerbBlock({ verb, x, type, icon, consumed, hit, height }) {
  const [brailleIdx, setBrailleIdx] = useState(() => Math.floor(Math.random() * BRAILLE_FRAMES.length));
  const color = TYPE_COLORS[type] || TYPE_COLORS.collectible;
  const isResolved = consumed || hit;

  // Cycle braille spinner at end of each verb
  useEffect(() => {
    if (isResolved || type === "powerup") return;
    const interval = setInterval(() => {
      setBrailleIdx((i) => (i + 1) % BRAILLE_FRAMES.length);
    }, 80);
    return () => clearInterval(interval);
  }, [isResolved, type]);

  return (
    <div
      className="absolute left-0 pointer-events-none select-none z-10"
      style={{
        bottom: 32,
        transform: `translateX(${x}px)`,
        willChange: "transform",
      }}
    >
      {/* Visual height bar — shows how tall the obstacle is */}
      {type !== "powerup" && !isResolved && (
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height,
            background: `linear-gradient(to top, ${color}15, transparent)`,
            borderLeft: `1px solid ${color}22`,
          }}
        />
      )}

      {/* Horizontal verb text at ground level */}
      <div
        className={`font-mono whitespace-nowrap ${
          type === "hazard" && !isResolved ? "animate-jitter" : ""
        }`}
        style={{
          color: isResolved ? (hit ? "#EF444433" : "#4ADE8022") : color,
          textShadow:
            type === "golden" && !isResolved
              ? `0 0 6px ${color}, 0 0 12px ${color}`
              : type === "hazard" && !isResolved
              ? `0 0 4px ${color}88`
              : "none",
          fontSize: type === "powerup" ? 16 : 13,
          transition: isResolved ? "color 0.3s" : "none",
        }}
      >
        {type === "powerup" ? (
          icon
        ) : (
          <>
            {verb}
            {!isResolved && (
              <span style={{ opacity: 0.5, marginLeft: 2 }}>
                {BRAILLE_FRAMES[brailleIdx]}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
