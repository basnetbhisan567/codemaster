export const StreakCalendar = ({ data }: { data: boolean[] }) => (
  <div className="glass-card p-4"><h4 className="font-medium mb-3">Activity</h4><div className="grid grid-cols-7 gap-1">{data.map((d, i) => <div key={i} className={`w-8 h-8 rounded ${d ? 'bg-green-500' : 'bg-secondary'}`} />)}</div></div>
);