import { Trophy } from 'lucide-react';

export const AchievementsList = ({ achievements }: { achievements: string[] }) => (
  <div className="glass-card p-4"><h4 className="font-medium mb-3">Achievements</h4><div className="space-y-2">{achievements.map((a, i) => <div key={i} className="flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-400" /><span className="text-sm">{a}</span></div>)}</div></div>
);