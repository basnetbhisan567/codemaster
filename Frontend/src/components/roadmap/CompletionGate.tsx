import { Lock } from 'lucide-react';

export const CompletionGate = ({ required, completed, children }: { required: number; completed: number; children: React.ReactNode }) => {
  if (completed >= required) return <>{children}</>;
  return <div className="glass-card p-6 text-center"><Lock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" /><p>Complete {required} milestones to unlock</p></div>;
};