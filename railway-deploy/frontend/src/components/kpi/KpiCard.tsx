type Props = {
  title: string;
  value: string;
  hint?: string;
  tone?: 'default' | 'success' | 'danger' | 'warning';
};

export function KpiCard({ title, value, hint, tone = 'default' }: Props) {
  const toneClass = {
    default: 'text-slate-900',
    success: 'text-emerald-600',
    danger: 'text-rose-600',
    warning: 'text-amber-600',
  }[tone];

  return (
    <div className="bg-app-card border border-app-border rounded-md shadow-sm p-4">
      <div className="text-sm text-slate-500">{title}</div>
      <div className={`mt-1 text-2xl font-semibold ${toneClass}`}>{value}</div>
      {hint && <div className="text-xs text-slate-400 mt-1">{hint}</div>}
    </div>
  );
}
