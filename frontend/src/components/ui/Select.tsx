export const Select = ({ options, value, onChange }: { options: { label: string; value: string }[]; value: string; onChange: (v: string) => void }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500">
    {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);
