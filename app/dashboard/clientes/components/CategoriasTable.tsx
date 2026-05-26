'use client'

import { EmptyState } from '@/app/components/ui'

interface CategoriaRow {
  categoria: string
  unidades: number
  receita: number
}

const currency = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

export function CategoriasTable({ data }: { data: CategoriaRow[] }) {
  if (data.length === 0) {
    return <EmptyState message="Nenhuma categoria comprada." />
  }
  const maxUnidades = Math.max(...data.map((d) => d.unidades), 1)
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider text-slate-500 border-b border-[#1E1E2E]">
            <th className="py-2 pr-4 font-medium">Categoria</th>
            <th className="py-2 pr-4 font-medium">Unidades</th>
            <th className="py-2 pr-4 font-medium">Receita</th>
            <th className="py-2 font-medium w-1/3">Volume relativo</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const pct = (row.unidades / maxUnidades) * 100
            return (
              <tr key={row.categoria} className="border-b border-[#1E1E2E]/60">
                <td className="py-2 pr-4 text-slate-200">{row.categoria}</td>
                <td className="py-2 pr-4 text-slate-300 tabular-nums">{row.unidades}</td>
                <td className="py-2 pr-4 text-slate-300 tabular-nums">{currency(row.receita)}</td>
                <td className="py-2">
                  <div className="h-2 bg-[#1E1E2E] rounded">
                    <div
                      className="h-2 rounded bg-indigo-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
