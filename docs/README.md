# Dashboard de Ecommerce — Análise de Negócio

## O que é

Dashboard analítico para acompanhamento de vendas, pricing competitivo e comportamento de clientes de um ecommerce. Construído como projeto colaborativo multi-agente (Jornada de Dados — Projeto 2).

## Seções

- **Hub** (`/`): cards de entrada para as três visões executivas.
- **Vendas & Receita** (`/dashboard/vendas`): receita, ticket médio, mix por canal, top produtos e categorias.
- **Pricing & Margem** (`/dashboard/pricing`): comparação contra concorrentes, índice de competitividade, oportunidades de repricing.
- **Clientes & Comportamento** (`/dashboard/clientes`): base de clientes, ativação, distribuição geográfica, LTV.

## Stack

- Next.js 16.2.6 (App Router) + React 19 + TypeScript
- Tailwind CSS 4 (tema escuro custom)
- Recharts (gráficos)
- Supabase (`@supabase/ssr` + `@supabase/supabase-js`)

## Índice da documentação

| Documento | Conteúdo |
|-----------|----------|
| [setup.md](./setup.md) | Pré-requisitos, variáveis de ambiente, instalação e execução |
| [fase0-dados.md](./fase0-dados.md) | Esquema das tabelas Supabase, contagens e relacionamentos |
| [data-model.md](./data-model.md) | Modelo de dados detalhado e exemplos de queries |
| [kpis.md](./kpis.md) | KPIs por seção, fórmulas e interpretações |
| [components-guide.md](./components-guide.md) | Guia de uso dos componentes UI compartilhados |
| [qa-findings.md](./qa-findings.md) | Achados de QA e status de resolução |
| [design-system.md](./design-system.md) | Paleta, tipografia e tokens (mantido pelo líder) |
| [architecture.md](./architecture.md) | Estrutura de pastas e convenções (mantido pelo líder) |

## Como rodar

```bash
npm install
npm run dev
# abrir http://localhost:3000
```

Detalhes em [setup.md](./setup.md).
