export const Modal = ({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl max-w-md w-full mx-4 border border-slate-200 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};
