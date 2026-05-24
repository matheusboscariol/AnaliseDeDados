'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS: Record<string, string> = {
  ecommerce: '#6366F1',
  loja_fisica: '#F59E0B',
  ambos: '#8B5CF6',
  sem_canal: '#475569',
}

interface CanalDatum {
  name: string
  value: number
  key: string
}

export function CanalPreferidoChart({ data }: { data: CanalDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          stroke="#0A0A0F"
        >
          {data.map((d) => (
            <Cell key={d.key} fill={COLORS[d.key] ?? '#06B6D4'} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ backgroundColor: '#111118', border: '1px solid #1E1E2E', borderRadius: 8, color: '#F1F5F9' }}
          formatter={(v: number, name) => [`${v} cliente(s)`, name]}
        />
        <Legend wrapperStyle={{ color: '#94A3B8', fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
