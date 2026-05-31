import { motion } from 'framer-motion';
import { ProjectCard } from './ProjectCard';

interface Level {
  level: number;
  name: string;
  description: string;
  projects: Project[];
  isUnlocked: boolean;
}

interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert' | 'Real World';
  completed?: boolean;
}

interface ProjectLevelsProps {
  levels: Level[];
  userLevel: number;
}

// Inline LevelGate component
const LevelGate = ({ targetLevel, userLevel, children }: { targetLevel: number; userLevel: number; children: React.ReactNode }) => {
  const isUnlocked = userLevel >= targetLevel;

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="glass-card p-6 text-center">
      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-secondary flex items-center justify-center">
        <span className="text-2xl">🔒</span>
      </div>
      <h4 className="font-medium mb-1">Level {targetLevel} Locked</h4>
      <p className="text-sm text-muted-foreground">Complete previous levels to unlock</p>
    </div>
  );
};

export const ProjectLevels = ({ levels, userLevel }: ProjectLevelsProps) => {
  return (
    <div className="space-y-8">
      {levels.map((level, index) => (
        <motion.div
          key={level.level}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">
                {level.level}
              </div>
              <div>
                <h3 className="font-semibold">{level.name}</h3>
                <p className="text-sm text-muted-foreground">{level.description}</p>
              </div>
            </div>
          </div>
          
          <LevelGate targetLevel={level.level} userLevel={userLevel}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {level.projects.map((project) => (
                <ProjectCard key={project.id} {...project} />
              ))}
            </div>
          </LevelGate>
        </motion.div>
      ))}
    </div>
  );
};