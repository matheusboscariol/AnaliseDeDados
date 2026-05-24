'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  KPICard,
  SectionHeader,
  ChartWrapper,
  LoadingSpinner,
  EmptyState,
} from '@/app/components/ui'
import { getClientesData, type ClienteRow } from '@/app/lib/queries/clientes'
import { EstadosBarChart } from './components/EstadosBarChart'
import { TopClientesChart } from './components/TopClientesChart'
import { CanalPreferidoChart } from './components/CanalPreferidoChart'
import { CategoriasTable } from './components/CategoriasTable'

const currency = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

const fmtDate = (iso: string | null) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function ClientesPage() {
  const [rows, setRows] = useState<ClienteRow[] | null>(null)

  useEffect(() => {
    getClientesData().then(setRows)
  }, [])

  const view = useMemo(() => {
    if (!rows) return null

    const total = rows.length
    const ativos = rows.filter((c) => (c.vendas?.length ?? 0) > 0)
    const compradoresHoje = ativos.length
    const baseDormida = total - compradoresHoje
    const taxaAtivacao = total > 0 ? (compradoresHoje / total) * 100 : 0

    // Distribuição por estado (Top 10 + Outros)
    const estadoMap = new Map<string, number>()
    rows.forEach((c) => {
      const uf = c.estado?.trim() || 'N/D'
      estadoMap.set(uf, (estadoMap.get(uf) ?? 0) + 1)
    })
    const estadosOrdenados = [...estadoMap.entries()]
      .map(([estado, clientes]) => ({ estado, clientes }))
      .sort((a, b) => b.clientes - a.clientes)
    const top10Estados = estadosOrdenados.slice(0, 10)
    const restoEstados = estadosOrdenados.slice(10).reduce((acc, e) => acc + e.clientes, 0)
    const estadosChart =
      restoEstados > 0
        ? [...top10Estados, { estado: 'Outros', clientes: restoEstados }]
        : top10Estados

    // Receita por cliente (LTV do dia) — Top 10
    const receitaPorCliente = ativos
      .map((c) => {
        const receita = (c.vendas ?? []).reduce(
          (acc, v) => acc + (v.quantidade ?? 0) * Number(v.preco_unitario ?? 0),
          0
        )
        return { nome: c.nome_cliente, receita }
      })
      .sort((a, b) => b.receita - a.receita)
      .slice(0, 10)
      .reverse() // bar horizontal: maior no topo

    // Canal preferido POR CLIENTE
    const canalCounts = { ecommerce: 0, loja_fisica: 0, ambos: 0, sem_canal: 0 }
    ativos.forEach((c) => {
      const canais = new Set(
        (c.vendas ?? [])
          .map((v) => (v.canal_venda ?? '').toLowerCase().replace('í', 'i'))
          .filter(Boolean)
      )
      if (canais.size === 0) canalCounts.sem_canal += 1
      else if (canais.size > 1) canalCounts.ambos += 1
      else if (canais.has('ecommerce') || canais.has('e-commerce')) canalCounts.ecommerce += 1
      else if (canais.has('loja_fisica') || canais.has('loja fisica') || canais.has('loja_física'))
        canalCounts.loja_fisica += 1
      else canalCounts.sem_canal += 1
    })
    const canalChart = [
      { key: 'ecommerce', name: 'E-commerce', value: canalCounts.ecommerce },
      { key: 'loja_fisica', name: 'Loja Física', value: canalCounts.loja_fisica },
      { key: 'ambos', name: 'Multicanal', value: canalCounts.ambos },
    ].filter((d) => d.value > 0)

    // Categorias mais compradas (por nº de clientes)
    const catMap = new Map<string, { clientes: Set<string>; itens: number }>()
    ativos.forEach((c) => {
      ;(c.vendas ?? []).forEach((v) => {
        const cat = v.produtos?.categoria?.trim() || 'Sem categoria'
        const entry = catMap.get(cat) ?? { clientes: new Set(), itens: 0 }
        entry.clientes.add(c.id_cliente)
        entry.itens += v.quantidade ?? 0
        catMap.set(cat, entry)
      })
    })
    const categoriasTable = [...catMap.entries()]
      .map(([categoria, v]) => ({ categoria, clientes: v.clientes.size, itens: v.itens }))
      .sort((a, b) => b.clientes - a.clientes)

    // Cliente ativo mais antigo / mais novo (por data de cadastro)
    const ativosComData = ativos.filter((c) => !!c.data_cadastro)
    const ordenadosPorCadastro = [...ativosComData].sort(
      (a, b) => new Date(a.data_cadastro!).getTime() - new Date(b.data_cadastro!).getTime()
    )
    const maisAntigoAtivo = ordenadosPorCadastro[0] ?? null
    const maisNovoAtivo = ordenadosPorCadastro[ordenadosPorCadastro.length - 1] ?? null

    return {
      total,
      compradoresHoje,
      baseDormida,
      taxaAtivacao,
      estadosChart,
      receitaPorCliente,
      canalChart,
      categoriasTable,
      maisAntigoAtivo,
      maisNovoAtivo,
    }
  }, [rows])

  if (!view) {
    return (
      <div className="bg-[#0A0A0F] min-h-screen p-6 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="bg-[#0A0A0F] min-h-screen p-6">
      <SectionHeader
        title="Clientes & Comportamento"
        description="Base de clientes em 13/12/2025 — quem são, de onde vêm e quem compra mais"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KPICard label="Total de Clientes" value={view.total} sub="Base cadastrada" />
        <KPICard
          label="Compradores Hoje"
          value={view.compradoresHoje}
          sub="Clientes com venda em 13/12"
          color="#10B981"
        />
        <KPICard
          label="Base Dormida"
          value={view.baseDormida}
          sub="Sem compras hoje"
          color="#F59E0B"
        />
        <KPICard
          label="Taxa de Ativação"
          value={`${view.taxaAtivacao.toFixed(1)}%`}
          sub="Compradores / total"
          trend={view.taxaAtivacao >= 50 ? 'up' : view.taxaAtivacao >= 30 ? 'neutral' : 'down'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ChartWrapper title="Distribuição Geográfica — Clientes por Estado" height={320}>
          {view.estadosChart.length > 0 ? (
            <EstadosBarChart data={view.estadosChart} />
          ) : (
            <EmptyState message="Sem dados de estado." />
          )}
        </ChartWrapper>

        <ChartWrapper title="Top 10 Clientes por Receita Hoje" height={320}>
          {view.receitaPorCliente.length > 0 ? (
            <TopClientesChart data={view.receitaPorCliente} />
          ) : (
            <EmptyState message="Nenhuma venda registrada hoje." />
          )}
        </ChartWrapper>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ChartWrapper title="Canal de Compra Preferido (por cliente)" height={320}>
          {view.canalChart.length > 0 ? (
            <CanalPreferidoChart data={view.canalChart} />
          ) : (
            <EmptyState message="Sem dados de canal." />
          )}
        </ChartWrapper>

        <ChartWrapper title="Categorias Mais Compradas" height={320}>
          <CategoriasTable data={view.categoriasTable} />
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
        Receita total do dia (compradores):{' '}
        <span className="text-slate-300 tabular-nums">
          {currency(
            view.receitaPorCliente.reduce((a, b) => a + b.receita, 0)
          )}
        </span>{' '}
        — exibido apenas Top 10. Base dormida ({view.baseDormida} clientes) é um estado válido,
        não erro.
      </p>
    </div>
  )
}
