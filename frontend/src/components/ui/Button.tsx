export const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }: { children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'danger'; className?: string; disabled?: boolean }) => (
  <button onClick={onClick} disabled={disabled} className={`px-4 py-2 rounded-lg font-medium transition shadow-sm ${variant === 'primary' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : variant === 'secondary' ? 'bg-slate-100 text-slate-800 hover:bg-slate-200' : 'bg-rose-600 text-white hover:bg-rose-700'} ${className}`}>
    {children}
  </button>
);
