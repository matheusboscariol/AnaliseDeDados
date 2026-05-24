# QA Findings

Registro dos achados reportados pelo agente `qa` (Task #6). Atualizado incrementalmente.

## Status: em andamento

Severidade:

- **Crítica**: bloqueia uso ou expõe risco de segurança.
- **Alta**: comportamento incorreto visível ao usuário.
- **Média**: degradação de UX, inconsistência visual ou de dados.
- **Baixa**: melhoria, polish, observação.

Status:

- **Aberto** — reportado, sem ação.
- **Em correção** — owner trabalhando.
- **Resolvido** — corrigido e confirmado pelo qa.
- **Wontfix** — descartado com justificativa.

## Achados

| # | Seção | Problema | Severidade | Owner | Status |
|---|-------|----------|------------|-------|--------|
| — | — | _(nenhum achado reportado até o momento)_ | — | — | — |

## Notas de contexto

- **Dados em uma única data**: todas as 80 vendas estão em 13/12/2025. Qualquer crítica do qa sobre "gráfico temporal vazio" é limitação de dados, não bug — registrar como **Baixa / Wontfix** salvo decisão contrária do líder.
- **Cobertura de concorrentes parcial**: 4 categorias sem `preco_competidores`. Pricing deve mostrar `EmptyState`, não zero.
- **RLS**: policies SELECT para `anon` já criadas pelo líder. Se qa relatar tabela "vazia no browser mas cheia no SQL editor", suspeitar de policy faltando antes de bug de código.
