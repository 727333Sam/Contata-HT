export const truncate = (s: string, n = 80) => (s.length > n ? `${s.slice(0, n)}...` : s);
export const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
