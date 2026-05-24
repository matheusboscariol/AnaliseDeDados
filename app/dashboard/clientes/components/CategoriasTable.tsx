'use client'

interface CategoriaRow {
  categoria: string
  clientes: number
  itens: number
}

export function CategoriasTable({ data }: { data: CategoriaRow[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-slate-500">Nenhuma categoria comprada hoje.</p>
  }
  const maxClientes = Math.max(...data.map((d) => d.clientes), 1)
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider text-slate-500 border-b border-[#1E1E2E]">
            <th className="py-2 pr-4 font-medium">Categoria</th>
            <th className="py-2 pr-4 font-medium">Clientes</th>
            <th className="py-2 pr-4 font-medium">Itens</th>
            <th className="py-2 font-medium w-1/3">Distribuição</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const pct = (row.clientes / maxClientes) * 100
            return (
              <tr key={row.categoria} className="border-b border-[#1E1E2E]/60">
                <td className="py-2 pr-4 text-slate-200">{row.categoria}</td>
                <td className="py-2 pr-4 text-slate-300 tabular-nums">{row.clientes}</td>
                <td className="py-2 pr-4 text-slate-400 tabular-nums">{row.itens}</td>
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
