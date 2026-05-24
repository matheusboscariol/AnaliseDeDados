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
import type { ReceitaPorCategoria } from '@/app/lib/queries/vendas'

const CORES = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
})

export function ReceitaPorCategoriaChart({
  data,
}: {
  data: ReceitaPorCategoria[]
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid stroke="#1E1E2E" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="categoria"
          stroke="#475569"
          tick={{ fill: '#94A3B8', fontSize: 11 }}
          interval={0}
          angle={-15}
          textAnchor="end"
          height={60}
        />
        <YAxis
          stroke="#475569"
          tick={{ fill: '#94A3B8', fontSize: 11 }}
          tickFormatter={(v: number) => formatadorMoeda.format(v)}
        />
        <Tooltip
          cursor={{ fill: 'rgba(99,102,241,0.08)' }}
          contentStyle={{
            background: '#111118',
            border: '1px solid #1E1E2E',
            borderRadius: 8,
            color: '#F1F5F9',
          }}
          formatter={(value: number) => formatadorMoeda.format(value)}
        />
        <Bar dataKey="receita" radius={[6, 6, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={CORES[i % CORES.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
