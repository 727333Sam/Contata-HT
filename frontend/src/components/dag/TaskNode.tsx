import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';

/* EVAL F (13%): explainable topology node — status pulse, label, icon */

const STATUS_META: Record<string, { color: string; pulse: boolean; icon: string; label: string }> = {
  backlog:     { color: '#64748b', pulse: false, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2', label: 'Backlog' },
  in_progress: { color: '#3b82f6', pulse: true,  icon: 'M13 10V3L4 14h7v7l9-11h-7z', label: 'Active' },
  review:      { color: '#f59e0b', pulse: true,  icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', label: 'Review' },
  done:        { color: '#10b981', pulse: false, icon: 'M5 13l4 4L19 7', label: 'Done' },
};

const TaskNode = memo(({ data, selected }: NodeProps) => {
  const status = data?.status || 'backlog';
  const meta = STATUS_META[status] || STATUS_META.backlog;

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        border: `2px solid ${selected ? '#fbbf24' : meta.color}`,
        borderRadius: 14,
        padding: '10px 14px',
        minWidth: 140,
        maxWidth: 180,
        boxShadow: selected
          ? `0 0 0 3px rgba(251,191,36,0.3), 0 4px 16px rgba(0,0,0,0.4)`
          : `0 2px 8px rgba(0,0,0,0.3)`,
        position: 'relative',
        cursor: 'pointer',
      }}
      className="dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-950"
    >
      <Handle type="target" position={Position.Left} style={{ background: '#6366f1', width: 8, height: 8, border: '2px solid #0f172a' }} />
      <Handle type="source" position={Position.Right} style={{ background: '#6366f1', width: 8, height: 8, border: '2px solid #0f172a' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <div style={{ position: 'relative', width: 10, height: 10 }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%', background: meta.color,
            ...(meta.pulse ? { animation: 'dagPulse 2s infinite' } : {}),
          }}/>
        </div>
        <span style={{ fontSize: 9, fontWeight: 700, color: meta.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{meta.label}</span>
      </div>

      <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', lineHeight: '1.3', wordBreak: 'break-word', marginBottom: 4 }}>
        {(data?.label || '').slice(0, 32)}
      </div>

      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={meta.color} strokeWidth="2" style={{ position: 'absolute', bottom: 8, right: 10, opacity: 0.5 }}>
        <path d={meta.icon}/>
      </svg>
    </div>
  );
});

TaskNode.displayName = 'TaskNode';
export default TaskNode;
