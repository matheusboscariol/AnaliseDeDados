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
import type { TopProduto } from '@/app/lib/queries/vendas'

const CORES = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
})

export function TopProdutosChart({ data }: { data: TopProduto[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
      >
        <CartesianGrid stroke="#1E1E2E" horizontal={false} />
        <XAxis
          type="number"
          stroke="#475569"
          tick={{ fill: '#94A3B8', fontSize: 11 }}
          tickFormatter={(v: number) => formatadorMoeda.format(v)}
        />
        <YAxis
          type="category"
          dataKey="nome"
          stroke="#475569"
          tick={{ fill: '#94A3B8', fontSize: 11 }}
          width={140}
        />
        <Tooltip
          cursor={{ fill: 'rgba(99,102,241,0.08)' }}
          contentStyle={{
            background: '#111118',
            border: '1px solid #1E1E2E',
            borderRadius: 8,
            color: '#F1F5F9',
          }}
          formatter={(value) => formatadorMoeda.format(Number(value))}
        />
        <Bar dataKey="receita" radius={[0, 6, 6, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={CORES[i % CORES.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
