'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ProdutoIndice } from '@/app/lib/queries/pricing'

interface Props {
  data: ProdutoIndice[]
}

export function IndiceCompetitividadeChart({ data }: Props) {
  const chartData = data.map((p) => ({
    nome: truncate(p.nome_produto, 18),
    nomeCompleto: p.nome_produto,
    categoria: p.categoria,
    indice: Number(p.indiceCompetitividade.toFixed(1)),
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 8, right: 24, left: 80, bottom: 8 }}
      >
        <CartesianGrid stroke="#1E1E2E" horizontal={false} />
        <XAxis
          type="number"
          stroke="#94A3B8"
          tick={{ fill: '#94A3B8', fontSize: 11 }}
          tickFormatter={(v) => `${v}%`}
        />
        <YAxis
          type="category"
          dataKey="nome"
          stroke="#94A3B8"
          tick={{ fill: '#94A3B8', fontSize: 11 }}
          width={80}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#111118',
            border: '1px solid #1E1E2E',
            borderRadius: '8px',
            color: '#F1F5F9',
          }}
          formatter={(value) => {
            const n = Number(value)
            return [`${n > 0 ? '+' : ''}${n}%`, 'Índice vs concorrente']
          }}
          labelFormatter={(_, payload) => {
            const item = payload?.[0]?.payload
            return item ? `${item.nomeCompleto} (${item.categoria})` : ''
          }}
          cursor={{ fill: '#1E1E2E', opacity: 0.4 }}
        />
        <Bar dataKey="indice" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, idx) => (
            <Cell key={`cell-${idx}`} fill={entry.indice > 0 ? '#EF4444' : '#10B981'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function truncate(str: string, max: number): string {
  return str.length > max ? `${str.slice(0, max - 1)}…` : str
}
