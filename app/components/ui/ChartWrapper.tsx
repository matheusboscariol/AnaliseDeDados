interface ChartWrapperProps {
  title: string
  children: React.ReactNode
  height?: number
}

export function ChartWrapper({ title, children, height = 300 }: ChartWrapperProps) {
  return (
    <div className="bg-[#111118] border border-[#1E1E2E] rounded-xl p-6">
      <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">{title}</h3>
      <div style={{ height }}>{children}</div>
    </div>
  )
}
