import { Volume2, VolumeX } from 'lucide-react';

interface VolumeControlProps { volume: number; onChange: (v: number) => void; }

export const VolumeControl = ({ volume, onChange }: VolumeControlProps) => (
  <div className="flex items-center gap-2">
    <button onClick={() => onChange(0)}>{volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}</button>
    <input type="range" min="0" max="100" value={volume} onChange={(e) => onChange(Number(e.target.value))} className="w-20" />
  </div>
);