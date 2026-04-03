import { motion } from "framer-motion";
import { COMMENTARY } from "../../data/commentary";

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function GameOverScreen({ stats, elapsed, onPlayAgain, onBack }) {
  const gameOverLine = COMMENTARY.gameOver[Math.floor(Math.random() * COMMENTARY.gameOver.length)];

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center z-30"
      style={{ backgroundColor: "rgba(13, 17, 23, 0.9)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div
        className="font-mono text-sm p-6 max-w-sm w-full"
        style={{
          border: "1px solid #30363D",
          backgroundColor: "#0D1117",
        }}
      >
        {/* Header */}
        {stats.isNewHighScore && (
          <motion.div
            className="text-center mb-2 text-xs font-bold"
            style={{ color: "#D97706" }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            ★ NEW HIGH SCORE ★
          </motion.div>
        )}

        <div className="text-center mb-4" style={{ color: "#EF4444" }}>
          SESSION TERMINATED
        </div>

        {/* Stats */}
        <div className="space-y-1 mb-4" style={{ color: "#4ADE80" }}>
          <div className="flex justify-between">
            <span style={{ color: "#6B7280" }}>Tokens consumed:</span>
            <span>{stats.tokens.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "#6B7280" }}>Verbs collected:</span>
            <span>{stats.verbsCollected} / 187</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "#6B7280" }}>Longest streak:</span>
            <span>{stats.bestCombo}x</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "#6B7280" }}>Phase reached:</span>
            <span>{stats.phase}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "#6B7280" }}>Time survived:</span>
            <span>{formatTime(elapsed)}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-center mb-4">
          <button
            onClick={onPlayAgain}
            className="px-4 py-2 font-mono text-xs border cursor-pointer hover:bg-white/5 transition-colors"
            style={{ color: "#4ADE80", borderColor: "#4ADE80" }}
          >
            [PLAY AGAIN]
          </button>
          <button
            onClick={onBack}
            className="px-4 py-2 font-mono text-xs border cursor-pointer hover:bg-white/5 transition-colors"
            style={{ color: "#6B7280", borderColor: "#30363D" }}
          >
            [BACK TO SPINNER]
          </button>
        </div>

        {/* Commentary */}
        <div className="text-center text-[10px]" style={{ color: "#6B728066" }}>
          &gt; {gameOverLine}
        </div>
      </div>
    </motion.div>
  );
}
