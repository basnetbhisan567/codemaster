import { Button } from '../ui/Button';

export const NewsManager = () => (
  <div className="space-y-4">
    <Button size="sm">Add News</Button>
    <div className="glass-card p-4"><p className="text-muted-foreground">News articles here...</p></div>
  </div>
);