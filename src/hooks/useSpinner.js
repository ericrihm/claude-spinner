import { useState, useEffect, useCallback, useRef } from 'react';
import { SPINNER_VERBS } from '../data/spinnerVerbs';
import { BUDDIES } from '../data/buddies';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Weighted timing buckets — simulates real Claude Code's irregular rhythm
// Minimum display time is 500ms so verbs are always readable
const TIMING_BUCKETS = [
  { name: 'fast',    min: 500,  max: 800,  weight: 25 },
  { name: 'normal',  min: 800,  max: 1500, weight: 50 },
  { name: 'hang',    min: 2000, max: 4000, weight: 15 },
  { name: 'stutter', min: 500,  max: 600,  weight: 10 },
];

const TOTAL_WEIGHT = TIMING_BUCKETS.reduce((s, b) => s + b.weight, 0);

// Speed modes multiply delay by a scalar — preserves organic rhythm at all speeds
// Tuned so chill feels leisurely (~1–4s per verb) and hyperspeed feels frantic (~50–200ms)
const SPEED_SCALARS = {
  chill: 3.5,
  normal: 1.0,
  hyperspeed: 0.15,
  turbo: 0.05,
};

function pickBucket() {
  let roll = Math.random() * TOTAL_WEIGHT;
  for (const bucket of TIMING_BUCKETS) {
    roll -= bucket.weight;
    if (roll <= 0) return bucket;
  }
  return TIMING_BUCKETS[1]; // fallback to normal
}

function rollDelay(speedScalar) {
  const bucket = pickBucket();
  const base = bucket.min + Math.random() * (bucket.max - bucket.min);
  return { delay: Math.max(500, Math.round(base * speedScalar)), bucket };
}

const BRAILLE_CHARS = ['\u280B', '\u2819', '\u2839', '\u2838', '\u283C', '\u2834', '\u2826', '\u2827', '\u2807', '\u280F'];

export function useSpinner(speed = 'normal') {
  const [queue, setQueue] = useState(() => shuffle(SPINNER_VERBS));
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [history, setHistory] = useState([]);
  const [brailleIndex, setBrailleIndex] = useState(0);
  const [currentBuddyIdx, setCurrentBuddyIdx] = useState(() =>
    Math.floor(Math.random() * BUDDIES.length)
  );
  const lastBuddyRef = useRef(-1);
  const entryIdRef = useRef(0);
  const timerRef = useRef(null);
  const stutterRemaining = useRef(0);
  const verbStartRef = useRef(Date.now());

  const currentVerb = queue[index] || queue[0];

  // Braille spinner animation (80ms)
  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => setBrailleIndex(i => (i + 1) % BRAILLE_CHARS.length), 80);
    return () => clearInterval(id);
  }, [isPaused]);

  // Advance to next verb — extracted so stutter bursts can call it repeatedly
  const advanceVerb = useCallback(() => {
    // Pick a buddy that's different from the last one
    let nextBuddy;
    do {
      nextBuddy = Math.floor(Math.random() * BUDDIES.length);
    } while (nextBuddy === lastBuddyRef.current && BUDDIES.length > 1);
    lastBuddyRef.current = nextBuddy;
    setCurrentBuddyIdx(nextBuddy);
    entryIdRef.current += 1;

    // Calculate how long this verb was displayed
    const now = Date.now();
    const duration = now - verbStartRef.current;
    verbStartRef.current = now;

    setHistory(prev => [{
      id: entryIdRef.current,
      verb: queue[index] || queue[0],
      buddyIdx: nextBuddy,
      duration,
    }, ...prev].slice(0, 50));

    setIndex(prev => {
      const next = prev + 1;
      if (next >= queue.length) {
        setQueue(shuffle(SPINNER_VERBS));
        return 0;
      }
      return next;
    });
  }, [index, queue]);

  // Verb cycling — setTimeout chain with weighted variable delays
  useEffect(() => {
    if (isPaused) return;

    const scalar = SPEED_SCALARS[speed] ?? SPEED_SCALARS.normal;

    // If in a stutter burst, use stutter timing
    let delay;
    if (stutterRemaining.current > 0) {
      stutterRemaining.current -= 1;
      const base = 500 + Math.random() * 200; // 500–700ms
      delay = Math.max(500, Math.round(base * scalar));
    } else {
      const roll = rollDelay(scalar);
      delay = roll.delay;
      // If stutter bucket was picked, queue up 1–3 MORE rapid swaps after this one
      if (roll.bucket.name === 'stutter') {
        stutterRemaining.current = 1 + Math.floor(Math.random() * 3); // 1–3 more
      }
    }

    // Add buddy transition beat — slightly longer pause when buddy changes
    if (stutterRemaining.current === 0 && lastBuddyRef.current >= 0 && Math.random() < 0.3) {
      delay += 300 + Math.random() * 300; // 300–600ms extra
    }

    timerRef.current = setTimeout(() => {
      advanceVerb();
    }, delay);

    return () => {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, [isPaused, speed, index, queue, currentVerb, advanceVerb]);

  // Pause clears the active timeout — resume starts a fresh chain via the effect re-running
  const togglePause = useCallback(() => {
    setIsPaused(p => {
      if (!p) {
        // Pausing — clear any pending timer immediately
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        stutterRemaining.current = 0;
      } else {
        // Resuming — reset verb start time so duration isn't inflated by pause
        verbStartRef.current = Date.now();
      }
      return !p;
    });
  }, []);

  return {
    currentVerb,
    brailleChar: BRAILLE_CHARS[brailleIndex],
    isPaused,
    togglePause,
    history,
    verbIndex: index,
    currentBuddyIdx,
  };
}
