# Setup do Projeto

## Pré-requisitos

- Node.js 18+ (recomendado 20+)
- npm (vem com o Node) ou pnpm/yarn equivalente
- Acesso ao projeto Supabase `nmehophblsjjpcgreqzl`

## Variáveis de ambiente

Criar `.env.local` na raiz do projeto:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://nmehophblsjjpcgreqzl.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<sua_chave_publishable>
```

A chave publishable pode ser obtida em **Supabase → Project Settings → API Keys → publishable key**. Nunca commitar `.env.local` (já está no `.gitignore`).

## Instalação

```bash
npm install
```

Dependências principais instaladas:

| Pacote | Versão |
|--------|--------|
| next | 16.2.6 |
| react / react-dom | 19.2.4 |
| @supabase/ssr | ^0.10.3 |
| @supabase/supabase-js | ^2.106.1 |
| recharts | ^3.8.1 |
| tailwindcss | ^4 |
| typescript | ^5 |

## Scripts disponíveis

```bash
npm run dev      # Next dev server (http://localhost:3000)
npm run build    # build de produção
npm run start    # serve o build de produção
npm run lint     # ESLint
```

## Rotas principais

| Rota | Conteúdo |
|------|----------|
| `/dashboard` | Visão consolidada (integração final — Task #8) |
| `/dashboard/vendas` | Seção Vendas & Receita |
| `/dashboard/pricing` | Seção Pricing & Margem |
| `/dashboard/clientes` | Seção Clientes & Comportamento |

## Validação rápida

Após `npm run dev`, abra http://localhost:3000/dashboard. Se a página carregar sem erro de "Missing Supabase env vars", o `.env.local` está OK.

Se aparecerem erros de RLS (linhas em branco apesar de a query rodar), conferir [fase0-dados.md](./fase0-dados.md) — todas as policies SELECT para `anon` já foram criadas pelo líder na Fase 1.
