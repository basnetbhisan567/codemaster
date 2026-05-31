import { Code } from 'lucide-react';

export const SnippetLibrary = ({ snippets }: { snippets: { id: string; title: string; code: string }[] }) => (
  <div className="space-y-2">{snippets.map(s => <div key={s.id} className="glass-card p-3 cursor-pointer hover:border-white/20"><div className="flex items-center gap-2"><Code className="w-4 h-4" /><span className="text-sm">{s.title}</span></div></div>)}</div>
);