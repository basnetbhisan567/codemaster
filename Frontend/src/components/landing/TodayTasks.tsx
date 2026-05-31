import { CheckCircle2, Circle } from 'lucide-react';

export const TodayTasks = () => {
  const tasks = [
    { id: 1, title: 'Complete Arrays lesson', completed: true },
    { id: 2, title: 'Solve 2 coding problems', completed: false },
    { id: 3, title: 'Work on project', completed: false },
  ];

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-4">Today's Tasks</h3>
      <div className="space-y-3">
        {tasks.map(task => (
          <div key={task.id} className="flex items-center gap-3">
            {task.completed ? (
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground" />
            )}
            <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
              {task.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};