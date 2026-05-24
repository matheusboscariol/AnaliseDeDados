'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { CategoriaPrecoMedio } from '@/app/lib/queries/pricing'

interface Props {
  data: CategoriaPrecoMedio[]
}

const COLOR_PROPRIO = '#6366F1'
const COLOR_CONCORRENTE = '#94A3B8'
const COLOR_SEM_DADOS = '#475569'

export function CategoriaComparisonChart({ data }: Props) {
  const chartData = data.map((c) => ({
    categoria: c.categoria,
    Nosso: Math.round(c.precoMedioProprio),
    Concorrente: c.temConcorrente ? Math.round(c.precoMedioConcorrente ?? 0) : null,
    temConcorrente: c.temConcorrente,
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid stroke="#1E1E2E" vertical={false} />
        <XAxis
          dataKey="categoria"
          stroke="#94A3B8"
          tick={{ fill: '#94A3B8', fontSize: 12 }}
          tickLine={false}
        />
        <YAxis
          stroke="#94A3B8"
          tick={{ fill: '#94A3B8', fontSize: 12 }}
          tickLine={false}
          tickFormatter={(v) => `R$${v}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#111118',
            border: '1px solid #1E1E2E',
            borderRadius: '8px',
            color: '#F1F5F9',
          }}
          formatter={(value: number | null, name: string) => {
            if (value === null) return ['Sem concorrente', name]
            return [`R$ ${value.toLocaleString('pt-BR')}`, name]
          }}
          cursor={{ fill: '#1E1E2E', opacity: 0.4 }}
        />
        <Legend wrapperStyle={{ color: '#94A3B8', fontSize: 12 }} />
        <Bar dataKey="Nosso" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, idx) => (
            <Cell
              key={`nosso-${idx}`}
              fill={entry.temConcorrente ? COLOR_PROPRIO : COLOR_SEM_DADOS}
            />
          ))}
        </Bar>
        <Bar dataKey="Concorrente" fill={COLOR_CONCORRENTE} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
