import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Outlet } from 'react-router-dom';
import { useLockdownStore } from '../stores/lockdownStore';
import { LockdownOverlay } from '../components/lockdown/LockdownOverlay';

export const DailyGoalGuard = () => {
  const { 
    isLocked, 
    focusActive, 
    todayFocusedMinutes, 
    dailyGoalMinutes,
    lockApp, 
    unlockApp 
  } = useLockdownStore();
  
  const [shouldBlock, setShouldBlock] = useState(false);

  useEffect(() => {
    if (focusActive) {
      const isComplete = todayFocusedMinutes >= dailyGoalMinutes;
      
      if (!isComplete && !isLocked) {
        lockApp('daily_goal_not_met');
        setShouldBlock(true);
      } else if (isComplete && isLocked) {
        unlockApp();
        setShouldBlock(false);
      }
    } else {
      if (isLocked) {
        unlockApp();
      }
      setShouldBlock(false);
    }
  }, [focusActive, todayFocusedMinutes, dailyGoalMinutes, isLocked, lockApp, unlockApp]);

  if (shouldBlock && focusActive) {
    return (
      <>
        <div style={{ display: 'none' }}>
          <Outlet />
        </div>
        {createPortal(<LockdownOverlay />, document.body)}
      </>
    );
  }

  return <Outlet />;
};