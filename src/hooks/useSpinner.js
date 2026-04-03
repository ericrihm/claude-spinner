import { useState, useEffect, useCallback, useRef } from 'react';
import { SPINNER_VERBS } from '../data/spinnerVerbs';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const SPEED_PRESETS = {
  chill: [2500, 3500],
  normal: [1500, 2500],
  hyperspeed: [400, 800],
  turbo: [100, 100],
};

const BRAILLE_CHARS = ['\u280B', '\u2819', '\u2839', '\u2838', '\u283C', '\u2834', '\u2826', '\u2827', '\u2807', '\u280F'];

export function useSpinner(speed = 'normal') {
  const [queue, setQueue] = useState(() => shuffle(SPINNER_VERBS));
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [history, setHistory] = useState([]);
  const [brailleIndex, setBrailleIndex] = useState(0);

  const currentVerb = queue[index] || queue[0];

  // Braille spinner animation (80ms)
  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => setBrailleIndex(i => (i + 1) % BRAILLE_CHARS.length), 80);
    return () => clearInterval(id);
  }, [isPaused]);

  // Verb cycling
  useEffect(() => {
    if (isPaused) return;
    const [min, max] = SPEED_PRESETS[speed] || SPEED_PRESETS.normal;
    const delay = min + Math.random() * (max - min);

    const id = setTimeout(() => {
      setHistory(prev => [currentVerb, ...prev].slice(0, 6));
      setIndex(prev => {
        const next = prev + 1;
        if (next >= queue.length) {
          setQueue(shuffle(SPINNER_VERBS));
          return 0;
        }
        return next;
      });
    }, delay);

    return () => clearTimeout(id);
  }, [isPaused, speed, index, queue, currentVerb]);

  const togglePause = useCallback(() => setIsPaused(p => !p), []);

  return {
    currentVerb,
    brailleChar: BRAILLE_CHARS[brailleIndex],
    isPaused,
    togglePause,
    history,
    verbIndex: index,
  };
}
