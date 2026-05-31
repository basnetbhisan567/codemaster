import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Link, FileCode, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface ProjectSubmissionProps {
  onSubmit: (data: { type: 'file' | 'url' | 'code'; content: string }) => void;
  isSubmitting?: boolean;
}

export const ProjectSubmission = ({ onSubmit, isSubmitting }: ProjectSubmissionProps) => {
  const [submissionType, setSubmissionType] = useState<'file' | 'url' | 'code'>('code');
  const [content, setContent] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit({ type: submissionType, content });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card p-8 text-center"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Project Submitted!</h3>
        <p className="text-muted-foreground">Your project is being reviewed.</p>
      </motion.div>
    );
  }

  return (
    <div className="glass-card p-6 space-y-6">
      <h3 className="text-lg font-semibold">Submit Your Project</h3>
      
      <div className="flex gap-2 p-1 glass rounded-xl">
        {(['code', 'url', 'file'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setSubmissionType(type)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium capitalize transition-all ${
              submissionType === type
                ? 'bg-primary text-white'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              {type === 'code' && <FileCode className="w-4 h-4" />}
              {type === 'url' && <Link className="w-4 h-4" />}
              {type === 'file' && <Upload className="w-4 h-4" />}
              {type}
            </span>
          </button>
        ))}
      </div>
      
      {submissionType === 'code' && (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-64 p-4 bg-secondary/20 rounded-lg border border-white/10 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          placeholder="Paste your code here..."
        />
      )}
      
      {submissionType === 'url' && (
        <input
          type="url"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-3 bg-secondary/20 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="https://github.com/yourusername/project"
        />
      )}
      
      {submissionType === 'file' && (
        <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
          <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">
            Drag & drop your files here
          </p>
          <Button variant="outline" size="sm">Browse Files</Button>
        </div>
      )}
      
      <Button
        onClick={handleSubmit}
        isLoading={isSubmitting}
        disabled={!content.trim()}
        className="w-full"
      >
        Submit Project
      </Button>
    </div>
  );
};