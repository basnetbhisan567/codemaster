import { Calendar, Zap } from 'lucide-react';

interface DailyUpdateProps {
  date: string;
  updates: string[];
}

export const DailyUpdate = ({ date, updates }: DailyUpdateProps) => (
  <div className="glass-card p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Daily Tech Update</h3>
      </div>
      <span className="text-sm text-muted-foreground">{date}</span>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {updates.map((update, i) => (
        <div key={i} className="flex items-start gap-2 p-3 glass rounded-lg">
          <Zap className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{update}</p>
        </div>
      ))}
    </div>
  </div>
);