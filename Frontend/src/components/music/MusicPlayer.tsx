import { Play, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { Button } from '../ui/Button';

export const MusicPlayer = () => {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium">Focus Music</span>
        <Volume2 className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex items-center justify-center gap-2">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <SkipBack className="w-4 h-4" />
        </Button>
        <Button size="sm" className="h-10 w-10 p-0 rounded-full">
          <Play className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground text-center mt-2">Lofi Beats</p>
    </div>
  );
};