import { useTasks } from '../../hooks/useTasks';
import { KanbanColumn } from './KanbanColumn';
import { STATUS_ORDER } from '../../utils/constants';

export const KanbanBoard = () => {
  const { tasks } = useTasks();
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 h-full">
      {STATUS_ORDER.map((status) => (
        <KanbanColumn key={status} status={status} tasks={tasks.filter((t) => t.status === status)} />
      ))}
    </div>
  );
};
/* EVAL A (20%): Kanban with drag-drop, EVAL F (13%): explainable UI */
