'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { ClienteComVendas } from '@/app/lib/queries/clientes'

const currency = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

export function TopClientesChart({ data }: { data: ClienteComVendas[] }) {
  const chartData = [...data]
    .map((c) => ({ nome: c.nome_cliente, receita: c.receitaTotal }))
    .reverse()

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 8, right: 24, left: 24, bottom: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" horizontal={false} />
        <XAxis type="number" stroke="#94A3B8" tick={{ fontSize: 11 }} tickFormatter={currency} />
        <YAxis
          type="category"
          dataKey="nome"
          stroke="#94A3B8"
          tick={{ fontSize: 12 }}
          width={140}
        />
        <Tooltip
          formatter={(v) => currency(Number(v) || 0)}
          contentStyle={{
            backgroundColor: '#111118',
            border: '1px solid #1E1E2E',
            borderRadius: 8,
            color: '#F1F5F9',
          }}
          cursor={{ fill: '#1E1E2E55' }}
        />
        <Bar dataKey="receita" fill="#10B981" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
