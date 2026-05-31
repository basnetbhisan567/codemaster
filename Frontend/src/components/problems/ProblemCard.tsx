import { motion } from 'framer-motion';
import { CheckCircle, Circle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

interface ProblemCardProps {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  solved?: boolean;
}

export const ProblemCard = ({ id, title, difficulty, topic, solved }: ProblemCardProps) => {
  const difficultyColors = {
    Easy: 'text-green-400',
    Medium: 'text-yellow-400',
    Hard: 'text-red-400',
  };

  return (
    <Link to={`/problems/${id}`}>
      <motion.div
        className="glass-card p-4 cursor-pointer group"
        whileHover={{ x: 4 }}
      >
        <div className="flex items-center gap-3">
          {solved ? (
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
          ) : (
            <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          )}
          
          <div className="flex-1">
            <h4 className="font-medium group-hover:text-primary transition-colors">
              {title}
            </h4>
            <p className="text-xs text-muted-foreground">{topic}</p>
          </div>
          
          <span className={cn('text-sm font-medium', difficultyColors[difficulty])}>
            {difficulty}
          </span>
          
          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </motion.div>
    </Link>
  );
};