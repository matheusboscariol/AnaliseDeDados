# Fase 0 — Verificação de Dados

## Conexão

- **MCP Supabase**: `nmehophblsjjpcgreqzl.supabase.co`
- **.env.local**:
  - `NEXT_PUBLIC_SUPABASE_URL` — OK
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — OK

## Esquema das tabelas

### `clientes` (35 linhas)

| Coluna | Tipo |
|--------|------|
| id_cliente | text (PK) |
| nome_cliente | text |
| estado | text |
| pais | text |
| data_cadastro | timestamptz |

Cadastros de 2022-12 a 2025-05. Estados com mais clientes: AM, MG e CE (3 clientes cada).

### `produtos` (45 linhas)

| Coluna | Tipo |
|--------|------|
| id_produto | text (PK) |
| nome_produto | text |
| categoria | text |
| marca | text |
| preco | numeric |
| data_cadastro | timestamptz |

10 categorias: Eletrônicos (8), Moda (7), Casa (7), Acessórios (7), Games (5), Beleza (3), Cozinha/Áudio/Esporte/Informática (2 cada).

### `vendas` (80 linhas)

| Coluna | Tipo |
|--------|------|
| id_venda | text (PK) |
| data_venda | timestamptz |
| id_cliente | text (FK → clientes) |
| id_produto | text (FK → produtos) |
| canal_venda | text |
| quantidade | integer |
| preco_unitario | numeric |

**Alerta**: todas as 80 vendas estão na mesma data (13/12/2025). Não há série temporal — gráficos de evolução diária/mensal ficam degenerados.

Resumo:
- Receita total: R$ 50.169,43
- Canal `ecommerce`: 47 vendas / R$ 28.805
- Canal `loja_física`: 33 vendas / R$ 21.363

### `preco_competidores` (48 linhas)

| Coluna | Tipo |
|--------|------|
| id | bigint (PK) |
| id_produto | text (FK → produtos) |
| nome_concorrente | text |
| preco_concorrente | numeric |
| data_coleta | timestamptz |

**Cobertura parcial**: categorias Cozinha, Áudio, Esporte e Informática não têm registros de concorrente. Pricing deve sinalizar "sem dado" em vez de zerar a comparação.

## Relacionamentos

```
vendas.id_cliente            → clientes.id_cliente
vendas.id_produto            → produtos.id_produto
preco_competidores.id_produto → produtos.id_produto
```

## Alertas de segurança

- RLS habilitado em todas as tabelas; inicialmente **sem policies**, o que zerava qualquer SELECT pelo cliente anônimo.
- **Resolvido na Fase 1**: o líder criou policies `SELECT` para o papel `anon` em `clientes`, `produtos`, `vendas` e `preco_competidores`. Sem isso, o dashboard renderiza vazio mesmo com chave válida.
- Nenhuma policy de `INSERT`/`UPDATE`/`DELETE` foi adicionada — o dashboard é read-only.
