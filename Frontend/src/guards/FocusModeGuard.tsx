import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useLockdownStore } from '../stores/lockdownStore';

export const FocusModeGuard = () => {
  const location = useLocation();
  const { focusActive } = useLockdownStore();
  
  const blockedPaths = ['/profile', '/settings', '/admin', '/playground'];
  
  if (focusActive && blockedPaths.includes(location.pathname)) {
    return <Navigate to="/lockscreen" replace />;
  }
  
  return <Outlet />;
};