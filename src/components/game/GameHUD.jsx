import { motion, AnimatePresence } from "framer-motion";

const BRAILLE_LIFE = "\u280B";
const EMPTY_LIFE = "\u25CB";
const TOTAL_VERBS = 187;

export default function GameHUD({ tokens, combo, lives, verbsCollected, uniqueVerbs = 0, isNewHighScore }) {
  const usagePercent = Math.min(100, Math.round((uniqueVerbs / TOTAL_VERBS) * 100));

  return (
    <div
      className="px-3 py-2 font-mono text-xs"
      style={{ borderBottom: "1px solid #30363D22" }}
    >
      {/* Top row: tokens + lives */}
      <div className="flex items-center justify-between mb-2" style={{ color: "#6B7280" }}>
        <div className="flex items-center gap-2">
          <span>
            tokens:{" "}
            <span style={{ color: "#4ADE80" }}>
              {Math.floor(tokens).toLocaleString()}
            </span>
          </span>
          <AnimatePresence>
            {isNewHighScore && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [0.5, 1, 0.5], scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                style={{ color: "#D97706" }}
              >
                NEW BEST
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-3">
          {combo > 1 && (
            <motion.span
              key={combo}
              initial={{ scale: 1.3, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ color: combo >= 10 ? "#D97706" : "#4ADE80" }}
            >
              {combo}x
            </motion.span>
          )}
          <span>
            {Array.from({ length: Math.max(lives, 0) }, () => BRAILLE_LIFE).join(" ")}
            {lives < 5 &&
              " " +
              Array.from(
                { length: 5 - Math.max(lives, 0) },
                () => EMPTY_LIFE
              ).join(" ")}
          </span>
        </div>
      </div>

      {/* Usage limits — styled like Claude's plan usage page */}
      <div className="space-y-1.5">
        {/* Current session */}
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0" style={{ width: 90 }}>
            <div className="text-[10px] font-bold" style={{ color: "#e6edf3" }}>
              Current session
            </div>
            <div className="text-[8px]" style={{ color: "#6B7280" }}>
              {TOTAL_VERBS - uniqueVerbs} verbs remaining
            </div>
          </div>
          <div
            className="flex-1 h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: "#30363D" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${usagePercent}%`,
                backgroundColor: "#5B9CFA",
                transition: "width 0.3s",
              }}
            />
          </div>
          <span
            className="flex-shrink-0 text-[10px]"
            style={{ color: "#e6edf3", width: 55, textAlign: "right" }}
          >
            {usagePercent}% used
          </span>
        </div>
      </div>
    </div>
  );
}
