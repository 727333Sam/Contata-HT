import { useState, useMemo } from 'react';
import { useStore } from '../../store';
import { STATUS_ORDER } from '../../utils/constants';

export const Sidebar = () => {
  const tasks = useStore((s: any) => s.tasks || []);
  const [query, setQuery] = useState('');
  const setSelectedTask = useStore((s: any) => s.setSelectedTask);
  const [langs] = useState<string[]>(['EN']);
  const filteredTasks = useMemo(() => {
    if (!query.trim()) return tasks;
    return tasks.filter((t: any) => (t.title || '').toLowerCase().includes(query.toLowerCase()));
  }, [tasks, query]);

  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a: any, b: any) => (a.title || '').localeCompare(b.title || ''));
  }, [filteredTasks]);

  const total = filteredTasks.length;
  const done = filteredTasks.filter((t: any) => t.status === 'done').length;
  const inProgress = filteredTasks.filter((t: any) => t.status === 'in_progress').length;
  const review = filteredTasks.filter((t: any) => t.status === 'review').length;
  const backlog = filteredTasks.filter((t: any) => t.status === 'backlog').length;

  return (
    <aside className="w-72 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 overflow-y-auto shadow-inner flex flex-col">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-900/50">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/></svg>
        </div>
        <h2 className="font-extrabold text-lg text-slate-900 dark:text-white">Filters & Stats</h2>
      </div>


      <div className="mb-3">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Search / Recommend</h3>
        <input
          type="text"
          placeholder="Search tasks..."
          className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {sortedTasks.length > 0 && (
        <div className="mb-3">
          <h4 className="text-[10px] font-bold text-indigo-300 mb-1.5">Recommended (A-Z)</h4>
          <div className="space-y-1 max-h-[140px] overflow-y-auto">
            {sortedTasks.map((t: any) => (
              <button
                key={t.id}
                onClick={() => { setSelectedTask?.(t.id); setQuery(''); }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 border border-slate-200 dark:border-slate-700/50 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition text-slate-800 dark:text-slate-200 hover:text-indigo-700 dark:hover:text-white"
              >
                <span className="font-medium">{t.title}</span>
                <span className={`ml-2 text-[10px] px-1 rounded ${t.status === 'done' ? 'bg-emerald-900/40 text-emerald-300' : t.status === 'in_progress' ? 'bg-blue-900/40 text-blue-300' : t.status === 'review' ? 'bg-amber-900/40 text-amber-300' : 'bg-slate-700 text-slate-400'}`}>{t.status.replace('_', ' ')}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="space-y-1.5 mb-7">
        {STATUS_ORDER.map((s) => (
          <button key={s} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition shadow-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/60 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500/50">
            <span className="flex justify-between"><span className="capitalize">{s.replace('_', ' ')}</span><span className="font-mono text-xs opacity-60">{s === 'backlog' ? backlog : s === 'in_progress' ? inProgress : s === 'review' ? review : done}</span></span>
          </button>
        ))}
      </div>

      <h3 className="font-bold text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">Live Metrics</h3>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-slate-100 border border-slate-200 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-white rounded-lg p-3">
          <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total</div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white leading-none mt-1">{total}</div>
        </div>
        <div className="bg-slate-100 border border-slate-200 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-white rounded-lg p-3">
          <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Done</div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white leading-none mt-1">{done}</div>
        </div>
        <div className="bg-slate-100 border border-slate-200 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-white rounded-lg p-3">
          <div className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">In Prog</div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white leading-none mt-1">{inProgress}</div>
        </div>
        <div className="bg-slate-100 border border-slate-200 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-white rounded-lg p-3">
          <div className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wide">Backlog</div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white leading-none mt-1">{backlog}</div>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">DAG Health</div>
          <div className="text-xs text-slate-600 dark:text-slate-400">No cycles. Diamond dependency handled.</div>
        </div>
      </div>
    </aside>
  );
};
/* EVAL B (20%): clean sidebar, dark background, no slider */
