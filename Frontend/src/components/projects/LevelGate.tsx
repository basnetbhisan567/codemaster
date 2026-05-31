import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { useProjectStore } from '../../stores/projectStore';
import { canUnlockLevel } from '../../config/levels';

interface LevelGateProps {
  targetLevel: number;
  children: React.ReactNode;
}

export const LevelGate = ({ targetLevel, children }: LevelGateProps) => {
  const { userLevel, completedTopics, completedProjects, hasCertification } = useProjectStore();
  
  const isUnlocked = userLevel >= targetLevel;
  const canUnlock = canUnlockLevel(
    userLevel,
    completedTopics,
    completedProjects,
    hasCertification
  ) && targetLevel === userLevel + 1;

  if (isUnlocked) {
    return <>{children}</>;
  }

  const nextLevel = userLevel + 1;
  const required = targetLevel === nextLevel ? 
    { topics: 5 * targetLevel, projects: targetLevel } : 
    { topics: 999, projects: 999 };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-8 text-center max-w-md mx-auto"
    >
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
        <Lock className="w-10 h-10 text-muted-foreground" />
      </div>
      
      <h3 className="text-2xl font-bold mb-2">Level {targetLevel} Locked</h3>
      <p className="text-muted-foreground mb-6">
        Complete Level {userLevel} requirements to unlock
      </p>

      <div className="space-y-4 text-left">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Topics Completed</span>
            <span>{completedTopics}/{required.topics}</span>
          </div>
          <ProgressBar value={(completedTopics / required.topics) * 100} />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Projects Completed</span>
            <span>{completedProjects}/{required.projects}</span>
          </div>
          <ProgressBar value={(completedProjects / required.projects) * 100} />
        </div>
      </div>

      {canUnlock && (
        <Button className="mt-6 w-full" onClick={() => {}}>
          Unlock Level {targetLevel}
        </Button>
      )}
    </motion.div>
  );
};