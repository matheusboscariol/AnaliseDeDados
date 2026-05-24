# Guia de Componentes UI

Componentes compartilhados em `/app/components/ui/`. Sempre importar via barrel:

```tsx
import {
  KPICard,
  SectionHeader,
  ChartWrapper,
  LoadingSpinner,
  EmptyState,
} from '@/app/components/ui'
```

Para tokens visuais (paleta, tipografia, classes Tailwind padrão), ver [design-system.md](./design-system.md).

---

## `SectionHeader`

Cabeçalho padrão no topo de cada página de seção.

**Props**

| Prop | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| `title` | `string` | sim | Título principal (H1) |
| `description` | `string` | não | Subtítulo curto |

**Exemplo**

```tsx
<SectionHeader
  title="Vendas & Receita"
  description="Acompanhamento de receita, ticket médio e mix de canal"
/>
```

---

## `KPICard`

Card de KPI com label, valor principal, sub-texto opcional e indicador de tendência.

**Props**

| Prop | Tipo | Obrigatório | Default | Descrição |
|------|------|-------------|---------|-----------|
| `label` | `string` | sim | — | Rótulo em caixa alta |
| `value` | `string \| number` | sim | — | Valor principal (já formatado) |
| `sub` | `string` | não | — | Texto secundário (período, comparação) |
| `trend` | `'up' \| 'down' \| 'neutral'` | não | — | Seta colorida |
| `color` | `string` | não | `#6366F1` | Cor de acento (reservada para uso futuro) |

**Exemplo**

```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  <KPICard
    label="Receita Total"
    value="R$ 50.169"
    sub="13/12/2025"
    trend="up"
  />
  <KPICard
    label="Ticket Médio"
    value="R$ 627"
  />
</div>
```

Formatar números **antes** de passar para `value` (`toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })`).

---

## `ChartWrapper`

Container padronizado para gráficos Recharts.

**Props**

| Prop | Tipo | Obrigatório | Default | Descrição |
|------|------|-------------|---------|-----------|
| `title` | `string` | sim | — | Título do gráfico (caixa alta) |
| `children` | `ReactNode` | sim | — | Geralmente um `ResponsiveContainer` |
| `height` | `number` | não | `300` | Altura em px |

**Exemplo**

```tsx
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

<ChartWrapper title="Receita por Categoria">
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={dados}>
      <XAxis dataKey="categoria" stroke="#94A3B8" />
      <YAxis stroke="#94A3B8" />
      <Tooltip
        contentStyle={{ background: '#111118', border: '1px solid #1E1E2E' }}
      />
      <Bar dataKey="receita" fill="#6366F1" />
    </BarChart>
  </ResponsiveContainer>
</ChartWrapper>
```

Use a paleta de cores definida no design system para `fill`/`stroke`.

---

## `LoadingSpinner`

Spinner centralizado. Sem props.

**Exemplo**

```tsx
if (loading) return <LoadingSpinner />
```

---

## `EmptyState`

Mensagem discreta para listas/gráficos vazios.

**Props**

| Prop | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| `message` | `string` | sim | Texto exibido |

**Exemplo**

```tsx
{dados.length === 0 ? (
  <EmptyState message="Sem dados de concorrentes para esta categoria" />
) : (
  <ChartWrapper title="...">...</ChartWrapper>
)}
```

Útil para categorias sem cobertura em `preco_competidores` (Cozinha, Áudio, Esporte, Informática).

---

## Receita de página de seção

Esqueleto recomendado para `/app/dashboard/<secao>/page.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'
import {
  SectionHeader,
  KPICard,
  ChartWrapper,
  LoadingSpinner,
  EmptyState,
} from '@/app/components/ui'
// import das queries da seção

export default function Page() {
  const [loading, setLoading] = useState(true)
  const [dados, setDados] = useState<...>(...)

  useEffect(() => {
    // chamar queries, setDados, setLoading(false)
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <main className="bg-[#0A0A0F] min-h-screen p-6">
      <SectionHeader title="..." description="..." />
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* KPICards */}
      </section>
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ChartWrappers */}
      </section>
    </main>
  )
}
```

`'use client'` é obrigatório quando a página usa Recharts, hooks ou `createClient()` no browser.

---

## Quando pedir componente novo

Se a sua seção precisa de algo que não está coberto (ex.: tabela paginada, badge de status, filtro), **não crie em `/app/components/ui/`** — abrir task para o líder. Cada especialista cria componentes próprios em `/app/dashboard/<secao>/components/`.
