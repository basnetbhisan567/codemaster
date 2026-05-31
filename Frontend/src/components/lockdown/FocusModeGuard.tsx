import { Navigate, Outlet } from 'react-router-dom';
import { useLockdown } from '../../hooks/useLockdown';

export const FocusModeGuard = () => {
  const { focusActive, todayFocusedMinutes, dailyGoalMinutes } = useLockdown();

  // If focus is active and daily goal not met, redirect to lock screen or landing?
  // We'll allow only / (Landing) and /lockscreen during focus.
  // But for simplicity, we'll just enforce that the user cannot leave study pages.
  // This guard is placed on all study routes, so if focus is active, they stay.
  // If they try to access non-study routes (like /profile), they get redirected.
  // That logic is handled in the route config.

  // For now, just allow outlet (since all wrapped routes are study-related)
  return <Outlet />;
};