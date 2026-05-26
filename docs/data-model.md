# Modelo de Dados — Guia para Queries

Este documento complementa [fase0-dados.md](./fase0-dados.md) com padrões práticos de query a serem usados em `/app/lib/queries/*.ts`.

## Cliente Supabase

Sempre via o helper em `/app/lib/supabase.ts`:

```ts
import { createClient } from '@/app/lib/supabase'

const supabase = createClient()
```

Nunca instanciar `createBrowserClient` direto nos componentes ou queries.

## Diagrama lógico

```
   clientes ─────────┐
                     │
                     ▼
                  vendas ◄──── produtos ───── preco_competidores
```

- `vendas` é a tabela "fato".
- `clientes` e `produtos` são as dimensões.
- `preco_competidores` é dimensão satélite de `produtos`.

## Tipos sugeridos (TypeScript)

Manter tipos próximos das queries da seção. Sugestão de base:

```ts
type Cliente = {
  id_cliente: string
  nome_cliente: string
  estado: string
  pais: string
  data_cadastro: string // ISO
}

type Produto = {
  id_produto: string
  nome_produto: string
  categoria: string
  marca: string
  preco: number
  data_cadastro: string
}

type Venda = {
  id_venda: string
  data_venda: string
  id_cliente: string
  id_produto: string
  canal_venda: 'ecommerce' | 'loja_fisica'
  quantidade: number
  preco_unitario: number
}

type PrecoCompetidor = {
  id: number
  id_produto: string
  nome_concorrente: string
  preco_concorrente: number
  data_coleta: string
}
```

## Padrões de query

### Listagem simples

```ts
const { data, error } = await supabase
  .from('vendas')
  .select('*')
```

### Join via embed (Postgrest)

```ts
const { data, error } = await supabase
  .from('vendas')
  .select(`
    id_venda,
    quantidade,
    preco_unitario,
    canal_venda,
    produtos:id_produto ( nome_produto, categoria, marca ),
    clientes:id_cliente ( nome_cliente, estado )
  `)
```

### Agregação no client

A base é pequena (80 vendas, 45 produtos, 35 clientes), então agregar em memória após o `SELECT` é aceitável e mantém o código simples:

```ts
const receitaPorCanal = vendas.reduce<Record<string, number>>((acc, v) => {
  acc[v.canal_venda] = (acc[v.canal_venda] ?? 0) + v.quantidade * v.preco_unitario
  return acc
}, {})
```

Se uma seção precisar de agregação SQL pesada, criar uma RPC no Supabase e abrir task para o líder.

## Convenções de retorno

Cada função em `/app/lib/queries/<secao>.ts` deve:

1. Importar `createClient` do helper.
2. Tratar `error` retornando `[]` ou estrutura vazia tipada (nunca lançar para o componente cru).
3. Retornar dados já no shape que o componente consome (pré-agregados quando aplicável).

Exemplo:

```ts
export async function getReceitaPorCategoria() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('vendas')
    .select('quantidade, preco_unitario, produtos:id_produto(categoria)')
  if (error || !data) return []
  // agregar e devolver [{ categoria, receita }]
}
```

## Limitações conhecidas dos dados

- Todas as vendas em **13/12/2025** — não construir gráficos de série temporal sobre `data_venda`.
- 4 categorias (Cozinha, Áudio, Esporte, Informática) **sem registro de competidor** — comparativos de pricing devem tratar `null`/ausência explicitamente.
- Base pequena: cuidado com KPIs ruidosos (ticket médio por estado com 1-3 vendas vira anedota, não tendência).
