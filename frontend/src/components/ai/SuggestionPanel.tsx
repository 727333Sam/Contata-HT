import React from 'react';
import { useState } from 'react';
import { useStore } from '../../store';
import { getAISuggestions } from '../../services/api';

export const SuggestionPanel: React.FC = () => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const tasks = useStore((s: any) => s.tasks || []);
  const selectedTaskId = useStore((s: any) => s.selectedTaskId || s.selectedTask?.id);

  const handleLoad = async () => {
    console.log("--> [Load Clicked] Current selectedTaskId:", selectedTaskId);
    if (!selectedTaskId) {
      setErrorMsg("Please click on a task first to select it.");
      return;
    }
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/tasks/${selectedTaskId}/suggest`);
      console.log("--> [Suggest Response Status]:", res.status);
      const data = await res.json();
      console.log("--> [Suggest Response Data]:", data);
      setSuggestions(Array.isArray(data) ? data : data.suggestions || data.data || []);
    } catch (err: any) {
      console.error("Failed to load suggestions:", err);
      setErrorMsg("Failed to connect to suggestions API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm'>
      <div className='flex items-center justify-between mb-3'>
        <h2 className='font-bold text-slate-900 dark:text-white'>AI Suggestions</h2>
        <button type="button" onClick={handleLoad} disabled={loading} className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow transition">
          {loading ? "Loading..." : "Load"}
        </button>
      </div>
      {errorMsg && <div className="text-xs text-rose-500 mb-2">{errorMsg}</div>}
      <div className='space-y-3 max-h-[260px] overflow-y-auto'>
        {suggestions.map((s: any, i: number) => (
          <div key={i} className='p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700'>
            <div className='flex justify-between'>
              <span className='font-semibold text-sm'>{(() => {
                const src = tasks.find((t: any) => String(t.id) === String(s.source_task_id || s.id || s.sourceTaskId));
                const tgt = tasks.find((t: any) => String(t.id) === String(s.target_task_id || s.suggested_dependency_id || s.targetTaskId));
                return `${src?.title || s.source_task_id || ''} → ${tgt?.title || s.target_task_id || s.suggested_dependency_id || ''}`;
              })()}</span>
              <span className='text-xs font-bold text-indigo-600'>{Math.round((s.confidence || 0) * 100)}%</span>
            </div>
            <div className='w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-full mb-2 overflow-hidden'>
              <div className='h-full bg-indigo-500 rounded-full' style={{ width: `${(s.confidence || 0) * 100}%` }} />
            </div>
            <p className='text-xs text-slate-500 dark:text-slate-400 mb-2'>{s.rationale || s.reason || ''}</p>
          </div>
        ))}
        {suggestions.length === 0 && (
          <div className='text-xs text-slate-400'>No suggestions. Select a task and click Load.</div>
        )}
      </div>
    </div>
  );
};
