import { useState, useRef, useCallback } from "react";

const LS_KEY = "verbsurf-highscore";

function loadHighScore() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveHighScore(stats) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(stats));
  } catch {
    // localStorage may be unavailable
  }
}

export function useScoreTracker() {
  const [tokens, setTokens] = useState(0);
  const [verbsCollected, setVerbsCollected] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const [phase, setPhase] = useState("Normal Session");
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  const uniqueVerbsRef = useRef(new Set());
  const tokensRef = useRef(0);
  const comboRef = useRef(0);
  const bestComboRef = useRef(0);
  const livesRef = useRef(3);
  const verbsCollectedRef = useRef(0);

  const addTokens = useCallback((amount) => {
    tokensRef.current += amount;
    setTokens(Math.floor(tokensRef.current));
  }, []);

  const collectVerb = useCallback((verb) => {
    verbsCollectedRef.current += 1;
    setVerbsCollected(verbsCollectedRef.current);
    uniqueVerbsRef.current.add(verb);

    // Score: base 100 + combo bonus
    const points = 100 + comboRef.current * 25;
    tokensRef.current += points;
    setTokens(Math.floor(tokensRef.current));

    comboRef.current += 1;
    setCombo(comboRef.current);
    if (comboRef.current > bestComboRef.current) {
      bestComboRef.current = comboRef.current;
      setBestCombo(bestComboRef.current);
    }

    return points;
  }, []);

  const hitHazard = useCallback(() => {
    comboRef.current = 0;
    setCombo(0);
    livesRef.current -= 1;
    setLives(livesRef.current);
    return livesRef.current <= 0;
  }, []);

  const addLife = useCallback(() => {
    livesRef.current += 1;
    setLives(livesRef.current);
  }, []);

  const updatePhase = useCallback((phaseName) => {
    setPhase(phaseName);
  }, []);

  const getGameOverStats = useCallback(() => {
    const stats = {
      tokens: Math.floor(tokensRef.current),
      verbsCollected: verbsCollectedRef.current,
      uniqueVerbs: uniqueVerbsRef.current.size,
      bestCombo: bestComboRef.current,
      phase,
    };

    // Check high score
    const prev = loadHighScore();
    let isNew = false;
    if (!prev || stats.tokens > prev.tokens || stats.verbsCollected > prev.verbsCollected || stats.bestCombo > prev.bestCombo) {
      isNew = true;
      saveHighScore(stats);
      setIsNewHighScore(true);
    }

    return { ...stats, isNewHighScore: isNew };
  }, [phase]);

  const reset = useCallback(() => {
    tokensRef.current = 0;
    comboRef.current = 0;
    bestComboRef.current = 0;
    livesRef.current = 5;
    verbsCollectedRef.current = 0;
    uniqueVerbsRef.current = new Set();
    setTokens(0);
    setVerbsCollected(0);
    setCombo(0);
    setBestCombo(0);
    setLives(5);
    setPhase("Normal Session");
    setIsNewHighScore(false);
  }, []);

  return {
    tokens,
    verbsCollected,
    uniqueVerbs: uniqueVerbsRef.current,
    combo,
    bestCombo,
    lives,
    phase,
    isNewHighScore,
    addTokens,
    collectVerb,
    hitHazard,
    addLife,
    updatePhase,
    getGameOverStats,
    reset,
  };
}
