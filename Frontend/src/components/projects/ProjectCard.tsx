import { motion } from 'framer-motion';
import { Clock, ExternalLink, Play, Bot, CheckCircle, Circle, GitBranch } from 'lucide-react';
import { Project, LEVEL_CONFIG } from '../../types/project';
import { Card } from '../ui/card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';
import { useNavigate } from 'react-router-dom';

interface ProjectCardProps {
  project: Project;
  onAIAssist?: (project: Project) => void;
}

export const ProjectCard = ({ project, onAIAssist }: ProjectCardProps) => {
  const navigate = useNavigate();
  const levelConfig = LEVEL_CONFIG[project.level];

  const handleAIAssistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAIAssist?.(project);
    navigate('/learning', { state: { projectContext: project.aiContext } });
  };

  const handleSourceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(project.sourceUrl, '_blank');
  };

  const handleLivePreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (project.livePreview) {
      window.open(project.livePreview, '_blank');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Card variant="interactive" className="p-5 h-full flex flex-col group">
        {/* Preview Image */}
        {project.previewImage && (
          <div className="relative h-40 -mx-5 -mt-5 mb-4 overflow-hidden rounded-t-xl">
            <img 
              src={project.previewImage} 
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {project.livePreview && (
              <button
                onClick={handleLivePreviewClick}
                className="absolute top-3 right-3 p-2 glass rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Play className="w-4 h-4" />
              </button>
            )}
            <div className="absolute top-3 left-3">
              <Badge 
                variant={project.completed ? 'success' : 'default'}
                className="flex items-center gap-1"
              >
                {project.completed ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  <Circle className="w-3 h-3" />
                )}
                {project.progress && project.progress > 0 ? `${project.progress}%` : null}
              </Badge>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold group-hover:text-primary transition-colors">
              {project.title}
            </h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <GitBranch className="w-3 h-3" />
              {project.sourceLabel}
            </p>
          </div>
          <Badge 
            className={cn(
              'bg-gradient-to-r text-white',
              levelConfig.color
            )}
          >
            Level {project.level}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {project.description}
        </p>

        {/* Tech Stack Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {project.techStack.slice(0, 3).map((tech) => (
            <Badge key={tech} variant="outline" size="sm" className="text-xs">
              {tech}
            </Badge>
          ))}
          {project.techStack.length > 3 && (
            <Badge variant="outline" size="sm" className="text-xs">
              +{project.techStack.length - 3}
            </Badge>
          )}
        </div>

        {/* Meta Info */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{project.estimatedTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAIAssistClick}
              className="gap-1 text-primary hover:text-primary"
            >
              <Bot className="w-3 h-3" />
              AI Assist
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSourceClick}
              className="gap-1"
            >
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};