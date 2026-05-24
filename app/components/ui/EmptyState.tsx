export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-32 text-slate-500 text-sm">{message}</div>
  )
}
