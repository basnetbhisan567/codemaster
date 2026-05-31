import { ProgressBar } from '../ui/ProgressBar';

export const LearningProgress = ({ topics }: { topics: { name: string; progress: number }[] }) => (
  <div className="glass-card p-4 space-y-3">{topics.map(t => <div key={t.name}><div className="flex justify-between text-sm mb-1"><span>{t.name}</span><span>{t.progress}%</span></div><ProgressBar value={t.progress} /></div>)}</div>
);