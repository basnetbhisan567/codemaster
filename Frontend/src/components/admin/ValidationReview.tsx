import { Button } from '../ui/Button';

export const ValidationReview = ({ submissions }: { submissions: { id: string; user: string; project: string }[] }) => (
  <div className="space-y-3">{submissions.map(s => <div key={s.id} className="glass-card p-4 flex items-center justify-between"><div><p className="font-medium">{s.project}</p><p className="text-sm text-muted-foreground">{s.user}</p></div><Button size="sm">Review</Button></div>)}</div>
);