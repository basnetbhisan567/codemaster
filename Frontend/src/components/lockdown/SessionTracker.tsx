import { useEffect } from 'react';
import { useLockdownStore } from '../../stores/lockdownStore';

export const SessionTracker = () => {
  const { checkScheduledFocus, startFocus, endFocus, focusActive } = useLockdownStore();

  useEffect(() => {
    const checkSchedule = () => {
      const shouldFocus = checkScheduledFocus();
      
      if (shouldFocus && !focusActive) {
        startFocus();
      } else if (!shouldFocus && focusActive) {
        endFocus();
      }
    };

    checkSchedule();
    const interval = setInterval(checkSchedule, 60000);

    return () => clearInterval(interval);
  }, [checkScheduledFocus, startFocus, endFocus, focusActive]);

  useEffect(() => {
    const lastDate = localStorage.getItem('lastSessionDate');
    const today = new Date().toDateString();
    
    if (lastDate !== today) {
      useLockdownStore.getState().resetDailyProgress();
      localStorage.setItem('lastSessionDate', today);
    }
  }, []);

  return null;
};