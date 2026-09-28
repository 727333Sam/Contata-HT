import { useStore } from '../store';

export const useTasks = () => {
  const tasks = useStore((s) => s.tasks);
  const loading = useStore((s) => s.loading);
  const fetchTasks = useStore((s) => s.fetchTasks);
  const addTask = useStore((s) => s.addTask);
  const updateTask = useStore((s) => s.updateTask);
  const deleteTask = useStore((s) => s.deleteTask);
  return { tasks, loading, fetchTasks, addTask, updateTask, deleteTask };
};
