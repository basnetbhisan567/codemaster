import { CheckCircle, Circle } from 'lucide-react';

export const MilestoneCard = ({ title, completed, date }: { title: string; completed: boolean; date: string }) => (
  <div className="flex items-start gap-4 relative">
    <div className="relative z-10">{completed ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Circle className="w-5 h-5 text-muted-foreground" />}</div>
    <div className="flex-1 glass-card p-4"><h4 className="font-medium">{title}</h4><p className="text-xs text-muted-foreground">{date}</p></div>
  </div>
);