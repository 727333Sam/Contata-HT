import { useStore } from '../store';

export const useDependencies = () => {
  const dependencies = useStore((s) => s.dependencies);
  const addDependency = useStore((s) => s.addDependency);
  const removeDependency = useStore((s) => s.removeDependency);
  return { dependencies, addDependency, removeDependency };
};
