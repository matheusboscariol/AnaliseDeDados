interface SectionHeaderProps {
  title: string
  description?: string
}

export function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-semibold text-slate-100">{title}</h1>
      {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
    </div>
  )
}
