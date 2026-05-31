import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Clock, Award, Target, BookOpen, Link2, Bot, Play } from 'lucide-react';
import { Project, LEVEL_CONFIG } from '../../types/project';
import { Card } from '../ui/card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';
import { useNavigate } from 'react-router-dom';

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onAIAssist?: (project: Project) => void;
}

export const ProjectModal = ({ project, isOpen, onClose, onAIAssist }: ProjectModalProps) => {
  const navigate = useNavigate();

  if (!project) return null;

  const levelConfig = LEVEL_CONFIG[project.level];

  const handleAIAssist = () => {
    onAIAssist?.(project);
    navigate('/learning', { state: { projectContext: project.aiContext } });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <Card variant="glass" className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 z-10 glass-heavy p-6 border-b border-white/10 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className={cn('bg-gradient-to-r text-white', levelConfig.color)}>
                      Level {project.level} - {levelConfig.name}
                    </Badge>
                    <Badge variant="outline">{project.category}</Badge>
                  </div>
                  <h2 className="text-2xl font-bold">{project.title}</h2>
                  <p className="text-muted-foreground flex items-center gap-1 mt-1">
                    {project.sourceLabel}
                  </p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Preview */}
                {project.previewImage && (
                  <div className="rounded-xl overflow-hidden">
                    <img src={project.previewImage} alt={project.title} className="w-full" />
                  </div>
                )}

                {/* Description */}
                <p className="text-muted-foreground">{project.description}</p>

                {/* Tech Stack */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Award className="w-4 h-4 text-primary" />
                    Tech Stack
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech) => (
                      <Badge key={tech} variant="default">{tech}</Badge>
                    ))}
                  </div>
                </div>

                {/* Requirements */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-green-400" />
                    Requirements
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {project.requirements.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>

                {/* Learning Objectives */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    What You'll Learn
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {project.learningObjectives.map((obj, i) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>

                {/* Resources */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-purple-400" />
                    Resources
                  </h4>
                  <div className="space-y-2">
                    {project.resources.map((resource, i) => (
                      <a
                        key={i}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {resource.title}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    Estimated: {project.estimatedTime}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant={project.level === 1 ? 'success' : project.level === 2 ? 'info' : project.level === 3 ? 'warning' : 'error'}>
                      Level {project.level} - {levelConfig.focus}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 glass-heavy p-6 border-t border-white/10 flex gap-3">
                <Button onClick={handleAIAssist} className="flex-1 gap-2">
                  <Bot className="w-4 h-4" />
                  Start with AI Tutor
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.open(project.sourceUrl, '_blank')}
                  className="gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Source
                </Button>
                {project.livePreview && (
                  <Button 
                    variant="outline" 
                    onClick={() => window.open(project.livePreview, '_blank')}
                    className="gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Live Preview
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};