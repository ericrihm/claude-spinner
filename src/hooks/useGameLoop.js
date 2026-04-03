import { useState, useRef, useCallback, useEffect } from "react";

export function useGameLoop() {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(null);
  const elapsedRef = useRef(0);
  const deltaRef = useRef(0);
  const callbacksRef = useRef([]);

  const subscribe = useCallback((callback) => {
    callbacksRef.current.push(callback);
    return () => {
      callbacksRef.current = callbacksRef.current.filter((cb) => cb !== callback);
    };
  }, []);

  const loop = useCallback((timestamp) => {
    if (lastTimeRef.current === null) {
      lastTimeRef.current = timestamp;
    }

    const rawDelta = (timestamp - lastTimeRef.current) / 1000;
    // Clamp delta to prevent huge jumps on tab-refocus
    const delta = Math.min(rawDelta, 0.05);
    lastTimeRef.current = timestamp;
    elapsedRef.current += delta;
    deltaRef.current = delta;

    setElapsed(elapsedRef.current);

    for (const cb of callbacksRef.current) {
      cb(delta, elapsedRef.current);
    }

    rafRef.current = requestAnimationFrame(loop);
  }, []);

  const start = useCallback(() => {
    if (rafRef.current) return;
    lastTimeRef.current = null;
    setIsRunning(true);
    rafRef.current = requestAnimationFrame(loop);
  }, [loop]);

  const stop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    stop();
    elapsedRef.current = 0;
    deltaRef.current = 0;
    setElapsed(0);
  }, [stop]);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return {
    elapsed,
    delta: deltaRef.current,
    isRunning,
    start,
    stop,
    reset,
    subscribe,
    elapsedRef,
  };
}
