#!/usr/bin/env python3
"""
gerar_dashboard.py
Lê data/dados_ecommerce.xlsx → calcula KPIs → salva kpis/*.json → gera dashboard.html
"""

import json
from datetime import datetime
from pathlib import Path

import pandas as pd

DATA_FILE = Path("data/dados_ecommerce.xlsx")
KPI_DIR   = Path("kpis")
OUTPUT    = Path("dashboard.html")
DS_CSS    = Path("_design_system/colors_and_type.css")


# ── Helpers ────────────────────────────────────────────────

def fmt_brl(v: float) -> str:
    return "R$ " + f"{v:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")

def save_kpi(name: str, data) -> None:
    KPI_DIR.mkdir(exist_ok=True)
    (KPI_DIR / f"{name}.json").write_text(
        json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8"
    )

def load_css() -> str:
    text = DS_CSS.read_text(encoding="utf-8")
    return "\n".join(l for l in text.splitlines() if not l.startswith("@import"))


# ── Carregamento de dados ──────────────────────────────────

def load_data() -> dict:
    xl = pd.ExcelFile(DATA_FILE)
    return {s: xl.parse(s) for s in xl.sheet_names}


# ── Cálculo de KPIs ────────────────────────────────────────

def compute_kpis(dfs: dict) -> dict:
    vendas      = dfs["vendas"].copy()
    clientes    = dfs["clientes"].copy()
    produtos    = dfs["produtos"].copy()
    comp_prices = dfs["preco_competidores"].copy()

    vendas["receita"] = vendas["quantidade"] * vendas["preco_unitario"]
    receita_total     = vendas["receita"].sum()

    # Join enriquecido sem conflito de colunas
    v = (
        vendas
        .merge(clientes[["id_cliente", "nome_cliente", "estado"]], on="id_cliente", how="left")
        .merge(produtos[["id_produto", "nome_produto", "categoria", "marca", "preco"]], on="id_produto", how="left")
    )

    kpis: dict = {}

    # 1. Visão geral
    vg = {
        "receita_total":     round(receita_total, 2),
        "receita_total_fmt": fmt_brl(receita_total),
        "total_pedidos":     len(vendas),
        "clientes_ativos":   int(vendas["id_cliente"].nunique()),
        "ticket_medio":      round(receita_total / len(vendas), 2),
        "ticket_medio_fmt":  fmt_brl(receita_total / len(vendas)),
        "produtos_vendidos": int(vendas["id_produto"].nunique()),
        "qtd_total":         int(vendas["quantidade"].sum()),
    }
    save_kpi("visao_geral", vg)
    kpis["visao_geral"] = vg

    # 2. Por canal
    cg = (
        vendas.groupby("canal_venda")
        .agg(receita=("receita", "sum"), pedidos=("id_venda", "count"), qtd=("quantidade", "sum"))
        .reset_index().sort_values("receita", ascending=False)
    )
    canal = [{
        "canal":            r["canal_venda"],
        "receita":          round(r["receita"], 2),
        "receita_fmt":      fmt_brl(r["receita"]),
        "pedidos":          int(r["pedidos"]),
        "qtd":              int(r["qtd"]),
        "participacao_pct": round(r["receita"] / receita_total * 100, 1),
    } for _, r in cg.iterrows()]
    save_kpi("por_canal", canal)
    kpis["por_canal"] = canal

    # 3. Por categoria
    cat_g = (
        v.groupby("categoria")
        .agg(receita=("receita", "sum"), pedidos=("id_venda", "count"), qtd=("quantidade", "sum"))
        .reset_index().sort_values("receita", ascending=False)
    )
    categoria = [{
        "categoria":        r["categoria"],
        "receita":          round(r["receita"], 2),
        "receita_fmt":      fmt_brl(r["receita"]),
        "pedidos":          int(r["pedidos"]),
        "qtd":              int(r["qtd"]),
        "ticket_medio_fmt": fmt_brl(r["receita"] / r["pedidos"]),
    } for _, r in cat_g.iterrows()]
    save_kpi("por_categoria", categoria)
    kpis["por_categoria"] = categoria

    # 4. Top 10 produtos
    pg = (
        v.groupby(["id_produto", "nome_produto", "categoria", "marca"])
        .agg(receita=("receita", "sum"), pedidos=("id_venda", "count"), qtd=("quantidade", "sum"))
        .reset_index().sort_values("receita", ascending=False).head(10)
    )
    top_produtos = [{
        "nome_produto": r["nome_produto"],
        "categoria":    r["categoria"],
        "marca":        r["marca"],
        "receita":      round(r["receita"], 2),
        "receita_fmt":  fmt_brl(r["receita"]),
        "pedidos":      int(r["pedidos"]),
        "qtd":          int(r["qtd"]),
    } for _, r in pg.iterrows()]
    save_kpi("top_produtos", top_produtos)
    kpis["top_produtos"] = top_produtos

    # 5. Por estado
    eg = (
        v.groupby("estado")
        .agg(receita=("receita", "sum"), pedidos=("id_venda", "count"), clientes=("id_cliente", "nunique"))
        .reset_index().sort_values("receita", ascending=False)
    )
    por_estado = [{
        "estado":           r["estado"],
        "receita":          round(r["receita"], 2),
        "receita_fmt":      fmt_brl(r["receita"]),
        "pedidos":          int(r["pedidos"]),
        "clientes":         int(r["clientes"]),
        "ticket_medio_fmt": fmt_brl(r["receita"] / r["pedidos"]),
    } for _, r in eg.iterrows()]
    save_kpi("por_estado", por_estado)
    kpis["por_estado"] = por_estado

    # 6. Competitividade
    comp = (
        produtos[["id_produto", "nome_produto", "categoria", "marca", "preco"]]
        .merge(comp_prices, on="id_produto", how="inner")
    )
    comp["dif_pct"] = ((comp["preco"] - comp["preco_concorrente"]) / comp["preco_concorrente"] * 100).round(1)
    comp["posicao"] = comp["dif_pct"].apply(
        lambda d: "mais_caro" if d > 1 else ("mais_barato" if d < -1 else "similar")
    )
    competitividade = [{
        "nome_produto":          r["nome_produto"],
        "categoria":             r["categoria"],
        "marca":                 r["marca"],
        "preco_produto":         round(r["preco"], 2),
        "preco_produto_fmt":     fmt_brl(r["preco"]),
        "nome_concorrente":      r["nome_concorrente"],
        "preco_concorrente":     round(r["preco_concorrente"], 2),
        "preco_concorrente_fmt": fmt_brl(r["preco_concorrente"]),
        "dif_pct":               float(r["dif_pct"]),
        "posicao":               r["posicao"],
    } for _, r in comp.sort_values(["nome_produto", "nome_concorrente"]).iterrows()]
    save_kpi("competitividade", competitividade)
    kpis["competitividade"] = competitividade

    # 7. Top 10 clientes
    clg = (
        v.groupby(["id_cliente", "nome_cliente", "estado"])
        .agg(receita=("receita", "sum"), pedidos=("id_venda", "count"))
        .reset_index().sort_values("receita", ascending=False).head(10)
    )
    top_clientes = [{
        "nome_cliente": r["nome_cliente"],
        "estado":       r["estado"],
        "receita":      round(r["receita"], 2),
        "receita_fmt":  fmt_brl(r["receita"]),
        "pedidos":      int(r["pedidos"]),
    } for _, r in clg.iterrows()]
    save_kpi("top_clientes", top_clientes)
    kpis["top_clientes"] = top_clientes

    # 8. Por período (mês)
    vendas["data_venda"] = pd.to_datetime(vendas["data_venda"])
    vendas["mes"] = vendas["data_venda"].dt.to_period("M").astype(str)
    perg = (
        vendas.groupby("mes")
        .agg(receita=("receita", "sum"), pedidos=("id_venda", "count"))
        .reset_index().sort_values("mes")
    )
    por_periodo = [{
        "mes":     r["mes"],
        "receita": round(r["receita"], 2),
        "pedidos": int(r["pedidos"]),
    } for _, r in perg.iterrows()]
    save_kpi("por_periodo", por_periodo)
    kpis["por_periodo"] = por_periodo

    return kpis


# ── Renderização HTML ──────────────────────────────────────

def render_html(kpis: dict, css: str) -> str:
    vg       = kpis["visao_geral"]
    canal    = kpis["por_canal"]
    cat      = kpis["por_categoria"]
    top_prod = kpis["top_produtos"]
    estados  = kpis["por_estado"]
    comp     = kpis["competitividade"]
    top_cli  = kpis["top_clientes"]
    periodo  = kpis["por_periodo"]

    now = datetime.now().strftime("%d/%m/%Y às %H:%M")

    # JSON para Chart.js (pré-computado para não conflitar com f-strings)
    js_canal_labels  = json.dumps([c["canal"].replace("_", " ").title() for c in canal], ensure_ascii=False)
    js_canal_receita = json.dumps([c["receita"] for c in canal])
    js_cat_labels    = json.dumps([c["categoria"] for c in cat], ensure_ascii=False)
    js_cat_receita   = json.dumps([c["receita"] for c in cat])
    js_per_labels    = json.dumps([p["mes"] for p in periodo])
    js_per_receita   = json.dumps([p["receita"] for p in periodo])

    # ── Linhas de tabelas ──────────────────────────────────

    prod_rows = "".join(f"""
              <tr>
                <td><span class="rank">{"0" + str(i+1) if i < 9 else str(i+1)}</span></td>
                <td class="td-primary">{p["nome_produto"]}</td>
                <td><span class="cat-badge">{p["categoria"]}</span></td>
                <td class="td-muted">{p["marca"]}</td>
                <td class="td-right">{p["pedidos"]}</td>
                <td class="td-right">{p["qtd"]}</td>
                <td class="td-right td-mono td-primary">{p["receita_fmt"]}</td>
              </tr>"""
        for i, p in enumerate(top_prod))

    estado_rows = "".join(f"""
              <tr>
                <td class="td-mono" style="font-weight:600;color:var(--text-primary)">{e["estado"]}</td>
                <td class="td-right">{e["clientes"]}</td>
                <td class="td-right">{e["pedidos"]}</td>
                <td class="td-right td-mono">{e["ticket_medio_fmt"]}</td>
                <td class="td-right td-mono td-primary">{e["receita_fmt"]}</td>
              </tr>"""
        for e in estados)

    def comp_badge(c):
        if c["posicao"] == "mais_caro":
            return f'<span class="badge badge--caro">&#8593; +{c["dif_pct"]:.1f}%</span>'
        if c["posicao"] == "mais_barato":
            return f'<span class="badge badge--barato">&#8595; {c["dif_pct"]:.1f}%</span>'
        return f'<span class="badge badge--similar">&#8776; {c["dif_pct"]:.1f}%</span>'

    comp_rows = "".join(f"""
              <tr>
                <td class="td-primary" style="font-weight:500">{c["nome_produto"]}</td>
                <td><span class="cat-badge">{c["categoria"]}</span></td>
                <td class="td-mono">{c["preco_produto_fmt"]}</td>
                <td class="td-muted">{c["nome_concorrente"]}</td>
                <td class="td-mono">{c["preco_concorrente_fmt"]}</td>
                <td>{comp_badge(c)}</td>
              </tr>"""
        for c in comp)

    cli_rows = "".join(f"""
              <tr>
                <td><span class="rank">{"0" + str(i+1) if i < 9 else str(i+1)}</span></td>
                <td class="td-primary" style="font-weight:500">{c["nome_cliente"]}</td>
                <td class="td-mono">{c["estado"]}</td>
                <td class="td-right">{c["pedidos"]}</td>
                <td class="td-right td-mono td-primary">{c["receita_fmt"]}</td>
              </tr>"""
        for i, c in enumerate(top_cli))

    canal_cards = "".join(f"""
          <div class="canal-card">
            <div class="eyebrow" style="margin-bottom:14px">{c["canal"].replace("_"," ").title()}</div>
            <div class="canal-num">{c["receita_fmt"]}</div>
            <div style="display:flex;gap:20px;margin-top:14px;flex-wrap:wrap">
              <span class="caption">{c["participacao_pct"]:.1f}% da receita</span>
              <span class="caption">{c["pedidos"]} pedidos</span>
              <span class="caption">{c["qtd"]} unidades</span>
            </div>
          </div>"""
        for c in canal)

    cat_rows = "".join(f"""
              <tr>
                <td class="td-primary" style="font-weight:500">{c["categoria"]}</td>
                <td class="td-right">{c["pedidos"]}</td>
                <td class="td-right">{c["qtd"]}</td>
                <td class="td-right td-mono">{c["ticket_medio_fmt"]}</td>
                <td class="td-right td-mono td-primary">{c["receita_fmt"]}</td>
              </tr>"""
        for c in cat)

    # ── Template HTML ──────────────────────────────────────

    return f"""<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Dashboard E-commerce — MSB</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600&family=Geist:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js"></script>
  <style>
{css}

/* ── Dashboard layout ──────────────────────────── */
*, *::before, *::after {{ box-sizing: border-box; }}

.container {{
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--container-px-desktop);
}}
@media (max-width: 768px) {{
  .container {{ padding: 0 var(--container-px-mobile); }}
}}

.section {{
  padding: var(--section-py-desktop) 0;
}}
.section--alt {{
  background: var(--bg-secondary);
}}
@media (max-width: 768px) {{
  .section {{ padding: var(--section-py-mobile) 0; }}
}}

.section-header {{ margin-bottom: 40px; }}
.section-header h2 {{
  font-size: var(--fs-h2);
  font-weight: var(--fw-semibold);
  letter-spacing: var(--ls-snug);
  margin: 8px 0 0;
  color: var(--text-primary);
}}
.section-header p.body-lg {{
  margin: 8px 0 0;
}}

/* ── Grid helpers ──────────────────────────────── */
.grid-2 {{ display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start; }}
.grid-3 {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }}
.grid-4 {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }}
@media (max-width: 900px) {{
  .grid-2, .grid-3, .grid-4 {{ grid-template-columns: 1fr 1fr; }}
}}
@media (max-width: 600px) {{
  .grid-2, .grid-3, .grid-4 {{ grid-template-columns: 1fr; }}
}}

/* ── Stat card (padrão stats.html) ─────────────── */
.stat-card {{
  padding: 20px 0 20px 20px;
  border-left: 1px solid var(--border-subtle);
}}
.stat-card .num {{
  font-family: var(--font-mono);
  font-size: clamp(1.8rem, 4vw, 2.75rem);
  font-weight: var(--fw-semibold);
  line-height: 1;
  letter-spacing: -0.02em;
  background: linear-gradient(180deg, #F5F6F8 0%, #3B82F6 160%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 24px rgba(59,130,246,0.25);
}}
.stat-card .lbl {{
  font-size: var(--fs-caption);
  color: var(--text-secondary);
  margin-top: 10px;
  line-height: 1.45;
}}

/* ── Canal card ────────────────────────────────── */
.canal-card {{
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 24px;
  transition: border-color var(--dur-base) var(--ease);
}}
.canal-card:hover {{
  border-color: var(--accent-mid);
  box-shadow: var(--shadow-card-hover);
}}
.canal-num {{
  font-family: var(--font-mono);
  font-size: clamp(1.4rem, 3vw, 2rem);
  font-weight: var(--fw-semibold);
  line-height: 1;
  background: linear-gradient(180deg, #F5F6F8 0%, #3B82F6 160%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}}

/* ── Data table ────────────────────────────────── */
.table-wrap {{ overflow-x: auto; border-radius: var(--radius-lg); border: 1px solid var(--border-subtle); }}
.data-table {{
  width: 100%;
  border-collapse: collapse;
  font-size: var(--fs-small);
}}
.data-table th {{
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  text-align: left;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-subtle);
  white-space: nowrap;
  background: var(--bg-secondary);
}}
.data-table td {{
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  vertical-align: middle;
}}
.data-table tbody tr:last-child td {{ border-bottom: none; }}
.data-table tbody tr:hover td {{
  background: var(--bg-tertiary);
  transition: background var(--dur-fast) var(--ease);
}}
.td-right  {{ text-align: right; }}
.td-mono   {{ font-family: var(--font-mono); font-size: 13px; }}
.td-muted  {{ color: var(--text-muted); }}
.td-primary {{ color: var(--text-primary) !important; }}

/* ── Badges ────────────────────────────────────── */
.badge {{
  display: inline-block;
  padding: 3px 8px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-family: var(--font-mono);
  font-weight: var(--fw-medium);
  white-space: nowrap;
}}
.badge--caro    {{ background: rgba(239,68,68,0.12);  color: #F87171; }}
.badge--barato  {{ background: rgba(16,185,129,0.12); color: #34D399; }}
.badge--similar {{ background: rgba(113,116,126,0.12); color: var(--text-muted); }}
.cat-badge {{
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 11px;
  background: var(--accent-subtle);
  color: var(--accent-bright);
  border: 1px solid rgba(37,99,235,0.2);
  white-space: nowrap;
}}

/* ── Rank number ───────────────────────────────── */
.rank {{
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
  font-weight: var(--fw-medium);
}}

/* ── Header ────────────────────────────────────── */
.dash-header {{
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-subtle);
  padding: 28px 0;
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(12px);
}}
.dash-logo {{
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: var(--fw-medium);
  color: var(--text-muted);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 6px;
}}
.dash-title {{
  font-size: var(--fs-h2);
  font-weight: var(--fw-semibold);
  letter-spacing: -0.02em;
  color: var(--text-primary);
  margin: 0 0 4px;
}}
.dash-meta {{
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
}}

/* ── Hero grid background ──────────────────────── */
.hero-bg {{
  background-image:
    linear-gradient(var(--grid-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
  background-size: var(--grid-size) var(--grid-size);
}}

/* ── Chart wrapper ─────────────────────────────── */
.chart-wrap {{
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 24px;
}}

/* ── Footer ────────────────────────────────────── */
.dash-footer {{
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-subtle);
  padding: 24px 0;
}}
.dash-footer .inner {{
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
}}
  </style>
</head>
<body>

  <!-- ── Header ──────────────────────────────────── -->
  <header class="dash-header">
    <div class="container">
      <div class="dash-logo">MSB · Matheus Boscariol Consultoria</div>
      <h1 class="dash-title">Dashboard de E-commerce</h1>
      <div class="dash-meta">Gerado em {now} &nbsp;·&nbsp; Fonte: dados_ecommerce.xlsx</div>
    </div>
  </header>

  <!-- ── 1. Visão Geral ──────────────────────────── -->
  <section class="section hero-bg">
    <div class="container">
      <div class="section-header">
        <p class="eyebrow">01 · Visão Geral</p>
        <h2>Resumo do período</h2>
        <p class="body-lg">{len(kpis["por_periodo"])} meses analisados &nbsp;·&nbsp; {vg["total_pedidos"]} pedidos registrados</p>
      </div>
      <div class="grid-4">
        <div class="stat-card">
          <div class="num">{vg["receita_total_fmt"]}</div>
          <div class="lbl">Receita total</div>
        </div>
        <div class="stat-card">
          <div class="num">{vg["total_pedidos"]}</div>
          <div class="lbl">Total de pedidos</div>
        </div>
        <div class="stat-card">
          <div class="num">{vg["clientes_ativos"]}</div>
          <div class="lbl">Clientes ativos</div>
        </div>
        <div class="stat-card">
          <div class="num">{vg["ticket_medio_fmt"]}</div>
          <div class="lbl">Ticket médio por pedido</div>
        </div>
      </div>
      <div class="grid-2" style="margin-top:20px;max-width:600px">
        <div class="stat-card">
          <div class="num">{vg["produtos_vendidos"]}</div>
          <div class="lbl">SKUs com vendas</div>
        </div>
        <div class="stat-card">
          <div class="num">{vg["qtd_total"]}</div>
          <div class="lbl">Unidades vendidas</div>
        </div>
      </div>
    </div>
  </section>

  <!-- ── 2. Canais de Venda ──────────────────────── -->
  <section class="section section--alt">
    <div class="container">
      <div class="section-header">
        <p class="eyebrow">02 · Canais de Venda</p>
        <h2>Distribuição por canal</h2>
      </div>
      <div class="grid-2">
        <div style="display:flex;flex-direction:column;gap:16px">
          {canal_cards}
        </div>
        <div class="chart-wrap">
          <canvas id="canal-chart" height="280"></canvas>
        </div>
      </div>
    </div>
  </section>

  <!-- ── 3. Categorias ───────────────────────────── -->
  <section class="section">
    <div class="container">
      <div class="section-header">
        <p class="eyebrow">03 · Categorias</p>
        <h2>Receita por categoria de produto</h2>
      </div>
      <div class="grid-2" style="align-items:start;gap:32px">
        <div class="chart-wrap">
          <canvas id="cat-chart" height="360"></canvas>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Categoria</th>
                <th class="td-right">Pedidos</th>
                <th class="td-right">Unid.</th>
                <th class="td-right">Ticket médio</th>
                <th class="td-right">Receita</th>
              </tr>
            </thead>
            <tbody>{cat_rows}</tbody>
          </table>
        </div>
      </div>
    </div>
  </section>

  <!-- ── 4. Top 10 Produtos ──────────────────────── -->
  <section class="section section--alt">
    <div class="container">
      <div class="section-header">
        <p class="eyebrow">04 · Top 10 Produtos</p>
        <h2>Melhores produtos por receita</h2>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Produto</th>
              <th>Categoria</th>
              <th>Marca</th>
              <th class="td-right">Pedidos</th>
              <th class="td-right">Unid.</th>
              <th class="td-right">Receita</th>
            </tr>
          </thead>
          <tbody>{prod_rows}</tbody>
        </table>
      </div>
    </div>
  </section>

  <!-- ── 5. Distribuição Geográfica ─────────────── -->
  <section class="section">
    <div class="container">
      <div class="section-header">
        <p class="eyebrow">05 · Distribuição Geográfica</p>
        <h2>Receita por estado</h2>
        <p class="body-lg">{len(estados)} estados com vendas registradas</p>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Estado</th>
              <th class="td-right">Clientes</th>
              <th class="td-right">Pedidos</th>
              <th class="td-right">Ticket médio</th>
              <th class="td-right">Receita</th>
            </tr>
          </thead>
          <tbody>{estado_rows}</tbody>
        </table>
      </div>
    </div>
  </section>

  <!-- ── 6. Análise Competitiva ──────────────────── -->
  <section class="section section--alt">
    <div class="container">
      <div class="section-header">
        <p class="eyebrow">06 · Análise Competitiva</p>
        <h2>Posicionamento de preço vs. concorrentes</h2>
        <p class="body-lg">12 produtos com dados de 4 concorrentes (Mercado Livre, Amazon, Magalu, Shopee)</p>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Categoria</th>
              <th>Nosso Preço</th>
              <th>Concorrente</th>
              <th>Preço Concorrente</th>
              <th>Posição</th>
            </tr>
          </thead>
          <tbody>{comp_rows}</tbody>
        </table>
      </div>
    </div>
  </section>

  <!-- ── 7. Top 10 Clientes ──────────────────────── -->
  <section class="section">
    <div class="container">
      <div class="section-header">
        <p class="eyebrow">07 · Top 10 Clientes</p>
        <h2>Maiores compradores por receita</h2>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Cliente</th>
              <th>Estado</th>
              <th class="td-right">Pedidos</th>
              <th class="td-right">Receita</th>
            </tr>
          </thead>
          <tbody>{cli_rows}</tbody>
        </table>
      </div>
    </div>
  </section>

  <!-- ── 8. Evolução Temporal ────────────────────── -->
  <section class="section section--alt">
    <div class="container">
      <div class="section-header">
        <p class="eyebrow">08 · Evolução Temporal</p>
        <h2>Receita mensal</h2>
        <p class="body-lg">{periodo[0]["mes"]} até {periodo[-1]["mes"]}</p>
      </div>
      <div class="chart-wrap">
        <canvas id="periodo-chart" height="200"></canvas>
      </div>
    </div>
  </section>

  <!-- ── Footer ──────────────────────────────────── -->
  <footer class="dash-footer">
    <div class="container">
      <div class="inner">
        <span>MSB · Matheus Boscariol Consultoria</span>
        <span>Dashboard gerado em {now}</span>
        <span>dados_ecommerce.xlsx &nbsp;·&nbsp; {vg["total_pedidos"]} registros</span>
      </div>
    </div>
  </footer>

  <script>
    Chart.defaults.color = '#A1A4AE';
    Chart.defaults.borderColor = 'rgba(255,255,255,0.05)';
    Chart.defaults.font.family = "'Geist Mono', monospace";
    Chart.defaults.font.size = 11;

    // ── Canal (doughnut) ──────────────────────────
    new Chart(document.getElementById('canal-chart'), {{
      type: 'doughnut',
      data: {{
        labels: {js_canal_labels},
        datasets: [{{
          data: {js_canal_receita},
          backgroundColor: ['#2563EB', '#1E3A8A'],
          borderColor: '#11131A',
          borderWidth: 3,
          hoverOffset: 6
        }}]
      }},
      options: {{
        cutout: '60%',
        plugins: {{
          legend: {{
            position: 'bottom',
            labels: {{
              color: '#A1A4AE',
              padding: 20,
              usePointStyle: true,
              pointStyleWidth: 8
            }}
          }},
          tooltip: {{
            callbacks: {{
              label: function(ctx) {{
                const val = ctx.raw.toLocaleString('pt-BR', {{minimumFractionDigits:2, maximumFractionDigits:2}});
                return ' R$ ' + val;
              }}
            }}
          }}
        }}
      }}
    }});

    // ── Categorias (horizontal bar) ───────────────
    new Chart(document.getElementById('cat-chart'), {{
      type: 'bar',
      data: {{
        labels: {js_cat_labels},
        datasets: [{{
          data: {js_cat_receita},
          backgroundColor: 'rgba(37,99,235,0.7)',
          borderColor: '#2563EB',
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false
        }}]
      }},
      options: {{
        indexAxis: 'y',
        plugins: {{ legend: {{ display: false }} }},
        scales: {{
          x: {{
            grid: {{ color: 'rgba(255,255,255,0.04)' }},
            ticks: {{
              color: '#71747E',
              callback: function(v) {{ return 'R$ ' + (v/1000).toFixed(0) + 'k'; }}
            }}
          }},
          y: {{
            grid: {{ display: false }},
            ticks: {{ color: '#A1A4AE' }}
          }}
        }}
      }}
    }});

    // ── Evolução temporal (linha) ─────────────────
    (function() {{
      const ctx = document.getElementById('periodo-chart');
      const grad = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
      grad.addColorStop(0, 'rgba(37,99,235,0.25)');
      grad.addColorStop(1, 'rgba(37,99,235,0)');
      new Chart(ctx, {{
        type: 'line',
        data: {{
          labels: {js_per_labels},
          datasets: [{{
            label: 'Receita',
            data: {js_per_receita},
            borderColor: '#60A5FA',
            backgroundColor: grad,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#2563EB',
            pointBorderColor: '#0A0B0F',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7
          }}]
        }},
        options: {{
          plugins: {{
            legend: {{ display: false }},
            tooltip: {{
              callbacks: {{
                label: function(ctx) {{
                  const val = ctx.raw.toLocaleString('pt-BR', {{minimumFractionDigits:2, maximumFractionDigits:2}});
                  return ' R$ ' + val;
                }}
              }}
            }}
          }},
          scales: {{
            x: {{
              grid: {{ color: 'rgba(255,255,255,0.04)' }},
              ticks: {{ color: '#71747E' }}
            }},
            y: {{
              grid: {{ color: 'rgba(255,255,255,0.04)' }},
              ticks: {{
                color: '#71747E',
                callback: function(v) {{ return 'R$ ' + (v/1000).toFixed(0) + 'k'; }}
              }}
            }}
          }}
        }}
      }});
    }})();
  </script>
</body>
</html>"""


# ── Main ───────────────────────────────────────────────────

def main():
    print("Carregando dados...")
    dfs = load_data()
    for name, df in dfs.items():
        print(f"  {name}: {len(df)} linhas x {len(df.columns)} colunas")

    print("\nCalculando KPIs...")
    kpis = compute_kpis(dfs)
    print(f"  KPIs salvos em kpis/ ({len(kpis)} blocos)")

    print("\nGerando dashboard.html...")
    css = load_css()
    html = render_html(kpis, css)
    OUTPUT.write_text(html, encoding="utf-8")
    print(f"  Gerado: {OUTPUT} ({OUTPUT.stat().st_size // 1024} KB)")

    print("\nConcluido. Para abrir: open dashboard.html")


if __name__ == "__main__":
    main()
