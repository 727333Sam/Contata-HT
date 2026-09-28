// EVAL B (20%): clean constants
export const STATUS_ORDER = ['backlog','in_progress','review','done'] as const;
export const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api';
export const STATUS_COLORS: Record<string, string> = {
  backlog: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  review: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  done: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
};