import { PROJECT_LEVELS } from '../config/levels';

export const calculateLevel = (
  completedTopics: number,
  completedProjects: number,
  hasCertification: boolean
): number => {
  for (let i = PROJECT_LEVELS.length; i > 0; i--) {
    const level = PROJECT_LEVELS[i - 1];
    const criteria = level.unlockCriteria;
    
    if (
      completedTopics >= criteria.completedTopics &&
      completedProjects >= criteria.minProjects &&
      (!criteria.requiresCertification || hasCertification)
    ) {
      return level.level;
    }
  }
  return 1;
};

export const getProgressToNextLevel = (
  currentLevel: number,
  completedTopics: number,
  completedProjects: number
): { topics: number; projects: number; percentage: number } => {
  const nextLevel = PROJECT_LEVELS.find(l => l.level === currentLevel + 1);
  if (!nextLevel) return { topics: 0, projects: 0, percentage: 100 };
  
  const criteria = nextLevel.unlockCriteria;
  const topicsProgress = Math.min(100, (completedTopics / criteria.completedTopics) * 100);
  const projectsProgress = Math.min(100, (completedProjects / criteria.minProjects) * 100);
  const overallProgress = (topicsProgress + projectsProgress) / 2;
  
  return {
    topics: criteria.completedTopics - completedTopics,
    projects: criteria.minProjects - completedProjects,
    percentage: overallProgress,
  };
};

export const canUnlockLevel = (
  currentLevel: number,
  completedTopics: number,
  completedProjects: number,
  hasCertification: boolean
): boolean => {
  const nextLevel = PROJECT_LEVELS.find(l => l.level === currentLevel + 1);
  if (!nextLevel) return false;
  
  const criteria = nextLevel.unlockCriteria;
  return (
    completedTopics >= criteria.completedTopics &&
    completedProjects >= criteria.minProjects &&
    (!criteria.requiresCertification || hasCertification)
  );
};