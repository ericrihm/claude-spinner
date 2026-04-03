import { useState, useCallback, useRef } from 'react';
import { SPINNER_VERBS } from '../data/spinnerVerbs';

export function useVerbTracker() {
  const [seen, setSeen] = useState(new Set());
  const [totalSeen, setTotalSeen] = useState(0);
  const [streak, setStreak] = useState(0);
  const countsRef = useRef({});
  const lastVerbRef = useRef(null);

  const trackVerb = useCallback((verb) => {
    setSeen(prev => {
      const next = new Set(prev);
      next.add(verb);
      return next;
    });
    setTotalSeen(prev => prev + 1);
    countsRef.current[verb] = (countsRef.current[verb] || 0) + 1;

    if (verb !== lastVerbRef.current) {
      setStreak(prev => prev + 1);
    } else {
      setStreak(1);
    }
    lastVerbRef.current = verb;
  }, []);

  const uniqueCount = seen.size;
  const percentage = Math.round((uniqueCount / SPINNER_VERBS.length) * 100);
  const isComplete = uniqueCount === SPINNER_VERBS.length;

  const getMostSeen = useCallback(() => {
    let max = ['', 0];
    for (const [v, c] of Object.entries(countsRef.current)) {
      if (c > max[1]) max = [v, c];
    }
    return max[0];
  }, []);

  const getLeastSeen = useCallback(() => {
    const entries = Object.entries(countsRef.current);
    if (!entries.length) return '';
    let min = ['', Infinity];
    for (const [v, c] of entries) {
      if (c < min[1]) min = [v, c];
    }
    return min[0];
  }, []);

  return {
    trackVerb,
    seen,
    uniqueCount,
    totalSeen,
    percentage,
    isComplete,
    streak,
    getMostSeen,
    getLeastSeen,
    counts: countsRef.current,
  };
}
