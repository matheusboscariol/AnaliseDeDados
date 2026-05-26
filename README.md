# Analytics Ecommerce

Dashboard analítico de um ecommerce: receita do dia, posicionamento de preço contra o mercado e comportamento da base de clientes. Projeto 2 da Jornada de Dados (Trilha Claude Code), construído como colaboração multi-agente.

## Stack

- Next.js 16.2.6 (App Router) + React 19 + TypeScript
- Tailwind CSS 4 (tema escuro custom)
- Recharts (gráficos)
- Supabase (`@supabase/ssr` + `@supabase/supabase-js`, read-only via anon key)

## Seções

- **Hub** (`/`): cards de entrada para as três visões executivas.
- **Vendas & Receita** (`/dashboard/vendas`): receita total, ticket médio, mix por canal, top produtos e categorias.
- **Pricing & Margem** (`/dashboard/pricing`): índice de competitividade vs. concorrentes e oportunidades de repricing.
- **Clientes & Comportamento** (`/dashboard/clientes`): base ativa, taxa de ativação, distribuição geográfica, LTV.

## Como rodar

```bash
npm install
npm run dev
# abrir http://localhost:3000
```

Setup completo (variáveis de ambiente, validação) em [docs/setup.md](./docs/setup.md).

## Documentação

Ponto de partida: [docs/README.md](./docs/README.md) — índice de toda a documentação técnica (setup, modelo de dados, KPIs, componentes, arquitetura, QA).
