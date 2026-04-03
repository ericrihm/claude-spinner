import { motion, AnimatePresence } from "framer-motion";

const BRAILLE_LIFE = "⠋";
const EMPTY_LIFE = "○";

export default function GameHUD({ tokens, combo, lives, verbsCollected, totalVerbs = 187, isNewHighScore }) {
  return (
    <div className="flex items-center justify-between px-3 py-1 font-mono text-xs" style={{ color: "#6B7280" }}>
      {/* Left: tokens */}
      <div className="flex items-center gap-2">
        <span>tokens: <span style={{ color: "#4ADE80" }}>{tokens.toLocaleString()}</span></span>
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

      {/* Center: streak */}
      <div>
        {combo > 1 && (
          <motion.span
            key={combo}
            initial={{ scale: 1.3, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ color: combo >= 10 ? "#D97706" : "#4ADE80" }}
          >
            streak: {combo}x
          </motion.span>
        )}
      </div>

      {/* Right: lives + verb count */}
      <div className="flex items-center gap-3">
        <span className="text-[10px]">verbs: {verbsCollected}/{totalVerbs}</span>
        <span>
          {Array.from({ length: Math.max(lives, 0) }, () => BRAILLE_LIFE).join(" ")}
          {lives < 3 && Array.from({ length: 3 - Math.max(lives, 0) }, () => EMPTY_LIFE).join(" ")}
        </span>
      </div>
    </div>
  );
}
