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
  fetchClientesComVendas,
  fetchCategoriasMaisCompradas,
  calcularResumoClientes,
  calcularTopClientes,
  calcularDistribuicaoEstados,
  calcularCanalPreferido,
  type ClienteComVendas,
} from '@/app/lib/queries/clientes'
import { EstadosBarChart } from './components/EstadosBarChart'
import { TopClientesChart } from './components/TopClientesChart'
import { CanalPreferidoChart } from './components/CanalPreferidoChart'
import { CategoriasTable } from './components/CategoriasTable'

interface CategoriaAgregada {
  categoria: string
  unidades: number
  receita: number
}

const currency = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

const fmtDate = (iso: string | null) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<ClienteComVendas[] | null>(null)
  const [categorias, setCategorias] = useState<CategoriaAgregada[] | null>(null)

  useEffect(() => {
    fetchClientesComVendas().then(setClientes)
    fetchCategoriasMaisCompradas().then(setCategorias)
  }, [])

  const view = useMemo(() => {
    if (!clientes) return null

    const resumo = calcularResumoClientes(clientes)
    const top5 = calcularTopClientes(clientes, 5)
    const estados = calcularDistribuicaoEstados(clientes)
    const canais = calcularCanalPreferido(clientes)

    const top10Estados = estados.slice(0, 10)
    const restoEstados = estados.slice(10).reduce(
      (acc, e) => ({
        clientes: acc.clientes + e.clientes,
        receita: acc.receita + e.receita,
      }),
      { clientes: 0, receita: 0 }
    )
    const estadosChart =
      restoEstados.clientes > 0
        ? [...top10Estados, { estado: 'Outros', ...restoEstados }]
        : top10Estados

    const baseDormida = resumo.totalCadastrados - resumo.totalAtivos
    const ativos = clientes.filter((c) => c.totalPedidos > 0)

    const ativosComCadastro = ativos.filter((c) => !!c.data_cadastro)
    const ordenadosPorCadastro = [...ativosComCadastro].sort(
      (a, b) => new Date(a.data_cadastro!).getTime() - new Date(b.data_cadastro!).getTime()
    )
    const maisAntigoAtivo = ordenadosPorCadastro[0] ?? null
    const maisNovoAtivo =
      ordenadosPorCadastro[ordenadosPorCadastro.length - 1] ?? null

    return {
      resumo,
      top5,
      estadosChart,
      canais,
      baseDormida,
      maisAntigoAtivo,
      maisNovoAtivo,
    }
  }, [clientes])

  if (!view || !categorias) {
    return (
      <div className="bg-[#0A0A0F] min-h-screen p-6 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  const { resumo } = view

  return (
    <div className="bg-[#0A0A0F] min-h-screen p-6">
      <SectionHeader
        title="Clientes & Comportamento"
        description="Base em 13/12/2025 — quem são, de onde vêm, em qual canal compram e o que levam"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KPICard
          label="Clientes Cadastrados"
          value={resumo.totalCadastrados}
          sub="Base total"
        />
        <KPICard
          label="Clientes Ativos"
          value={resumo.totalAtivos}
          sub={`${view.baseDormida} sem compra`}
          color="#10B981"
          trend={
            resumo.totalCadastrados > 0 &&
            resumo.totalAtivos / resumo.totalCadastrados >= 0.7
              ? 'up'
              : 'neutral'
          }
        />
        <KPICard
          label="Taxa de Recompra"
          value={`${resumo.taxaRecompra.toFixed(1)}%`}
          sub="Ativos com 2+ pedidos no dia"
          trend={resumo.taxaRecompra >= 50 ? 'up' : 'neutral'}
        />
        <KPICard
          label="Ticket Médio por Cliente"
          value={currency(resumo.ticketMedioCliente)}
          sub="Receita ÷ ativos"
          color="#F59E0B"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ChartWrapper title="Top 5 Clientes por Receita" height={320}>
          {view.top5.length > 0 ? (
            <TopClientesChart data={view.top5} />
          ) : (
            <EmptyState message="Nenhum cliente com receita." />
          )}
        </ChartWrapper>

        <ChartWrapper title="Distribuição por Estado (Top 10)" height={320}>
          {view.estadosChart.length > 0 ? (
            <EstadosBarChart data={view.estadosChart} />
          ) : (
            <EmptyState message="Sem dados de estado." />
          )}
        </ChartWrapper>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ChartWrapper title="Canal Preferido (por cliente)" height={320}>
          {view.canais.length > 0 ? (
            <CanalPreferidoChart data={view.canais} />
          ) : (
            <EmptyState message="Sem dados de canal." />
          )}
        </ChartWrapper>

        <ChartWrapper title="Categorias Mais Compradas" height={320}>
          <CategoriasTable data={categorias} />
        </ChartWrapper>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <KPICard
          label="Cliente Mais Antigo Ativo"
          value={view.maisAntigoAtivo?.nome_cliente ?? '—'}
          sub={
            view.maisAntigoAtivo
              ? `Cadastrado em ${fmtDate(view.maisAntigoAtivo.data_cadastro)} · ${
                  view.maisAntigoAtivo.estado ?? 'N/D'
                }`
              : 'Sem clientes ativos com cadastro'
          }
        />
        <KPICard
          label="Cliente Mais Novo Ativo"
          value={view.maisNovoAtivo?.nome_cliente ?? '—'}
          sub={
            view.maisNovoAtivo
              ? `Cadastrado em ${fmtDate(view.maisNovoAtivo.data_cadastro)} · ${
                  view.maisNovoAtivo.estado ?? 'N/D'
                }`
              : 'Sem clientes ativos com cadastro'
          }
        />
      </div>

      <p className="text-xs text-slate-500 mt-6">
        Todas as vendas concentradas em 13/12/2025 — &quot;recompra&quot; aqui significa cliente
        com 2+ pedidos no dia, não retorno em datas diferentes. Distribuição por estado tem base
        pequena (média de ~1,75 cliente por UF) — leia como mapa de presença, não como mercado.
      </p>
    </div>
  )
}
