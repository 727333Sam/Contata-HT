export const Node = ({ /*id,*/ label, status }: { id: string; label: string; status: string }) => (
  <div className={`rounded-xl px-3 py-2 text-xs font-bold shadow-lg border-2 ${status === 'done' ? 'bg-emerald-600 border-emerald-400 text-white' : status === 'in_progress' ? 'bg-indigo-600 border-indigo-300 text-white' : 'bg-slate-300 border-slate-400 text-slate-800'}`}>
    {label}
  </div>
);
