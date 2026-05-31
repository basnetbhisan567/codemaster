export const NextTopics = ({ topics }: { topics: string[] }) => (
  <ul className="space-y-2">{topics.map((t, i) => <li key={i} className="flex items-center gap-2"><span className="text-primary">▶</span><span className="text-sm">{t}</span></li>)}</ul>
);