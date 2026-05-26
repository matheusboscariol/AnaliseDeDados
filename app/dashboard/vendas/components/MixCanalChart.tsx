'use client'

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { FatiaCanal } from '@/app/lib/queries/vendas'

const CORES = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
})

function humanizarCanal(raw: string): string {
  if (!raw) return ''
  return raw
    .replace(/_/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

export function MixCanalChart({ data }: { data: FatiaCanal[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="receita"
          nameKey="canal"
          cx="50%"
          cy="50%"
          outerRadius={100}
          innerRadius={55}
          paddingAngle={2}
          label={(props: { name?: string; payload?: FatiaCanal }) => {
            const pct = props.payload?.percentual ?? 0
            return `${humanizarCanal(props.name ?? '')} ${pct.toFixed(0)}%`
          }}
          labelLine={false}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={CORES[i % CORES.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: '#111118',
            border: '1px solid #1E1E2E',
            borderRadius: 8,
            color: '#F1F5F9',
          }}
          formatter={(value) => formatadorMoeda.format(Number(value))}
        />
        <Legend
          wrapperStyle={{ color: '#94A3B8', fontSize: 12 }}
          iconType="circle"
          formatter={(value) => humanizarCanal(String(value))}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
