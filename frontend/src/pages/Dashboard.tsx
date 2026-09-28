import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { DAGVisualizer } from '../components/dag/DAGVisualizer';
import { SuggestionPanel } from '../components/ai/SuggestionPanel';
import { useWebSocket } from '../hooks/useWebSocket';
import { useTasks } from '../hooks/useTasks';
import { useEffect } from 'react';
import { useStore } from '../store';

/* EVAL A/D: full-width vertical layout — scroll up/down, wide landscape DAG */
export const Dashboard = () => {
  useWebSocket();
  const { fetchTasks } = useTasks();
  useEffect(() => { fetchTasks(); useStore.getState().fetchDependencies?.(); }, [fetchTasks]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Top: Kanban */}
          <section className="mb-8">
            <h2 className="font-extrabold text-2xl mb-4 text-slate-900 dark:text-white">Kanban Board</h2>
            <KanbanBoard />
          </section>

          {/* Bottom: full-width landscape DAG + suggestions horizontal */}
          <section className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 min-h-[520px]">
              <h2 className="font-extrabold text-2xl mb-3 text-slate-900 dark:text-white">DAG Visualizer</h2>
              <DAGVisualizer />
            </div>
            <aside className="w-full lg:w-[360px] flex-shrink-0">
              <SuggestionPanel />
            </aside>
          </section>
        </main>
      </div>
    </div>
  );
};
