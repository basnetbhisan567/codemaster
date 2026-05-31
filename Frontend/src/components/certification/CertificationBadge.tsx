import { motion } from 'framer-motion';
import { Award, Download, Share2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface CertificationBadgeProps {
  certification: any;
}

export const CertificationBadge = ({ certification }: CertificationBadgeProps) => {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="glass-card p-8 text-center max-w-md mx-auto"
    >
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
        <Award className="w-12 h-12 text-white" />
      </div>
      
      <h2 className="text-2xl font-bold mb-2">Certification Earned!</h2>
      <p className="text-muted-foreground mb-6">
        Congratulations! You've successfully completed the validation.
      </p>

      <div className="flex gap-3">
        <Button className="flex-1 gap-2">
          <Download className="w-4 h-4" />
          Download
        </Button>
        <Button variant="outline" className="flex-1 gap-2">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </div>
    </motion.div>
  );
};