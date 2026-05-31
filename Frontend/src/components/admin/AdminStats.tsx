export const AdminStats = ({ stats }: { stats: { label: string; value: number }[] }) => (
  <div className="grid grid-cols-4 gap-4">{stats.map(s => <div key={s.label} className="glass-card p-4"><p className="text-2xl font-bold">{s.value}</p><p className="text-sm text-muted-foreground">{s.label}</p></div>)}</div>
);