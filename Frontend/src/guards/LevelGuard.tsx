import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useProjectStore } from '../stores/projectStore';
import { canUnlockLevel } from '../utils/levelCalculator';

export const LevelGuard = () => {
  const { level } = useParams<{ level: string }>();
  const { userLevel, completedTopics, completedProjects, hasCertification } = useProjectStore();
  
  const targetLevel = parseInt(level || '1');
  
  if (targetLevel > userLevel) {
    const canUnlock = canUnlockLevel(
      userLevel,
      completedTopics,
      completedProjects,
      hasCertification
    );
    
    if (!canUnlock || targetLevel !== userLevel + 1) {
      return <Navigate to="/projects" replace />;
    }
  }
  
  return <Outlet />;
};