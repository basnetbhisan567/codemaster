import { motion } from 'framer-motion';
import { Lock, AlertTriangle } from 'lucide-react';

interface BlockedContentProps {
  reason: string;
}

export const BlockedContent = ({ reason }: BlockedContentProps) => {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="glass-card p-8 text-center"
    >
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-destructive/20 flex items-center justify-center">
        <Lock className="w-12 h-12 text-destructive" />
      </div>
      
      <h2 className="text-2xl font-bold mb-2">Access Blocked</h2>
      <p className="text-muted-foreground mb-4">{reason}</p>
      
      <div className="flex items-center gap-2 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
        <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
        <p className="text-sm text-left">
          Focus mode is active. Complete your daily learning goal to unlock.
        </p>
      </div>
    </motion.div>
  );
};