'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ReceitaPorHora } from '@/app/lib/queries/vendas'

const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
})

export function ReceitaPorHoraChart({ data }: { data: ReceitaPorHora[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
        <defs>
          <linearGradient id="gradReceitaHora" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366F1" stopOpacity={0.55} />
            <stop offset="100%" stopColor="#6366F1" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#1E1E2E" strokeDasharray="3 3" />
        <XAxis
          dataKey="hora"
          stroke="#475569"
          tick={{ fill: '#94A3B8', fontSize: 11 }}
        />
        <YAxis
          stroke="#475569"
          tick={{ fill: '#94A3B8', fontSize: 11 }}
          tickFormatter={(v: number) => formatadorMoeda.format(v)}
        />
        <Tooltip
          contentStyle={{
            background: '#111118',
            border: '1px solid #1E1E2E',
            borderRadius: 8,
            color: '#F1F5F9',
          }}
          formatter={(value, name) =>
            name === 'receita'
              ? [formatadorMoeda.format(Number(value)), 'Receita']
              : [String(value), 'Pedidos']
          }
        />
        <Area
          type="monotone"
          dataKey="receita"
          stroke="#6366F1"
          strokeWidth={2}
          fill="url(#gradReceitaHora)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
