# KPIs e Fórmulas

Este documento é preenchido **incrementalmente** à medida que cada especialista (vendas, pricing, clientes) reporta a sua seção. Enquanto isso, registramos a estrutura e os KPIs candidatos esperados.

> Status: **Vendas e Clientes concluídas.** Pricing aguardando notificação.

## Convenções

- Moeda formatada como `R$ 50.169,43` (`pt-BR`, BRL).
- Percentuais com 1 casa decimal (`12,3%`).
- Datas no formato `dd/mm/aaaa`.
- Janela temporal: como **todas as vendas estão em 13/12/2025**, hoje os KPIs representam um snapshot pontual. Quando a base evoluir, revisitar.

---

## Seção Vendas & Receita

Página: `app/dashboard/vendas/page.tsx` (Client Component — fetch via `useEffect`, agregações via `useMemo`).
Queries e cálculos puros: `app/lib/queries/vendas.ts`.

### KPIs (cards)

| KPI | Fórmula | Função | Formatação |
|-----|---------|--------|------------|
| Receita Total | Σ `quantidade × Number(preco_unitario)` | `calcularResumo` | BRL, 0 casas |
| Ticket Médio | Receita Total ÷ nº de pedidos | `calcularResumo` | BRL, 2 casas |
| Unidades Vendidas | Σ `quantidade` | `calcularResumo` | inteiro `pt-BR` (sub: unidades/pedido) |
| Total de Pedidos | `vendas.length` | `calcularResumo` | inteiro `pt-BR` (sub: canal líder e %) |

### Gráficos

| Gráfico | Fórmula | Função | Notas |
|---------|---------|--------|-------|
| Mix de Canal | Receita e pedidos por `canal_venda`, com `percentual = receita ÷ total` | `calcularMixCanal` | Ordenado por receita desc; canais `null` viram `'desconhecido'` |
| Curva de Vendas por Hora | Receita e pedidos agrupados por `new Date(data_venda).getHours()` | `calcularReceitaPorHora` | Válido **só** porque todas as vendas são de 13/12/2025 — não usar como série diária/mensal |
| Top 5 Produtos por Receita | Σ receita por `produtos.nome_produto` (fallback `id_produto`), top 5 | `calcularTopProdutos` | Join via `select('...produtos(nome_produto, categoria)')` |
| Receita por Categoria | Σ receita por `produtos.categoria` | `calcularReceitaPorCategoria` | `null` → `'sem categoria'`; conjunto pode diferir do de `preco_competidores` (relevante para Pricing) |

### Insight de rodapé

Calculado direto na página: hora de pico (máximo de `receita` em `calcularReceitaPorHora`) e produto líder (primeiro item de `calcularTopProdutos`).

### Detalhes de implementação

- `preco_unitario` é convertido com `Number(...)` antes do cálculo para evitar concatenação de string (o Supabase pode retornar `numeric` como string).
- Receita unitária por venda: `valorVenda(v) = (quantidade ?? 0) × Number(preco_unitario ?? 0)`.
- Fonte única: `fetchVendasComProdutos` (uma query com embed em `produtos`); todas as agregações são puras sobre o array retornado.
- Estados vazios: cada `ChartWrapper` cai em `<EmptyState />` quando a agregação retorna `[]`; a página inteira mostra `<LoadingSpinner />` enquanto `rows === null`.

---

## Seção Pricing & Margem

> _Pendente — `pricing` ainda não notificou. Estrutura esperada abaixo._

KPIs candidatos:

| KPI | Fórmula | Fonte |
|-----|---------|-------|
| Índice de Competitividade | `preco` ÷ média(`preco_concorrente`) por produto | `produtos` + `preco_competidores` |
| Produtos Acima do Mercado | nº de produtos com índice > 1,05 | idem |
| Produtos Abaixo do Mercado | nº de produtos com índice < 0,95 | idem |
| Oportunidades de Repricing | produtos com índice fora da banda [0,95; 1,05] | idem |
| Cobertura de Concorrente | nº de produtos com ≥1 registro em `preco_competidores` ÷ total de produtos | idem |

**Atenção**: categorias Cozinha, Áudio, Esporte e Informática não têm dados de concorrente — sinalizar "sem dado" em vez de zerar.

---

## Seção Clientes & Comportamento

Página: `app/dashboard/clientes/page.tsx` (Client Component — 2 fetches paralelos no `useEffect`, agregações em `useMemo`).
Queries e cálculos puros: `app/lib/queries/clientes.ts`.

### KPIs (cards superiores)

| KPI | Fórmula | Função | Formatação |
|-----|---------|--------|------------|
| Clientes Cadastrados | `clientes.length` | `calcularResumoClientes` | inteiro |
| Clientes Ativos | nº de clientes com `totalPedidos > 0` | `calcularResumoClientes` | inteiro (sub: dormentes = cadastrados − ativos) |
| Taxa de Recompra | nº de ativos com `totalPedidos > 1` ÷ ativos × 100 | `calcularResumoClientes` | percentual, 1 casa |
| Ticket Médio por Cliente | Σ receita dos ativos ÷ nº de ativos | `calcularResumoClientes` | BRL, 0 casas |

> **Ressalva crítica**: "Taxa de Recompra" aqui significa **2+ pedidos no mesmo dia 13/12/2025** — não retorno em datas distintas. Quando a base ganhar histórico temporal, redefinir.

### Gráficos e tabela

| Visão | Fórmula | Função | Notas |
|-------|---------|--------|-------|
| Top 5 Clientes por Receita | Filtra ativos, ordena por `receitaTotal` desc, top 5 | `calcularTopClientes` | Barras horizontais |
| Distribuição por Estado (Top 10) | nº de clientes e receita por `estado` (trim, `null` → `'N/D'`) | `calcularDistribuicaoEstados` | Top 10 explícito + agregado `'Outros'` quando há resto |
| Canal Preferido | Conta clientes por `canalPreferido` (canal com mais pedidos do cliente) | `calcularCanalPreferido` | Pie: ecommerce vs loja_fisica |
| Categorias Mais Compradas | Σ `quantidade` e Σ `receita` por `produtos.categoria` em vendas | `fetchCategoriasMaisCompradas` | Tabela com barra relativa de unidades; fetch independente |

> **Ressalva crítica**: a distribuição por estado tem base pequena (35 clientes em ~20 UFs, média ~1,75 por UF). Ler como **mapa de presença**, não como tamanho de mercado.

### Insights extras (cards inferiores)

| Card | Definição |
|------|-----------|
| Cliente Mais Antigo Ativo | Ativo (com `data_cadastro`) de menor `data_cadastro` |
| Cliente Mais Novo Ativo | Ativo (com `data_cadastro`) de maior `data_cadastro` |

Mostram nome, data formatada `dd/mm/aaaa` e UF.

### Detalhes de implementação

- `fetchClientesComVendas` faz **2 fetches em paralelo** (`Promise.all`: `clientes` + `vendas` com embed em `produtos`) e cruza em memória — para cada cliente devolve `totalPedidos`, `receitaTotal`, `canalPreferido` e lista de `categoriasCompradas`.
- `valorVenda` igual ao da seção Vendas: `(quantidade ?? 0) × Number(preco_unitario ?? 0)`.
- `canalPreferido` é o canal com mais pedidos do cliente (empate → primeiro encontrado, `null` se não houver pedidos).
- Categorias do cliente formam um `Set` ordenado.
- Loading: enquanto `clientes` ou `categorias` for `null`, página inteira renderiza `<LoadingSpinner />`.

---

## Como cada especialista atualiza esta página

Ao concluir sua seção, envie mensagem para `docs` com:

1. Lista final de KPIs efetivamente implementados.
2. Fórmulas exatas (caso difira do candidato acima).
3. Caminho do arquivo da query (`/app/lib/queries/<secao>.ts`).

Eu (docs) substituo o bloco "_Pendente_" pela versão definitiva e marco a seção como concluída.
