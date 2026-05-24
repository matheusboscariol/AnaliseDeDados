# Arquitetura — Ecommerce Dashboard

## Stack
- Next.js 16.2.6 (App Router) + React 19 + TypeScript
- Tailwind CSS 4 (tema escuro custom — ver design-system.md)
- @supabase/ssr + @supabase/supabase-js (client browser)
- Recharts (gráficos)

## Estrutura de Pastas

```
/app
  /components
    /ui                    # Componentes compartilhados (KPICard, ChartWrapper, etc.)
      KPICard.tsx
      SectionHeader.tsx
      ChartWrapper.tsx
      LoadingSpinner.tsx
      EmptyState.tsx
      index.ts             # Barrel export
  /dashboard
    page.tsx               # OWNER: lider — integração final (Task #8)
    /vendas
      page.tsx             # OWNER: vendas — Task #3
      components/          # Componentes específicos da seção
    /pricing
      page.tsx             # OWNER: pricing — Task #4
      components/
    /clientes
      page.tsx             # OWNER: clientes — Task #5
      components/
  /lib
    supabase.ts            # Cliente Supabase (browser) — createClient()
    /queries
      vendas.ts            # OWNER: vendas — queries da seção
      pricing.ts           # OWNER: pricing
      clientes.ts          # OWNER: clientes
/docs
  design-system.md         # Paleta, tipografia, tokens
  architecture.md          # Este arquivo
```

## Convenção de Ownership

Cada especialista é dono exclusivo dos arquivos de sua seção:

| Owner    | Arquivos                                                          |
|----------|-------------------------------------------------------------------|
| lider    | /app/components/ui/*, /app/lib/supabase.ts, /app/dashboard/page.tsx, /docs/* |
| vendas   | /app/dashboard/vendas/**, /app/lib/queries/vendas.ts              |
| pricing  | /app/dashboard/pricing/**, /app/lib/queries/pricing.ts            |
| clientes | /app/dashboard/clientes/**, /app/lib/queries/clientes.ts          |
| qa       | (lê tudo, não edita código de feature — abre tasks/comentários)    |
| docs     | /docs/** (exceto design-system.md e architecture.md que são do líder) |

## Regras

1. **Não cruzar fronteiras**: um especialista NÃO edita arquivos de outro. Se precisar de algo novo no design system, abre task para o líder.
2. **Imports**: use barrel `import { KPICard, ChartWrapper } from '@/app/components/ui'`.
3. **Cliente Supabase**: sempre via `import { createClient } from '@/app/lib/supabase'`. Nunca instanciar diretamente.
4. **Queries**: cada seção concentra suas queries em `/app/lib/queries/<secao>.ts` — funções tipadas que retornam dados prontos para o componente.
5. **Client Components**: páginas que usam Recharts ou hooks devem ter `'use client'` no topo.
6. **Tipagem**: tipos das tabelas vivem junto às queries (ou em arquivo dedicado se reusados).

## Tabelas Supabase (referência)

- `clientes` (35 rows): id, nome, segmento, cidade, estado, idade, etc.
- `produtos` (45 rows): id, nome, categoria, preco_custo, preco_venda, etc.
- `vendas` (80 rows, todas em 2025-12-13): id, cliente_id, produto_id, quantidade, preco_unitario, valor_total, canal (ecommerce | loja_física)
- `preco_competidores` (48 rows): produto_id, competidor, preco, data_coleta

RLS habilitado em todas; policies SELECT para anon já criadas na Fase 1.
