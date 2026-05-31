import { Button } from '../ui/Button';

export const ContentManager = () => (
  <div className="space-y-4">
    <div className="flex gap-2"><Button size="sm">Add Topic</Button><Button size="sm" variant="outline">Add Project</Button></div>
    <div className="glass-card p-4"><p className="text-muted-foreground">Content list here...</p></div>
  </div>
);