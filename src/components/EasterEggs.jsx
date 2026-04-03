import { useState, useCallback } from 'react';
import { useKonamiCode } from '../hooks/useKonamiCode';

export function useEasterEggs(currentVerb) {
  const [isTurbo, setIsTurbo] = useState(false);
  const [titleClickCount, setTitleClickCount] = useState(0);
  const [titleText, setTitleText] = useState('Claude Code');

  const handleKonami = useCallback(() => {
    setIsTurbo(prev => !prev);
  }, []);

  useKonamiCode(handleKonami);

  const handleTitleClick = useCallback(() => {
    setTitleClickCount(prev => {
      const next = prev + 1;
      if (next >= 5) {
        setTitleText(t => t === 'Claude Code' ? 'Cobalt Systems Terminal' : 'Claude Code');
        return 0;
      }
      return next;
    });
  }, []);

  const specialEffect = {
    isClauding: currentVerb === 'Clauding',
    isPropagating: currentVerb === 'Propagating',
    isGitifying: currentVerb === 'Gitifying',
    isTurbo,
  };

  return {
    specialEffect,
    isTurbo,
    titleText,
    handleTitleClick,
  };
}
