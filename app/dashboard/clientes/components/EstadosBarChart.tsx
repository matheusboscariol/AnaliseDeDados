'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const PALETTE = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

interface EstadoDatum {
  estado: string
  clientes: number
}

export function EstadosBarChart({ data }: { data: EstadoDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" />
        <XAxis dataKey="estado" stroke="#94A3B8" tick={{ fontSize: 12 }} />
        <YAxis stroke="#94A3B8" tick={{ fontSize: 12 }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ backgroundColor: '#111118', border: '1px solid #1E1E2E', borderRadius: 8, color: '#F1F5F9' }}
          cursor={{ fill: '#1E1E2E55' }}
        />
        <Bar dataKey="clientes" radius={[6, 6, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
