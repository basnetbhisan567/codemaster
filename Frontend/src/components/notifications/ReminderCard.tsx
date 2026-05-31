import { Clock } from 'lucide-react';

export const ReminderCard = ({ title, time }: { title: string; time: string }) => (
  <div className="p-3 glass rounded-lg mb-2">
    <p className="text-sm font-medium">{title}</p>
    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Clock className="w-3 h-3" />{time}</p>
  </div>
);