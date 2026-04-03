import { motion } from "framer-motion";

const TYPE_STYLES = {
  collectible: { color: "#4ADE80" },
  hazard: { color: "#EF4444" },
  golden: { color: "#D97706" },
  powerup: { color: "#D97706" },
};

export default function VerbBlock({ verb, x, y, type, icon }) {
  const style = TYPE_STYLES[type] || TYPE_STYLES.collectible;

  return (
    <motion.div
      className={`absolute font-mono text-sm whitespace-nowrap pointer-events-none select-none ${
        type === "hazard" ? "animate-jitter" : ""
      }`}
      style={{
        transform: `translateX(${x}px)`,
        bottom: `${32 - y}px`,
        color: style.color,
        textShadow: type === "golden" ? `0 0 6px ${style.color}, 0 0 12px ${style.color}` : "none",
        willChange: "transform",
      }}
      initial={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
    >
      {type === "powerup" ? (
        <span className="text-lg">{icon}</span>
      ) : (
        verb
      )}
    </motion.div>
  );
}
