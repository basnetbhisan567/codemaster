export const UserStats = ({ stats }: { stats: { label: string; value: number }[] }) => (
  <div className="grid grid-cols-3 gap-4">{stats.map(s => <div key={s.label} className="glass-card p-4 text-center"><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>)}</div>
);