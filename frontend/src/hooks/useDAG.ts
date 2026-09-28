import { useMemo } from 'react';
import { useStore } from '../store';
import type { Task } from '../types/task';
import dagre from 'dagre';

const STATUS_COLOR: Record<string, string> = {
  backlog: '#64748b',
  in_progress: '#3b82f6',
  review: '#f59e0b',
  done: '#10b981',
};

export const useDAG = () => {
  const tasks = useStore((s: any) => s.tasks || []);
  const dependencies = useStore((s: any) => s.dependencies || []);
  const selectedTaskId = useStore((s: any) => s.selectedTaskId);

  const { nodes, edges } = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return { nodes: [], edges: [] };
    }

    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: 'LR', nodesep: 50, ranksep: 110, marginx: 30, marginy: 30 });
    g.setDefaultEdgeLabel(() => ({}));

    // 1. Add all tasks to Dagre
    tasks.forEach((t: Task) => {
      g.setNode(String(t.id), { width: 170, height: 75, label: t.title });
    });

    // Helper: Prerequisite (depends_on_id) -> Target Task (task_id)
    const getEndpoints = (d: any) => {
      // If the backend has task_id depending on depends_on_id:
      // Source (start of arrow) = prerequisite (depends_on_id)
      // Target (end of arrow)   = dependent task (task_id)
      const rawSource = d.depends_on_id ?? d.targetTaskId ?? d.target;
      const rawTarget = d.task_id ?? d.sourceTaskId ?? d.source;

      return {
        source: rawSource ? String(rawSource) : null,
        target: rawTarget ? String(rawTarget) : null,
      };
    };

    // 2. Register edges into Dagre layout
    dependencies.forEach((d: any) => {
      const { source, target } = getEndpoints(d);
      if (
        source &&
        target &&
        tasks.some((t: any) => String(t.id) === source) &&
        tasks.some((t: any) => String(t.id) === target)
      ) {
        g.setEdge(source, target);
      }
    });

    dagre.layout(g);

    // 3. Create layouted nodes
    const dagNodes = tasks.map((t: Task) => {
      const nodeInfo = g.node(String(t.id)) || { x: 100, y: 100 };
      return {
        id: String(t.id),
        type: 'taskNode',
        data: { label: t.title, status: t.status },
        position: { x: nodeInfo.x - 85, y: nodeInfo.y - 37 },
        style: { background: STATUS_COLOR[t.status] || '#334155' },
      };
    });

    // 4. Create visual edges
    const dagEdges: any[] = [];
    dependencies.forEach((d: any, idx: number) => {
      const { source, target } = getEndpoints(d);
      if (source && target) {
        dagEdges.push({
          id: d.id ? String(d.id) : `e-${source}-${target}-${idx}`,
          source,
          target,
          type: 'smoothstep',
          animated: true,
          style: {
            stroke: d.validated ? '#10b981' : '#6366f1',
            strokeWidth: 2,
          },
          label: d.confidence ? `${Math.round(d.confidence * 100)}%` : undefined,
        });
      }
    });

    return { nodes: dagNodes, edges: dagEdges };
  }, [tasks, dependencies]);

  return { nodes, edges, selectedTaskId };
};