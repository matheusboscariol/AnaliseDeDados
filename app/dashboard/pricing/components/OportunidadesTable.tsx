import type { ProdutoIndice } from '@/app/lib/queries/pricing'

interface Props {
  risco: ProdutoIndice[]
  upside: ProdutoIndice[]
}

export function OportunidadesTable({ risco, upside }: Props) {
  const linhas = [
    ...risco.map((p) => ({ tipo: 'risco' as const, produto: p })),
    ...upside.map((p) => ({ tipo: 'upside' as const, produto: p })),
  ].sort(
    (a, b) =>
      Math.abs(b.produto.indiceCompetitividade) -
      Math.abs(a.produto.indiceCompetitividade)
  )

  if (linhas.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-slate-500 text-sm">
        Nenhum produto com gap relevante (acima de ±15%).
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider border-b border-[#1E1E2E]">
            <th className="py-3 pr-4">Produto</th>
            <th className="py-3 pr-4">Categoria</th>
            <th className="py-3 pr-4 text-right">Nosso Preço</th>
            <th className="py-3 pr-4 text-right">Média Concorrente</th>
            <th className="py-3 pr-4 text-right">Gap</th>
            <th className="py-3">Ação Sugerida</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map(({ tipo, produto }) => (
            <tr key={produto.id_produto} className="border-b border-[#1E1E2E]/50">
              <td className="py-3 pr-4 text-slate-200">{produto.nome_produto}</td>
              <td className="py-3 pr-4 text-slate-400">{produto.categoria}</td>
              <td className="py-3 pr-4 text-right text-slate-200 tabular-nums">
                R$ {produto.preco.toFixed(2)}
              </td>
              <td className="py-3 pr-4 text-right text-slate-400 tabular-nums">
                R$ {produto.precoMedioConcorrente.toFixed(2)}
              </td>
              <td
                className={`py-3 pr-4 text-right font-medium tabular-nums ${
                  tipo === 'risco' ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {produto.indiceCompetitividade > 0 ? '+' : ''}
                {produto.indiceCompetitividade.toFixed(1)}%
              </td>
              <td className="py-3">
                <span
                  className={`inline-block text-xs px-2 py-1 rounded-md ${
                    tipo === 'risco'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  {tipo === 'risco' ? 'Reduzir preço' : 'Pode subir preço'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
