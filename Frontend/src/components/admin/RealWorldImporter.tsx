import { Button } from '../ui/Button';
import { Github } from 'lucide-react';

export const RealWorldImporter = () => (
  <div className="glass-card p-6 text-center">
    <Github className="w-10 h-10 mx-auto mb-3" />
    <h3 className="font-semibold mb-2">Import from GitHub</h3>
    <Button>Connect GitHub</Button>
  </div>
);