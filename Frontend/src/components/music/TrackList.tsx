import { Play } from 'lucide-react';

interface Track { id: string; title: string; duration: string; }
interface TrackListProps { tracks: Track[]; onPlay: (id: string) => void; }

export const TrackList = ({ tracks, onPlay }: TrackListProps) => (
  <div className="space-y-1">
    {tracks.map(t => (
      <div key={t.id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg cursor-pointer group" onClick={() => onPlay(t.id)}>
        <div className="flex items-center gap-2"><Play className="w-3 h-3 opacity-0 group-hover:opacity-100" /><span className="text-sm">{t.title}</span></div>
        <span className="text-xs text-muted-foreground">{t.duration}</span>
      </div>
    ))}
  </div>
);