'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS: Record<string, string> = {
  ecommerce: '#6366F1',
  loja_fisica: '#F59E0B',
}
const FALLBACK = ['#8B5CF6', '#06B6D4', '#10B981', '#EF4444']

const LABELS: Record<string, string> = {
  ecommerce: 'E-commerce',
  loja_fisica: 'Loja Física',
}

interface CanalDatum {
  canal: string
  clientes: number
}

export function CanalPreferidoChart({ data }: { data: CanalDatum[] }) {
  const chartData = data.map((d) => ({
    name: LABELS[d.canal] ?? d.canal,
    value: d.clientes,
    key: d.canal,
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          stroke="#0A0A0F"
        >
          {chartData.map((d, i) => (
            <Cell key={d.key} fill={COLORS[d.key] ?? FALLBACK[i % FALLBACK.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#111118',
            border: '1px solid #1E1E2E',
            borderRadius: 8,
            color: '#F1F5F9',
          }}
          formatter={(v, name) => [`${Number(v) || 0} cliente(s)`, name]}
        />
        <Legend wrapperStyle={{ color: '#94A3B8', fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
