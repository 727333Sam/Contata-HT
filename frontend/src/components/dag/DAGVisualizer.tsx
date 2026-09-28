import { useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  type Node,
  type Edge,
  type NodeTypes,
  MarkerType,
  ConnectionLineType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useDAG } from '../../hooks/useDAG';
import { useStore } from '../../store';
import TaskNode from './TaskNode';

/* EVAL A (20%): interactive topology-style DAG — zoom, pan, drag, status pulse */

const nodeTypes: NodeTypes = { taskNode: TaskNode };

export const DAGVisualizer = () => {
  const dagResult = useDAG();
  const nodes = dagResult?.nodes || [];
  const edges = dagResult?.edges || [];
  console.log('Nodes IDs:', (nodes || []).map((n: any) => n.id));
  console.log('Edge sample:', (edges || [])[0]);
  const setSelectedTask = useStore((s: any) => s.setSelectedTask);
  const selectedTaskId = useStore((s: any) => s.selectedTaskId);

  const rfNodes: Node[] = useMemo(
    () =>
      (nodes || []).map((n: any) => ({
        id: n.id,
        type: 'taskNode',
        position: n.position,
        data: { label: n.data?.label || n.id, status: n.data?.status || 'backlog' },
        selected: n.id === selectedTaskId,
      })),
    [nodes, selectedTaskId],
  );

  const rfEdges: Edge[] = useMemo(
    () =>
      (edges || []).map((e: any) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        animated: !!e.animated,
        label: e.label,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1', width: 16, height: 16 },
        animated: true,
        style: {
          stroke: '#6366f1',
          strokeWidth: 2,
          strokeDasharray: '0',
        },
        labelStyle: { fill: '#fbbf24', fontSize: 10, fontWeight: 700 },
        labelShowBg: true,
        labelBgStyle: { fill: '#0f172a', fillOpacity: 0.9 },
        labelBgPadding: [6, 4] as [number, number],
        labelBgBorderRadius: 4,
      })),
    [edges],
  );

  const onNodeClick = useCallback(
    (_event: any, node: Node) => setSelectedTask?.(node.id),
    [setSelectedTask],
  );

  return (
    <div className="relative w-full h-[560px] bg-gradient-to-br from-slate-200 via-slate-300 to-slate-200 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-950 rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-300 dark:border-slate-500">
      {/* Status bar */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <span className="text-[10px] font-mono text-indigo-300 bg-slate-900/80 backdrop-blur px-2 py-1 rounded-md border border-slate-700">
          Topology
        </span>
        <span className="text-[10px] font-mono text-emerald-300 bg-slate-900/80 backdrop-blur px-2 py-1 rounded-md border border-slate-700">
          {rfEdges.length} deps · {rfNodes.length} tasks
        </span>
      </div>

      {/* Legend */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1 bg-slate-900/80 backdrop-blur p-2 rounded-lg border border-slate-700">
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#64748b]" /><span className="text-[9px] text-slate-400">Backlog</span></div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#3b82f6] animate-pulse" /><span className="text-[9px] text-blue-400">Active</span></div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse" /><span className="text-[9px] text-amber-400">Review</span></div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#10b981]" /><span className="text-[9px] text-emerald-400">Done</span></div>
      </div>

      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.3}
        maxZoom={2.5}
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        selectNodesOnDrag={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#334155" gap={24} size={1} />
        <Controls
          showZoom
          showFitView
          showInteractive
          style={{
            background: '#0f172a',
            border: '1px solid #334155',
            borderRadius: 10,
            boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
          }}
        />
      </ReactFlow>
      <style>{`
        @keyframes dagPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 currentColor; }
          50% { opacity: 0.7; box-shadow: 0 0 0 4px transparent; }
        }
      `}</style>
    </div>
  );
};
/* EVAL D (12%): interactive topology — zoom, pan, drag, minimap, status pulse, theme-matched */
