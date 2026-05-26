'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  KPICard,
  SectionHeader,
  ChartWrapper,
  LoadingSpinner,
  EmptyState,
} from '@/app/components/ui'
import { getPricingData, type PricingDataset } from '@/app/lib/queries/pricing'
import { CategoriaComparisonChart } from './components/CategoriaComparisonChart'
import { IndiceCompetitividadeChart } from './components/IndiceCompetitividadeChart'
import { OportunidadesTable } from './components/OportunidadesTable'

const TOTAL_PRODUTOS = 45

const percent = (v: number) => `${v > 0 ? '+' : ''}${v.toFixed(1)}%`

export default function PricingPage() {
  const [dataset, setDataset] = useState<PricingDataset | null>(null)

  useEffect(() => {
    getPricingData().then(setDataset)
  }, [])

  const view = useMemo(() => {
    if (!dataset) return null

    const produtosComDado = dataset.indices.length
    const semDado = TOTAL_PRODUTOS - produtosComDado
    const acima = dataset.acimaConcorrente.length
    const abaixo = dataset.abaixoConcorrente.length

    const categoriasComDado = dataset.categorias.filter((c) => c.temConcorrente)
    const categoriasSemDado = dataset.categoriasSemConcorrente
    const totalCategorias = dataset.categorias.length

    const taxaCobertura =
      TOTAL_PRODUTOS > 0 ? (produtosComDado / TOTAL_PRODUTOS) * 100 : 0

    return {
      produtosComDado,
      semDado,
      acima,
      abaixo,
      categoriasComDado,
      categoriasSemDado,
      totalCategorias,
      taxaCobertura,
      maiorGap: dataset.maiorGap,
      indices: dataset.indices,
      oportunidadesRisco: dataset.oportunidadesRisco,
      oportunidadesUpside: dataset.oportunidadesUpside,
    }
  }, [dataset])

  if (!view) {
    return (
      <div className="bg-[#0A0A0F] min-h-screen p-6 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  const headline =
    view.acima > view.abaixo
      ? `Estamos acima do mercado em ${view.acima} de ${view.produtosComDado} produtos com dado de concorrente — risco de perder cliente sensível a preço.`
      : view.abaixo > view.acima
      ? `Estamos abaixo do mercado em ${view.abaixo} de ${view.produtosComDado} produtos — possível upside de margem.`
      : `Posicionamento equilibrado: ${view.acima} acima e ${view.abaixo} abaixo do mercado em ${view.produtosComDado} produtos com dado.`

  return (
    <div className="bg-[#0A0A0F] min-h-screen p-6">
      <SectionHeader
        title="Pricing & Margem"
        description="Onde estamos fora do mercado? Onde podemos subir o preço? Onde precisamos agir?"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KPICard
          label="Produtos com Dado"
          value={`${view.produtosComDado}/${TOTAL_PRODUTOS}`}
          sub={`${view.taxaCobertura.toFixed(0)}% da base coberta`}
        />
        <KPICard
          label="Acima do Mercado"
          value={view.acima}
          sub="Nosso preço > média concorrente"
          color="#EF4444"
          trend={view.acima > view.abaixo ? 'down' : 'neutral'}
        />
        <KPICard
          label="Abaixo do Mercado"
          value={view.abaixo}
          sub="Nosso preço < média concorrente"
          color="#10B981"
          trend={view.abaixo > view.acima ? 'up' : 'neutral'}
        />
        <KPICard
          label="Sem Dado de Concorrente"
          value={view.semDado}
          sub={`${view.categoriasSemDado.length} categorias inteiras sem cobertura`}
          color="#F59E0B"
        />
      </div>

      <div className="bg-[#111118] border border-[#1E1E2E] rounded-xl p-4 mb-6">
        <p className="text-sm text-slate-300">
          <span className="text-slate-100 font-medium">Leitura do dia: </span>
          {headline}
        </p>
        <p className="text-xs text-slate-500 mt-2">
          Cobertura de concorrente: {view.produtosComDado} de {TOTAL_PRODUTOS} produtos
          ({view.categoriasComDado.length} de {view.totalCategorias} categorias).{' '}
          {view.categoriasSemDado.length > 0 && (
            <>
              Categorias sem dado:{' '}
              <span className="text-slate-400">{view.categoriasSemDado.join(', ')}</span>.
            </>
          )}
          {view.maiorGap && (
            <>
              {' '}Maior gap por categoria:{' '}
              <span className="text-slate-400">
                {view.maiorGap.categoria} ({percent(view.maiorGap.gapPercent)})
              </span>
              .
            </>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ChartWrapper title="Nosso Preço vs. Média Concorrente por Categoria" height={340}>
          {view.categoriasComDado.length > 0 ? (
            <CategoriaComparisonChart data={view.categoriasComDado} />
          ) : (
            <EmptyState message="Nenhuma categoria com dado de concorrente." />
          )}
        </ChartWrapper>

        <ChartWrapper title="Índice de Competitividade por Produto" height={340}>
          {view.indices.length > 0 ? (
            <IndiceCompetitividadeChart data={view.indices} />
          ) : (
            <EmptyState message="Sem produtos com dado de concorrente." />
          )}
        </ChartWrapper>
      </div>

      <div className="bg-[#111118] border border-[#1E1E2E] rounded-xl p-6 mb-6">
        <div className="flex items-baseline justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
            Tabela de Oportunidades
          </h3>
          <span className="text-xs text-slate-500">
            Gap absoluto acima de 15% · ordenado por magnitude
          </span>
        </div>
        <OportunidadesTable
          risco={view.oportunidadesRisco}
          upside={view.oportunidadesUpside}
        />
      </div>

      <p className="text-xs text-slate-500">
        Índice de competitividade = (nosso preço / média dos concorrentes − 1) × 100. Verde
        indica que estamos mais baratos que o mercado; vermelho, mais caros. Produtos sem
        registro em <span className="text-slate-400">preco_competidores</span> ficam fora dos
        gráficos para evitar comparações falsas — não são tratados como zero.
      </p>
    </div>
  )
}
