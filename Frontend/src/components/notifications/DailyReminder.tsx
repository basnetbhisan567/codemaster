import { useEffect } from 'react';

export const DailyReminder = () => {
  useEffect(() => {
    const checkTime = () => { /* Check and show reminder */ };
    const interval = setInterval(checkTime, 3600000);
    return () => clearInterval(interval);
  }, []);
  return null;
};