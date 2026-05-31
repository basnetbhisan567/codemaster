import { motion } from 'framer-motion';
import { Github, Globe, Users, Star } from 'lucide-react';
import { Button } from '../ui/Button';

interface RealWorldProject {
  id: string;
  title: string;
  description: string;
  source: 'GitHub' | 'Hackathon' | 'Open Source';
  stars?: number;
  contributors?: number;
  url: string;
}

interface RealWorldProjectsProps {
  projects: RealWorldProject[];
}

export const RealWorldProjects = ({ projects }: RealWorldProjectsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Globe className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-semibold">Real World Projects</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project, index) => (
          <motion.a
            key={project.id}
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card p-5 cursor-pointer group"
            whileHover={{ y: -4 }}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold group-hover:text-primary transition-colors">
                {project.title}
              </h3>
              <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                {project.source}
              </span>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {project.stars && (
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  {project.stars}
                </span>
              )}
              {project.contributors && (
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {project.contributors}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Github className="w-4 h-4" />
                View Project
              </span>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
};