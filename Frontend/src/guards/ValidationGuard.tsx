import { Navigate, Outlet } from 'react-router-dom';
import { useProjectStore } from '../stores/projectStore';

export const ValidationGuard = () => {
  const { userLevel, completedProjects } = useProjectStore();
  
  // Must complete level 4 projects before certification
  const canValidate = userLevel >= 4 && completedProjects >= 8;
  
  if (!canValidate) {
    return <Navigate to="/projects" replace />;
  }
  
  return <Outlet />;
};