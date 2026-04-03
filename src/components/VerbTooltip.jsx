import { motion, AnimatePresence } from 'framer-motion';
import { VERB_DEFINITIONS } from '../data/verbDefinitions';

export default function VerbTooltip({ verb, position, onClose }) {
  if (!verb) return null;

  const definition = VERB_DEFINITIONS[verb] || "We're not sure either.";

  return (
    <AnimatePresence>
      {verb && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="fixed z-50 max-w-xs p-3 rounded-lg border border-terminal-border bg-[#161B22] shadow-xl"
          style={{
            left: position?.x ?? '50%',
            top: position?.y ?? '50%',
          }}
        >
          <div className="flex justify-between items-start gap-2">
            <div>
              <div className="text-verb-active text-sm font-bold mb-1">{verb}</div>
              <div className="text-verb-ghost text-xs leading-relaxed">{definition}</div>
            </div>
            <button
              onClick={onClose}
              className="text-verb-ghost hover:text-white text-xs shrink-0"
            >
              {'\u2715'}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
