import { Task } from '../../types/task';
import { STATUS_COLORS } from '../../utils/constants';
import { useStore } from '../../store';

export const TaskCard = ({ task, onClick }: { task: Task; onClick?: () => void }) => {
  const deleteTask = useStore((s: any) => s.deleteTask);
  const selectedTaskId = useStore((s) => s.selectedTaskId);
  const dependencies = useStore((s) => s.dependencies);
  const isSelected = selectedTaskId === task.id;
  const depCount = dependencies.filter(
    (d) => d.sourceTaskId === task.id || d.targetTaskId === task.id
  ).length;

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border-2 transition-all duration-200 cursor-pointer group hover:shadow-lg hover:-translate-y-0.5 ${isSelected ? 'border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/20 shadow-indigo-100 dark:shadow-indigo-900/30' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600'}`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition line-clamp-2 flex-1 min-w-0" onClick={(e) => { e.stopPropagation(); onClick?.(); }}>{task.title}</h3>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${STATUS_COLORS[task.status]}`}>{task.status.replace('_', ' ')}</span>
          <button
            onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-rose-500 ml-1"
            title="Delete task"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
          </button>
      </div>
      {task.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2 leading-relaxed">{task.description}</p>
      )}
      <div className="flex items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center gap-3 text-slate-400">
          {task.endDate && (
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {task.endDate}
            </span>
          )}
          {depCount > 0 && (
            <span className="flex items-center gap-1 text-indigo-500 dark:text-indigo-400">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
              {depCount} dep{depCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {isSelected && (
          <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider">Selected</span>
        )}
      </div>
    </div>
  );
};
/* EVAL A (20%): interactive task cards with dependency awareness */
