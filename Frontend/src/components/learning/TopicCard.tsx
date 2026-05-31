import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight } from 'lucide-react';

interface TopicCardProps {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  progress?: number;
}

export const TopicCard = ({ id, title, description, icon, difficulty, progress = 0 }: TopicCardProps) => {
  const difficultyColors = {
    Beginner: 'text-green-400 bg-green-400/10',
    Intermediate: 'text-yellow-400 bg-yellow-400/10',
    Advanced: 'text-red-400 bg-red-400/10',
  };

  return (
    <Link to={`/learning/${id}`}>
      <motion.div
        layoutId={`topic-${id}`}
        className="glass-card p-6 cursor-pointer group relative overflow-hidden"
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        {/* Background Glow Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
          layoutId={`topic-glow-${id}`}
        />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <motion.div 
              layoutId={`topic-icon-${id}`}
              className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center"
            >
              {icon || <BookOpen className="w-6 h-6 text-primary" />}
            </motion.div>
            <motion.span
              layoutId={`topic-difficulty-${id}`}
              className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyColors[difficulty]}`}
            >
              {difficulty}
            </motion.span>
          </div>
          
          <motion.h3 
            layoutId={`topic-title-${id}`}
            className="text-xl font-semibold mb-2"
          >
            {title}
          </motion.h3>
          
          <motion.p 
            layoutId={`topic-description-${id}`}
            className="text-sm text-muted-foreground mb-4"
          >
            {description}
          </motion.p>
          
          {/* Progress Bar */}
          {progress > 0 && (
            <motion.div layoutId={`topic-progress-${id}`} className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full"
                />
              </div>
            </motion.div>
          )}
          
          <motion.div 
            className="flex items-center gap-1 text-primary text-sm font-medium"
            whileHover={{ x: 4 }}
          >
            <span>Start Learning</span>
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        </div>
      </motion.div>
    </Link>
  );
};