import { Play } from 'lucide-react';
import { Button } from '../ui/Button';

export const QuickResume = () => {
  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-3">Continue Learning</h3>
      <p className="text-sm text-muted-foreground mb-4">JavaScript Arrays</p>
      <Button size="sm" className="gap-2">
        <Play className="w-4 h-4" />
        Resume
      </Button>
    </div>
  );
};