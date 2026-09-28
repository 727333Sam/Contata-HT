export const ConfidenceBadge = ({ score }: { score: number }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${score >= 0.8 ? 'bg-emerald-100 text-emerald-700' : score >= 0.5 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
    {Math.round(score * 100)}% conf
  </span>
);
