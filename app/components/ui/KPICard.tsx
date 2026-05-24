interface KPICardProps {
  label: string
  value: string | number
  sub?: string
  trend?: 'up' | 'down' | 'neutral'
  color?: string
}

export function KPICard({ label, value, sub, trend, color = '#6366F1' }: KPICardProps) {
  return (
    <div className="bg-[#111118] border border-[#1E1E2E] rounded-xl p-6">
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">{label}</p>
      <p className="text-3xl font-bold text-slate-100">{value}</p>
      {sub && <p className="text-sm text-slate-400 mt-1">{sub}</p>}
      {trend && (
        <span className={`text-xs mt-2 inline-block ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400'}`}>
          {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '—'}
        </span>
      )}
    </div>
  )
}
