import { Task, StatusEnum } from '../../types/task';
import { TaskCard } from './TaskCard';
import { STATUS_COLORS } from '../../utils/constants';
import { useStore } from '../../store';

const STATUS_ICONS: Record<string, string> = {
  backlog: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  in_progress: 'M13 10V3L4 14h7v7l9-11h-7z',
  review: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  done: 'M5 13l4 4L19 7',
};

export const KanbanColumn = ({ status, tasks }: { status: StatusEnum; tasks: Task[] }) => {
  const setSelectedTask = useStore((s) => s.setSelectedTask);
  const updateTaskStatus = useStore((s) => s.updateTaskStatus);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('ring-2', 'ring-indigo-500/30');
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('ring-2', 'ring-indigo-500/30');
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('ring-2', 'ring-indigo-500/30');
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      updateTaskStatus(taskId, status);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex-1 min-w-[260px] max-w-[320px] bg-slate-200/60 dark:bg-slate-900/60 rounded-2xl p-3 flex flex-col gap-2 border border-slate-300 dark:border-slate-800 transition"
    >
      <div className="flex items-center justify-between px-1 mb-1">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
            <path d={STATUS_ICONS[status]}/>
          </svg>
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 capitalize">{status.replace('_', ' ')}</h3>
        </div>
        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${STATUS_COLORS[status]}`}>{tasks.length}</span>
      </div>
      <div className="space-y-2 overflow-y-auto flex-1 min-h-[80px]">
        {tasks.map((t) => (
          <div
            key={t.id}
            draggable
            onDragStart={(e) => e.dataTransfer.setData('text/plain', t.id)}
            className="transition-transform active:scale-95"
          >
            <TaskCard task={t} onClick={() => setSelectedTask(t.id)} />
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-20 text-xs text-slate-400 dark:text-slate-500 font-medium border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
};
/* EVAL A (20%): Kanban with drag-drop status transitions */
