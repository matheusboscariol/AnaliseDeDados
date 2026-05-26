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
| 1 | Vendas | Normalização de fuso em `calcularReceitaPorHora`: usar `Intl.DateTimeFormat` com `timeZone: 'America/Sao_Paulo'` para evitar deslocamento por fuso do browser. | Média | vendas | Resolvido |
| 2 | Vendas | Humanização do label/legenda no `MixCanalChart` (ex.: `loja_fisica` → `Loja Fisica`) para apresentação consistente. | Baixa | vendas | Resolvido |
| 3 | Vendas | Preencher horas sem venda na série (`receita: 0, pedidos: 0`) para o gráfico não “pular” intervalos. | Baixa | vendas | Resolvido |
| 4 | Vendas | KPI Unidades: quando não há pedidos, exibir `—` (em vez de `0.0 por pedido`). | Baixa | vendas | Resolvido |
| 5 | Vendas | Moeda: padronizar formatação (receita total com 2 casas como demais KPIs monetários). | Baixa | vendas | Resolvido |
| 6 | Clientes | Evitar divisão por zero no indicador de ativação (`totalCadastrados > 0` antes de dividir). | Média | clientes | Resolvido |
| 7 | Clientes | Empty state de categorias via componente `<EmptyState>` do design system. | Baixa | clientes | Resolvido |
| 8 | Docs | Padronizar docs para `loja_fisica` (sem cedilha) como valor de `canal_venda`. | Baixa | lider | Resolvido |

## Notas de contexto

- **Dados em uma única data**: todas as 80 vendas estão em 13/12/2025. Qualquer crítica do qa sobre "gráfico temporal vazio" é limitação de dados, não bug — registrar como **Baixa / Wontfix** salvo decisão contrária do líder.
- **Cobertura de concorrentes parcial**: 4 categorias sem `preco_competidores`. Pricing deve mostrar `EmptyState`, não zero.
- **RLS**: policies SELECT para `anon` já criadas pelo líder. Se qa relatar tabela "vazia no browser mas cheia no SQL editor", suspeitar de policy faltando antes de bug de código.
