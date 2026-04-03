import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Commentary({ text }) {
  const [displayedText, setDisplayedText] = useState("");
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);
  const fadeTimerRef = useRef(null);

  useEffect(() => {
    if (!text) {
      setVisible(false);
      return;
    }

    // Reset
    setDisplayedText("");
    setVisible(true);
    let index = 0;

    // Clear previous timers
    if (timerRef.current) clearInterval(timerRef.current);
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);

    // Typewriter effect
    timerRef.current = setInterval(() => {
      index++;
      if (index <= text.length) {
        setDisplayedText(text.slice(0, index));
      } else {
        clearInterval(timerRef.current);
        // Fade out after 3 seconds
        fadeTimerRef.current = setTimeout(() => {
          setVisible(false);
        }, 3000);
      }
    }, 25); // ~0.5s for 20 char message

    return () => {
      clearInterval(timerRef.current);
      clearTimeout(fadeTimerRef.current);
    };
  }, [text]);

  return (
    <div className="absolute top-8 left-0 right-0 flex justify-center pointer-events-none z-20">
      <AnimatePresence>
        {visible && displayedText && (
          <motion.div
            className="font-mono text-xs px-3 py-1"
            style={{ color: "#6B7280" }}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 0.8, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            &gt; {displayedText}
            <span className="animate-blink">_</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
