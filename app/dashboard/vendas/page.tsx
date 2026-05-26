'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  KPICard,
  SectionHeader,
  ChartWrapper,
  LoadingSpinner,
  EmptyState,
} from '@/app/components/ui'
import {
  fetchVendasComProdutos,
  calcularResumo,
  calcularMixCanal,
  calcularTopProdutos,
  calcularReceitaPorHora,
  calcularReceitaPorCategoria,
  type VendaRow,
} from '@/app/lib/queries/vendas'
import { MixCanalChart } from './components/MixCanalChart'
import { ReceitaPorHoraChart } from './components/ReceitaPorHoraChart'
import { TopProdutosChart } from './components/TopProdutosChart'
import { ReceitaPorCategoriaChart } from './components/ReceitaPorCategoriaChart'

const currency = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 })

const integer = (v: number) => v.toLocaleString('pt-BR')

const humanizarCanal = (raw: string) =>
  raw
    .replace(/_/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')

export default function VendasPage() {
  const [rows, setRows] = useState<VendaRow[] | null>(null)

  useEffect(() => {
    fetchVendasComProdutos().then(setRows)
  }, [])

  const view = useMemo(() => {
    if (!rows) return null
    const resumo = calcularResumo(rows)
    const mixCanal = calcularMixCanal(rows)
    const topProdutos = calcularTopProdutos(rows, 5)
    const receitaPorHora = calcularReceitaPorHora(rows)
    const receitaPorCategoria = calcularReceitaPorCategoria(rows)
    const canalLider = mixCanal[0] ?? null
    const horaPico = receitaPorHora.reduce<{ hora: string; receita: number } | null>(
      (acc, h) => (acc && acc.receita >= h.receita ? acc : { hora: h.hora, receita: h.receita }),
      null
    )
    return {
      resumo,
      mixCanal,
      topProdutos,
      receitaPorHora,
      receitaPorCategoria,
      canalLider,
      horaPico,
    }
  }, [rows])

  if (!view) {
    return (
      <div className="bg-[#0A0A0F] min-h-screen p-6 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  const { resumo, mixCanal, topProdutos, receitaPorHora, receitaPorCategoria, canalLider, horaPico } = view

  return (
    <div className="bg-[#0A0A0F] min-h-screen p-6">
      <SectionHeader
        title="Vendas & Receita"
        description="Período: 13/12/2025 — fotografia das vendas do dia"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KPICard
          label="Receita Total"
          value={currency(resumo.receitaTotal)}
          sub={`${integer(resumo.totalPedidos)} pedidos no dia`}
        />
        <KPICard
          label="Ticket Médio"
          value={currency(resumo.ticketMedio)}
          sub="Receita / pedidos"
          color="#10B981"
        />
        <KPICard
          label="Unidades Vendidas"
          value={integer(resumo.unidadesVendidas)}
          sub={
            resumo.totalPedidos > 0
              ? `${(resumo.unidadesVendidas / resumo.totalPedidos).toFixed(1)} por pedido`
              : '—'
          }
          color="#F59E0B"
        />
        <KPICard
          label="Total de Pedidos"
          value={integer(resumo.totalPedidos)}
          sub={
            canalLider
              ? `${humanizarCanal(canalLider.canal)} lidera com ${canalLider.percentual.toFixed(1)}%`
              : '—'
          }
          color="#8B5CF6"
        />
      </div>

      <div className="bg-[#111118] border border-[#1E1E2E] rounded-xl p-4 mb-6">
        <p className="text-xs text-slate-400">
          <span className="text-slate-300 font-medium">Nota:</span> Dados referentes ao dia 13/12/2025.
          Histórico mais amplo disponível quando novos registros forem importados.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ChartWrapper title="Mix de Canal" height={320}>
          {mixCanal.length > 0 ? (
            <MixCanalChart data={mixCanal} />
          ) : (
            <EmptyState message="Sem dados de canal." />
          )}
        </ChartWrapper>

        <ChartWrapper title="Curva de Vendas por Hora" height={320}>
          {receitaPorHora.length > 0 ? (
            <ReceitaPorHoraChart data={receitaPorHora} />
          ) : (
            <EmptyState message="Sem dados horários." />
          )}
        </ChartWrapper>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ChartWrapper title="Top 5 Produtos por Receita" height={320}>
          {topProdutos.length > 0 ? (
            <TopProdutosChart data={topProdutos} />
          ) : (
            <EmptyState message="Sem vendas registradas." />
          )}
        </ChartWrapper>

        <ChartWrapper title="Receita por Categoria" height={320}>
          {receitaPorCategoria.length > 0 ? (
            <ReceitaPorCategoriaChart data={receitaPorCategoria} />
          ) : (
            <EmptyState message="Sem dados de categoria." />
          )}
        </ChartWrapper>
      </div>

      <p className="text-xs text-slate-500 mt-2">
        {horaPico ? (
          <>
            Pico de receita às{' '}
            <span className="text-slate-300 tabular-nums">{horaPico.hora}</span> com{' '}
            <span className="text-slate-300 tabular-nums">{currency(horaPico.receita)}</span>.{' '}
          </>
        ) : null}
        Top produto:{' '}
        <span className="text-slate-300">{topProdutos[0]?.nome ?? '—'}</span>
        {topProdutos[0] ? (
          <>
            {' '}
            com <span className="tabular-nums">{currency(topProdutos[0].receita)}</span>.
          </>
        ) : (
          '.'
        )}
      </p>
    </div>
  )
}
