# KPIs e Fórmulas

Este documento é preenchido **incrementalmente** à medida que cada especialista (vendas, pricing, clientes) reporta a sua seção. Enquanto isso, registramos a estrutura e os KPIs candidatos esperados.

> Status: **aguardando notificação das seções `vendas`, `pricing` e `clientes`.**

## Convenções

- Moeda formatada como `R$ 50.169,43` (`pt-BR`, BRL).
- Percentuais com 1 casa decimal (`12,3%`).
- Datas no formato `dd/mm/aaaa`.
- Janela temporal: como **todas as vendas estão em 13/12/2025**, hoje os KPIs representam um snapshot pontual. Quando a base evoluir, revisitar.

---

## Seção Vendas & Receita

> _Pendente — `vendas` ainda não notificou. Estrutura esperada abaixo._

KPIs candidatos:

| KPI | Fórmula | Fonte |
|-----|---------|-------|
| Receita Total | Σ `quantidade × preco_unitario` | `vendas` |
| Ticket Médio | Receita Total ÷ nº de vendas | `vendas` |
| Itens Vendidos | Σ `quantidade` | `vendas` |
| Mix por Canal | Receita por `canal_venda` ÷ Receita Total | `vendas` |
| Top Produtos | Σ receita por `id_produto`, ordenado desc | `vendas` + `produtos` |
| Top Categorias | Σ receita por `categoria` | `vendas` + `produtos` |

Confirmar com `vendas` quando a seção estiver pronta.

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

> _Pendente — `clientes` ainda não notificou. Estrutura esperada abaixo._

KPIs candidatos:

| KPI | Fórmula | Fonte |
|-----|---------|-------|
| Base de Clientes | `count(distinct id_cliente)` em `clientes` | `clientes` |
| Clientes Ativos | `count(distinct id_cliente)` em `vendas` | `vendas` |
| Taxa de Ativação | Clientes Ativos ÷ Base de Clientes | ambos |
| LTV Médio | Receita Total ÷ Clientes Ativos | `vendas` |
| Distribuição por Estado | nº de clientes por `estado` | `clientes` |
| Receita por Estado | Σ receita por `estado` (via join) | `vendas` + `clientes` |

---

## Como cada especialista atualiza esta página

Ao concluir sua seção, envie mensagem para `docs` com:

1. Lista final de KPIs efetivamente implementados.
2. Fórmulas exatas (caso difira do candidato acima).
3. Caminho do arquivo da query (`/app/lib/queries/<secao>.ts`).

Eu (docs) substituo o bloco "_Pendente_" pela versão definitiva e marco a seção como concluída.
