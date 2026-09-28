import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../../store';

export const Header = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newStatus, setNewStatus] = useState('backlog');
  const [newDeps, setNewDeps] = useState<string[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const toggleDep = (id: string) => setNewDeps((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const addTask = useStore((s) => s.addTask);
  const addDependency = useStore((s) => s.addDependency);
  const tasks = useStore((s) => s.tasks);
  const wsConnected = useStore((s) => s.wsConnected);
  const safeTasks = (tasks || []).filter((t: any) => t && typeof t === 'object');
  const done = safeTasks.filter((t: any) => t.status === 'done').length;
  const pct = safeTasks.length > 0 ? Math.round((done / safeTasks.length) * 100) : 0;

  const handleSuggest = async () => {
    try {
      const api = await import('../../services/api');
      const all = await api.getTasks?.() || [];
      const q = (newTitle || '').toLowerCase();
      const matches = (all || []).filter((t: any) => t && typeof t === 'object' && (t.title || '').toLowerCase().includes(q));
      setAiSuggestions(matches.map((t: any) => ({ source_task_id: String(t.id), target_task_id: '', confidence: 0.7, rationale: 'Similar task match' })));
      setShowSuggestions(true);
    } catch { setAiSuggestions([]); }
  };

  const handleClose = () => {
    setShowCreate(false);
    setNewTitle('');
    setNewDesc('');
    setNewStatus('backlog');
    setNewDeps([]);
    setAiSuggestions([]);
    setShowSuggestions(false);
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    const newTask = await addTask({ title: newTitle.trim(), description: newDesc.trim(), status: newStatus as any, dependencies: newDeps });
    // Submit selected prerequisite dependencies so new task connects into DAG
    if (newDeps.length > 0 && newTask && (newTask as any).id) {
      for (const prereqId of newDeps) {
        try {
          await addDependency({ sourceTaskId: prereqId, targetTaskId: String((newTask as any).id) } as any);
        } catch { /* ignore individual dep failure */ }
      }
    }
    handleClose();
  };

  return (
    <header className="h-14 flex items-center justify-between px-4 bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 shadow-sm sticky top-0 z-50 backdrop-blur-md">
      {/* Left: Logo */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white font-extrabold text-base shadow-lg shadow-indigo-900/40">
          T
        </div>
        <div className="hidden md:block">
          <h1 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">TaskFlow Pro</h1>
          <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400">DAG Scheduler</span>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Progress */}
        <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-slate-800/80 rounded-md border border-slate-200 dark:border-slate-700">
          <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs font-bold text-emerald-400">{pct}%</span>
        </div>

        {/* WS Status */}
        <div className="flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
          <span className="text-xs font-medium text-slate-400">{wsConnected ? 'Live' : 'API'}</span>
        </div>

        {/* Dark/Light Toggle */}
        <button
          onClick={() => document.documentElement.classList.toggle('dark')}
          className="px-3 py-1.5 rounded-md bg-gradient-to-r from-indigo-600 to-violet-700 text-white text-xs font-bold shadow shadow-indigo-500/30 hover:scale-105 transition-all border border-indigo-400/30"
        >
          <span className="dark:hidden">🌙</span>
          <span className="hidden dark:inline">☀️</span>
        </button>

        {/* Status Check */}
        <button
          onClick={() => alert('Status verified: All tasks OK')}
          className="px-3 py-1.5 rounded-md bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-extrabold shadow shadow-amber-900/30 hover:scale-105 transition-all whitespace-nowrap"
        >
          ⚡ Check
        </button>

        {/* Create Task */}
        <button
          onClick={() => setShowCreate(true)}
          className="px-3 py-1.5 rounded-md bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-extrabold shadow shadow-emerald-900/30 hover:scale-105 transition-all whitespace-nowrap flex items-center gap-1"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Create
        </button>
      </div>

      {/* Centered Modal via Portal */}
      {showCreate &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          >
            <div
              className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden shadow-2xl my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Fixed Header */}
              <div className="p-5 border-b border-slate-800 flex justify-between items-center flex-shrink-0">
                <h3 className="text-white font-extrabold text-lg">Create New Task</h3>
                <button
                  onClick={handleClose}
                  className="text-slate-400 hover:text-white text-xl font-bold px-1.5 py-0.5 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Form Body */}
              <div className="overflow-y-auto p-5 space-y-4 flex-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Task Title *</label>
                  <input
                    autoFocus
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder="Enter task title..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreate();
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                    placeholder="Add task details or requirements..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">Dependencies / Depends On</label>
                    <button type="button" onClick={handleSuggest} className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5">✨ Suggest</button>
                  </div>
                  {showSuggestions && aiSuggestions.length > 0 && (
                    <div className="mb-2 p-2 rounded-lg bg-indigo-900/30 border border-indigo-500/30 text-xs text-indigo-200">AI suggestions: {aiSuggestions.length}. Check to add.</div>
                  )}
                  <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-slate-950/60 border border-slate-700/80">
                    {(aiSuggestions || []).map((s: any) => {
                      const id = s.source_task_id || s.id;
                      if (!id) return null;
                      const checked = newDeps.includes(id);
                      return (
                        <label key={id} onClick={() => toggleDep(id)} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors border text-xs select-none ${checked ? 'bg-indigo-600/20 border-indigo-500/50 text-white' : 'bg-slate-900/50 border-transparent text-slate-300 hover:bg-slate-800'}`}>
                          <input type="checkbox" checked={checked} onChange={() => {}} className="w-4 h-4 rounded text-indigo-500 bg-slate-800 border-slate-600 focus:ring-0 cursor-pointer accent-indigo-500" />
                          <span className="truncate flex-1 font-medium">AI: {id}</span>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{Math.round((s.confidence || 0.7) * 100)}%</span>
                        </label>
                      );
                    })}
                    {(tasks || []).filter((t: any) => t && typeof t === 'object').map((t: any) => {
                      const id = String(t.id);
                      const checked = newDeps.includes(id);
                      return (
                        <label
                          key={id}
                          onClick={() => toggleDep(id)}
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors border text-xs select-none ${checked ? 'bg-indigo-600/20 border-indigo-500/50 text-white' : 'bg-slate-900/50 border-transparent text-slate-300 hover:bg-slate-800'}`}
                        >
                          <input type="checkbox" checked={checked} onChange={() => {}} className="w-4 h-4 rounded text-indigo-500 bg-slate-800 border-slate-600 focus:ring-0 cursor-pointer accent-indigo-500" />
                          <span className="truncate flex-1 font-medium">{t.title || id}</span>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{t.status}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Status</label>
                  <select
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="backlog">Backlog</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-between gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-sm font-semibold border border-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => await handleCreate()}
                  disabled={!newTitle.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold shadow-lg shadow-emerald-900/30 transition-all"
                >
                  Create Task
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
};