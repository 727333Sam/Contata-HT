import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../../store';

export const EditTaskModal = ({ task, onClose }: { task: any; onClose: () => void }) => {
  const [title, setTitle] = useState(task?.title || '');
  const [desc, setDesc] = useState(task?.description || '');
  const [status, setStatus] = useState(task?.status || 'backlog');
  const [deps, setDeps] = useState<string[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const toggleDep = (id: string) => setDeps((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const allTasks = useStore((s: any) => s.tasks || []);
  const updateTask = useStore((s: any) => s.updateTask);

  if (!task) return null;

  const handleSuggest = async () => {
    try {
      const api = await import('../../services/api');
      if (task && String(task.id)) {
        const res = await api.getAISuggestions(String(task.id));
        setAiSuggestions(res || []);
      }
    } catch { setAiSuggestions([]); }
  };

  const handleSave = async () => {
    const payload: any = {};
    if (title !== task.title) payload.title = title;
    if (desc !== (task.description || '')) payload.description = desc;
    if (status !== task.status) payload.status = status;
    payload.dependencies = deps.map(String);
    await updateTask(String(task.id), payload);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden shadow-2xl my-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-slate-800 flex justify-between items-center flex-shrink-0">
          <h3 className="text-white font-extrabold text-lg">Edit Task</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl font-bold px-1.5 py-0.5 rounded-lg hover:bg-slate-800">✕</button>
        </div>
        <div className="overflow-y-auto p-5 space-y-4 flex-1">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Title *</label>
            <input className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description</label>
            <textarea rows={3} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-sm resize-none focus:outline-none focus:border-indigo-500" value={desc} onChange={e => setDesc(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Status</label>
            <select className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="backlog">Backlog</option><option value="in_progress">In Progress</option><option value="review">Review</option><option value="done">Done</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Prerequisites (Depends On) <span className="text-slate-500 font-normal">(optional)</span></label>
            <div className="flex justify-between mb-1">
              <span className="text-[10px] text-slate-400">Select prerequisites</span>
              <button type="button" onClick={handleSuggest} className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300">✨ AI Suggest</button>
            </div>
            {aiSuggestions.length > 0 && (
              <div className="mb-2 p-1.5 rounded bg-indigo-900/30 border border-indigo-500/30 text-[10px] text-indigo-200">Suggested: {aiSuggestions.length}. Check to add.</div>
            )}
            <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-slate-950/60 border border-slate-700/80">
              {aiSuggestions.map((s: any) => {
                const id = s.source_task_id || s.id;
                const checked = deps.includes(id);
                return (
                  <label key={id} onClick={() => toggleDep(id)} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors border text-xs select-none ${checked ? 'bg-indigo-600/20 border-indigo-500/50 text-white' : 'bg-slate-900/50 border-transparent text-slate-300 hover:bg-slate-800'}`}>
                    <input type="checkbox" checked={checked} onChange={() => {}} className="w-4 h-4 rounded text-indigo-500 bg-slate-800 border-slate-600 focus:ring-0 cursor-pointer accent-indigo-500" />
                    <span className="truncate flex-1 font-medium">AI Suggest: {id}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{Math.round((s.confidence||0.7)*100)}%</span>
                  </label>
                );
              })}
              {allTasks.filter((t: any) => String(t.id) !== String(task.id)).map((t: any) => {
                const id = String(t.id);
                const checked = deps.includes(id);
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
        </div>
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end gap-3 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-sm font-semibold border border-slate-700">Cancel</button>
          <button onClick={handleSave} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-bold shadow-lg">Save</button>
        </div>
      </div>
    </div>, document.body
  );
};
