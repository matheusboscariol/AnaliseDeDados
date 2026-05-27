"""
Pricing & Margem — Analytics Ecommerce
"""
import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from supabase import create_client

st.set_page_config(page_title="Pricing & Margem", page_icon="💰", layout="wide")

# ── helpers ──────────────────────────────────────────────────────────────────

@st.cache_resource
def get_supabase():
    url = st.secrets["SUPABASE_URL"]
    key = st.secrets["SUPABASE_KEY"]
    return create_client(url, key)


@st.cache_data(ttl=300, show_spinner="Carregando dados de pricing…")
def fetch_pricing():
    supabase = get_supabase()
    resp = (
        supabase.table("produtos")
        .select("id_produto, nome_produto, categoria, marca, preco, preco_competidores(nome_concorrente, preco_concorrente, data_coleta)")
        .execute()
    )
    rows = resp.data or []

    produtos = []
    indices  = []

    for p in rows:
        competidores = p.get("preco_competidores") or []
        preco_proprio = float(p.get("preco") or 0)
        precos_conc = [float(c.get("preco_concorrente") or 0) for c in competidores]
        preco_medio_conc = sum(precos_conc) / len(precos_conc) if precos_conc else None

        produtos.append({
            "id_produto":    p.get("id_produto"),
            "nome_produto":  p.get("nome_produto"),
            "categoria":     p.get("categoria"),
            "marca":         p.get("marca"),
            "preco":         preco_proprio,
            "n_concorrentes": len(competidores),
        })

        if preco_medio_conc and preco_medio_conc > 0:
            indice = (preco_proprio / preco_medio_conc - 1) * 100
            indices.append({
                "id_produto":           p.get("id_produto"),
                "nome_produto":         p.get("nome_produto"),
                "categoria":            p.get("categoria"),
                "preco":                preco_proprio,
                "preco_medio_concorrente": preco_medio_conc,
                "indice":               indice,
            })

    df_prod  = pd.DataFrame(produtos)
    df_ind   = pd.DataFrame(indices).sort_values("indice", ascending=False) if indices else pd.DataFrame()
    return df_prod, df_ind


def fmt_brl(v: float) -> str:
    return f"R$ {v:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


# ── layout ───────────────────────────────────────────────────────────────────

st.markdown("### 💰 Pricing & Margem")
st.caption("Snapshot 13/12/2025")

df_prod, df_ind = fetch_pricing()

if df_prod.empty:
    st.warning("Nenhum dado encontrado.")
    st.stop()

# KPIs
total_produtos    = len(df_prod)
com_concorrente   = int(df_prod["n_concorrentes"].gt(0).sum())
sem_concorrente   = total_produtos - com_concorrente
acima_mercado     = int((df_ind["indice"] > 0).sum()) if not df_ind.empty else 0
abaixo_mercado    = int((df_ind["indice"] < 0).sum()) if not df_ind.empty else 0

k1, k2, k3, k4, k5 = st.columns(5)
k1.metric("📦 Total Produtos",      f"{total_produtos}")
k2.metric("🔍 Com Concorrente",     f"{com_concorrente}")
k3.metric("❓ Sem Concorrente",     f"{sem_concorrente}")
k4.metric("📈 Acima do Mercado",    f"{acima_mercado}")
k5.metric("📉 Abaixo do Mercado",   f"{abaixo_mercado}")

st.divider()

# ── comparativo por categoria ────────────────────────────────────────────────
if not df_ind.empty:
    st.subheader("Comparativo Preço Médio por Categoria")

    cat_agg = (
        df_ind.groupby("categoria")
        .agg(preco_proprio=("preco", "mean"), preco_conc=("preco_medio_concorrente", "mean"))
        .reset_index()
        .rename(columns={"categoria": "Categoria", "preco_proprio": "Nosso Preço (R$)", "preco_conc": "Concorrente (R$)"})
        .sort_values("Categoria")
    )

    fig_cat = go.Figure()
    fig_cat.add_bar(
        name="Nosso Preço",
        x=cat_agg["Categoria"],
        y=cat_agg["Nosso Preço (R$)"],
        marker_color="#6366F1",
    )
    fig_cat.add_bar(
        name="Concorrente",
        x=cat_agg["Categoria"],
        y=cat_agg["Concorrente (R$)"],
        marker_color="#10B981",
    )
    fig_cat.update_layout(
        barmode="group",
        paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)",
        font_color="#94a3b8", xaxis=dict(gridcolor="#1E1E2E"),
        yaxis=dict(gridcolor="#1E1E2E", title="Preço (R$)"),
        legend=dict(font=dict(color="#94a3b8")),
        height=380,
    )
    st.plotly_chart(fig_cat, use_container_width=True)

    st.divider()

    # ── índice de competitividade ────────────────────────────────────────────
    st.subheader("Índice de Competitividade por Produto")
    st.caption("Positivo = nosso preço ACIMA do concorrente · Negativo = ABAIXO")

    df_ind_plot = df_ind.copy()
    df_ind_plot["cor"] = df_ind_plot["indice"].apply(
        lambda v: "#EF4444" if v > 5 else ("#F59E0B" if v > 0 else "#10B981")
    )
    df_ind_plot["indice_fmt"] = df_ind_plot["indice"].apply(lambda v: f"{v:+.1f}%")

    fig_ind = px.bar(
        df_ind_plot.sort_values("indice"),
        x="indice", y="nome_produto",
        orientation="h",
        color="cor",
        color_discrete_map="identity",
        hover_data={"preco": True, "preco_medio_concorrente": True, "cor": False},
        labels={
            "indice": "Índice (%)",
            "nome_produto": "",
            "preco": "Nosso Preço (R$)",
            "preco_medio_concorrente": "Preço Médio Concorrente (R$)",
        },
    )
    # banda saudável ±5 %
    fig_ind.add_vline(x=5,  line_dash="dot", line_color="#475569", annotation_text="+5%",  annotation_font_color="#475569")
    fig_ind.add_vline(x=-5, line_dash="dot", line_color="#475569", annotation_text="-5%",  annotation_font_color="#475569")
    fig_ind.add_vline(x=0,  line_dash="solid", line_color="#334155")
    fig_ind.update_layout(
        paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)",
        font_color="#94a3b8", xaxis=dict(gridcolor="#1E1E2E"),
        yaxis=dict(gridcolor="#1E1E2E"), showlegend=False,
        height=max(400, len(df_ind_plot) * 24),
    )
    st.plotly_chart(fig_ind, use_container_width=True)

    st.divider()

    # ── oportunidades ────────────────────────────────────────────────────────
    col_risco, col_upside = st.columns(2)

    with col_risco:
        st.subheader("⚠️ Risco: preço muito acima")
        risco = df_ind[df_ind["indice"] > 15].sort_values("indice", ascending=False)
        if risco.empty:
            st.info("Nenhum produto acima de +15% do mercado.")
        else:
            st.dataframe(
                risco[["nome_produto", "preco", "preco_medio_concorrente", "indice"]]
                .rename(columns={
                    "nome_produto": "Produto",
                    "preco": "Nosso Preço (R$)",
                    "preco_medio_concorrente": "Médio Conc. (R$)",
                    "indice": "Índice (%)",
                }),
                use_container_width=True,
                hide_index=True,
            )

    with col_upside:
        st.subheader("🎯 Upside: espaço para subir preço")
        upside = df_ind[df_ind["indice"] < -15].sort_values("indice")
        if upside.empty:
            st.info("Nenhum produto abaixo de -15% do mercado.")
        else:
            st.dataframe(
                upside[["nome_produto", "preco", "preco_medio_concorrente", "indice"]]
                .rename(columns={
                    "nome_produto": "Produto",
                    "preco": "Nosso Preço (R$)",
                    "preco_medio_concorrente": "Médio Conc. (R$)",
                    "indice": "Índice (%)",
                }),
                use_container_width=True,
                hide_index=True,
            )

else:
    st.info("Sem dados de preço de concorrentes para calcular índice.")

# categorias sem concorrente
cats_sem = df_prod[df_prod["n_concorrentes"] == 0]["categoria"].unique().tolist()
if cats_sem:
    st.warning(f"Categorias sem dado de concorrente: **{', '.join(cats_sem)}**")

st.divider()
st.caption("Fonte: tabelas `produtos` e `preco_competidores` · Supabase read-only")
