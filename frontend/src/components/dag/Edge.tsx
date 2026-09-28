export const Edge = ({ source, target, dashed, /*confidence*/ }: { source: string; target: string; dashed?: boolean; confidence?: number }) => (
  <line x1={source} y1={target} stroke={dashed ? '#f59e0b' : '#059669'} strokeWidth={2} strokeDasharray={dashed ? '5 5' : '0'} />
);
