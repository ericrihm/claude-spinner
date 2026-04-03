import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpinner } from '../hooks/useSpinner';
import { useVerbTracker } from '../hooks/useVerbTracker';

const THEMES = {
  dark: { bg: 'rgba(13, 17, 23, 0.95)', text: '#4ADE80', ghost: '#6B7280' },
  light: { bg: 'rgba(255, 255, 255, 0.95)', text: '#16a34a', ghost: '#9ca3af' },
  terminal: { bg: 'rgba(0, 0, 0, 0.97)', text: '#00ff00', ghost: '#336633' },
};

/**
 * SpinnerEasterEgg - Standalone overlay component
 *
 * @param {number} duration - How long to show (ms). Omit for indefinite.
 * @param {function} onComplete - Called when duration expires or user dismisses.
 * @param {'dark'|'light'|'terminal'} theme - Visual theme.
 * @param {boolean} showStats - Show verb counter.
 */
export default function SpinnerEasterEgg({
  duration,
  onComplete,
  theme = 'dark',
  showStats = false,
}) {
  const [visible, setVisible] = useState(true);
  const { currentVerb, brailleChar, history } = useSpinner('normal');
  const { trackVerb, uniqueCount, percentage } = useVerbTracker();
  const colors = THEMES[theme] || THEMES.dark;

  // Track verbs
  useEffect(() => {
    if (currentVerb) trackVerb(currentVerb);
  }, [currentVerb, trackVerb]);

  // Auto-dismiss after duration
  useEffect(() => {
    if (!duration) return;
    const id = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onComplete?.(), 500);
    }, duration);
    return () => clearTimeout(id);
  }, [duration, onComplete]);

  const dismiss = useCallback(() => {
    setVisible(false);
    setTimeout(() => onComplete?.(), 500);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          onClick={dismiss}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: colors.bg,
            backdropFilter: 'blur(8px)',
            cursor: 'pointer',
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '480px', padding: '2rem' }}>
            {/* Ghost history */}
            <div style={{ marginBottom: '1rem' }}>
              {history.slice(0, 3).map((verb, i) => (
                <div
                  key={`${verb}-${i}`}
                  style={{
                    color: colors.ghost,
                    opacity: 0.5 - i * 0.15,
                    fontSize: '14px',
                    marginBottom: '4px',
                  }}
                >
                  {'\u2714'} {verb}...
                </div>
              ))}
            </div>

            {/* Active verb */}
            <motion.div
              key={currentVerb}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ color: colors.text, fontSize: '18px', fontWeight: 'bold' }}
            >
              {brailleChar} {currentVerb}...
            </motion.div>

            {/* Stats */}
            {showStats && (
              <div style={{ color: colors.ghost, fontSize: '11px', marginTop: '1.5rem' }}>
                {uniqueCount} of 187 verbs seen ({percentage}%)
              </div>
            )}

            {/* Dismiss hint */}
            <div style={{ color: colors.ghost, fontSize: '10px', marginTop: '2rem', opacity: 0.5 }}>
              Click anywhere to dismiss
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
