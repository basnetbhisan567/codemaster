import { motion } from 'framer-motion';
import { Clock, Code, Trophy, Users } from 'lucide-react';
import { Button } from '../ui/Button';

interface ProjectDetailProps {
  title: string;
  description: string;
  requirements: string[];
  estimatedTime: string;
  difficulty: string;
  techStack: string[];
  onStart: () => void;
}

export const ProjectDetail = ({ 
  title, description, requirements, estimatedTime, difficulty, techStack, onStart 
}: ProjectDetailProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="glass-card p-8">
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        <p className="text-muted-foreground mb-6">{description}</p>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-primary" />
            <span>{estimatedTime}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Trophy className="w-4 h-4 text-primary" />
            <span>{difficulty}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Code className="w-4 h-4 text-primary" />
            <span>{techStack.join(', ')}</span>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Requirements
          </h3>
          <ul className="space-y-2">
            {requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-primary mt-1">•</span>
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <Button size="lg" onClick={onStart} className="w-full">
          Start Project
        </Button>
      </div>
    </motion.div>
  );
};