import { useEffect } from 'react';
import { useLockdownStore } from '../stores/lockdownStore';
import { useDailyGoalStore } from '../stores/dailyGoalStore';

export const useLockdown = () => {
  const {
    isLocked,
    focusActive,
    todayFocusedMinutes,
    dailyGoalMinutes,
    startFocus,
    endFocus,
    lockApp,
    unlockApp,
    addFocusedTime,
    setDailyGoal,
  } = useLockdownStore();

  const { setDailyGoal: setGoalInStore, addFocusMinutes } = useDailyGoalStore();

  useEffect(() => {
    let interval: number;
    
    if (focusActive) {
      interval = window.setInterval(() => {
        addFocusedTime(1);
        addFocusMinutes(1);
      }, 60000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [focusActive, addFocusedTime, addFocusMinutes]);

  useEffect(() => {
    const lastDate = localStorage.getItem('lastSessionDate');
    const today = new Date().toDateString();
    
    if (lastDate !== today) {
      useLockdownStore.setState({ todayFocusedMinutes: 0 });
      localStorage.setItem('lastSessionDate', today);
    }
  }, []);

  return {
    isLocked,
    focusActive,
    todayFocusedMinutes,
    dailyGoalMinutes,
    startFocus,
    endFocus,
    lockApp,
    unlockApp,
    addFocusedTime,
    setDailyGoal,
  };
};