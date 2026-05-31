import { Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { ProgressBar } from '../ui/ProgressBar';

interface ProgressLockProps {
  required: number;
  current: number;
  children: React.ReactNode;
  message?: string;
}

export const ProgressLock = ({ required, current, children, message }: ProgressLockProps) => {
  const isUnlocked = current >= required;
  const progress = (current / required) * 100;

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card p-6 text-center"
    >
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
        <Lock className="w-8 h-8 text-muted-foreground" />
      </div>
      
      <h3 className="font-semibold mb-2">Content Locked</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {message || `Complete ${required}% to unlock`}
      </p>
      
      <div className="max-w-xs mx-auto">
        <ProgressBar value={progress} showLabel />
        <p className="text-xs text-muted-foreground mt-2">
          {current}% / {required}% completed
        </p>
      </div>
    </motion.div>
  );
};