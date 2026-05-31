import { Outlet, Navigate } from 'react-router-dom';

export const AuthGuard = () => {
  const isAuthenticated = true; // Replace with actual auth logic
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};