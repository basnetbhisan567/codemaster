import { motion } from 'framer-motion';
import { Trophy, Star, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { triggerConfetti } from '../../utils/effects';
import { useEffect } from 'react';

interface LevelCompleteProps {
  level: number;
  levelName: string;
  projectsCompleted: number;
  totalProjects: number;
  onNext: () => void;
  onCertify: () => void;
}

export const LevelComplete = ({ 
  level, levelName, projectsCompleted, totalProjects, onNext, onCertify 
}: LevelCompleteProps) => {
  useEffect(() => {
    triggerConfetti('levelUp');
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-8 text-center max-w-md mx-auto"
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center"
      >
        <Trophy className="w-10 h-10 text-white" />
      </motion.div>
      
      <h2 className="text-2xl font-bold mb-2">Level {level} Complete!</h2>
      <p className="text-lg text-primary mb-2">{levelName}</p>
      
      <div className="flex justify-center gap-1 mb-4">
        {[...Array(totalProjects)].map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${i < projectsCompleted ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`}
          />
        ))}
      </div>
      
      <p className="text-sm text-muted-foreground mb-6">
        You've completed {projectsCompleted} of {totalProjects} projects
      </p>
      
      <div className="space-y-3">
        <Button onClick={onNext} className="w-full gap-2">
          Next Level
          <ArrowRight className="w-4 h-4" />
        </Button>
        
        {level >= 4 && (
          <Button variant="outline" onClick={onCertify} className="w-full">
            Get Certified
          </Button>
        )}
      </div>
    </motion.div>
  );
};