import { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface RevalidationRequestProps {
  projectName: string;
  failedCriteria: string[];
  onRequest: () => void;
}

export const RevalidationRequest = ({ projectName, failedCriteria, onRequest }: RevalidationRequestProps) => {
  const [reason, setReason] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card p-6 space-y-6"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-yellow-400" />
        </div>
        <div>
          <h3 className="font-semibold">Request Revalidation</h3>
          <p className="text-sm text-muted-foreground">Project: {projectName}</p>
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-2">Failed Criteria:</h4>
        <ul className="space-y-1">
          {failedCriteria.map((criteria, i) => (
            <li key={i} className="text-sm text-red-400 flex items-center gap-2">
              <span>•</span>
              {criteria}
            </li>
          ))}
        </ul>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">
          What improvements have you made?
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full h-24 p-3 bg-secondary/20 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          placeholder="Describe your changes..."
        />
      </div>
      
      <Button onClick={onRequest} className="w-full gap-2" disabled={!reason.trim()}>
        <RotateCcw className="w-4 h-4" />
        Request Revalidation
      </Button>
    </motion.div>
  );
};