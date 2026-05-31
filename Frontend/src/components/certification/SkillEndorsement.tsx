import { motion } from 'framer-motion';
import { Linkedin, Twitter, Share2, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface SkillEndorsementProps {
  skills: string[];
  projectName: string;
  score: number;
}

export const SkillEndorsement = ({ skills, projectName, score }: SkillEndorsementProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6 space-y-6"
    >
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-xl font-bold">Skills Endorsed!</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Based on your {projectName} project (Score: {score}/100)
        </p>
      </div>
      
      <div className="flex flex-wrap gap-2 justify-center">
        {skills.map((skill, i) => (
          <span
            key={i}
            className="px-3 py-1.5 bg-primary/20 text-primary rounded-full text-sm font-medium border border-primary/30"
          >
            {skill}
          </span>
        ))}
      </div>
      
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1 gap-2">
          <Linkedin className="w-4 h-4" />
          LinkedIn
        </Button>
        <Button variant="outline" className="flex-1 gap-2">
          <Twitter className="w-4 h-4" />
          Twitter
        </Button>
        <Button variant="outline" className="gap-2">
          <Share2 className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};