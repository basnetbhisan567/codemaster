import { motion } from 'framer-motion';
import { ArrowLeft, Clock, BarChart } from 'lucide-react';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';

interface TopicDetailProps {
  title: string;
  description: string;
  content: string;
  difficulty: string;
  estimatedTime: string;
  onBack?: () => void;
}

export const TopicDetail = ({ title, description, content, difficulty, estimatedTime, onBack }: TopicDetailProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>
      
      <div className="glass-card p-6 space-y-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
        
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1">
            <BarChart className="w-4 h-4" />
            {difficulty}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {estimatedTime}
          </span>
        </div>
        
        <div className="prose prose-invert max-w-none">
          <p>{content}</p>
        </div>
      </div>
    </motion.div>
  );
};