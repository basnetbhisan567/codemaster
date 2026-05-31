import { useState, useEffect } from 'react';

export const useStreak = () => {
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem('user_streak');
    const storedBest = localStorage.getItem('best_streak');
    if (stored) setStreak(parseInt(stored));
    if (storedBest) setBestStreak(parseInt(storedBest));
  }, []);

  const incrementStreak = () => {
    const newStreak = streak + 1;
    setStreak(newStreak);
    localStorage.setItem('user_streak', newStreak.toString());
    if (newStreak > bestStreak) {
      setBestStreak(newStreak);
      localStorage.setItem('best_streak', newStreak.toString());
    }
  };

  const resetStreak = () => {
    setStreak(0);
    localStorage.setItem('user_streak', '0');
  };

  return { streak, bestStreak, incrementStreak, resetStreak };
};