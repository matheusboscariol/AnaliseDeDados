"""
Vendas & Receita — Analytics Ecommerce
"""
import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from supabase import create_client

st.set_page_config(page_title="Vendas & Receita", page_icon="📊", layout="wide")

# ── helpers ──────────────────────────────────────────────────────────────────

@st.cache_resource
def get_supabase():
    url = st.secrets["SUPABASE_URL"]
    key = st.secrets["SUPABASE_KEY"]
    return create_client(url, key)


@st.cache_data(ttl=300, show_spinner="Carregando vendas…")
def fetch_vendas():
    supabase = get_supabase()
    resp = (
        supabase.table("vendas")
        .select("id_venda, data_venda, id_cliente, id_produto, canal_venda, quantidade, preco_unitario, produtos(nome_produto, categoria)")
        .order("data_venda")
        .execute()
    )
    rows = resp.data or []
    records = []
    for r in rows:
        prod = r.get("produtos") or {}
        records.append({
            "id_venda":       r.get("id_venda"),
            "data_venda":     r.get("data_venda"),
            "canal_venda":    r.get("canal_venda") or "desconhecido",
            "quantidade":     r.get("quantidade") or 0,
            "preco_unitario": float(r.get("preco_unitario") or 0),
            "nome_produto":   prod.get("nome_produto") or r.get("id_produto") or "desconhecido",
            "categoria":      prod.get("categoria") or "sem categoria",
        })
    df = pd.DataFrame(records)
    if not df.empty:
        df["valor_total"] = df["quantidade"] * df["preco_unitario"]
        df["data_venda"]  = pd.to_datetime(df["data_venda"], utc=True, errors="coerce")
        df["hora"]        = df["data_venda"].dt.tz_convert("America/Sao_Paulo").dt.hour
    return df


def fmt_brl(v: float) -> str:
    return f"R$ {v:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


# ── layout ───────────────────────────────────────────────────────────────────

st.markdown("### 📊 Vendas & Receita")
st.caption("Snapshot 13/12/2025")

df = fetch_vendas()

if df.empty:
    st.warning("Nenhum dado encontrado.")
    st.stop()

# KPIs
receita_total    = df["valor_total"].sum()
total_pedidos    = len(df)
ticket_medio     = receita_total / total_pedidos if total_pedidos else 0
unidades_total   = df["quantidade"].sum()

k1, k2, k3, k4 = st.columns(4)
k1.metric("💰 Receita Total",     fmt_brl(receita_total))
k2.metric("🧾 Total de Pedidos",  f"{total_pedidos}")
k3.metric("🎯 Ticket Médio",      fmt_brl(ticket_medio))
k4.metric("📦 Unidades Vendidas", f"{int(unidades_total)}")

st.divider()

# ── row 1: mix canal + receita por hora ─────────────────────────────────────
c1, c2 = st.columns(2)

with c1:
    st.subheader("Mix de Canal")
    mix = (
        df.groupby("canal_venda")["valor_total"]
        .sum()
        .reset_index()
        .rename(columns={"canal_venda": "Canal", "valor_total": "Receita"})
        .sort_values("Receita", ascending=False)
    )
    fig_mix = px.pie(
        mix, values="Receita", names="Canal",
        color_discrete_sequence=["#6366F1", "#10B981", "#F59E0B"],
        hole=0.45,
    )
    fig_mix.update_traces(textinfo="label+percent", textfont_size=12)
    fig_mix.update_layout(
        paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)",
        font_color="#94a3b8", showlegend=True,
        legend=dict(font=dict(color="#94a3b8")),
        height=320,
    )
    st.plotly_chart(fig_mix, use_container_width=True)

with c2:
    st.subheader("Receita por Hora (SP)")
    hora_df = (
        df.groupby("hora")["valor_total"]
        .sum()
        .reset_index()
        .rename(columns={"hora": "Hora", "valor_total": "Receita"})
        .sort_values("Hora")
    )
    hora_df["Hora_label"] = hora_df["Hora"].apply(lambda h: f"{int(h):02d}h")
    fig_hora = px.area(
        hora_df, x="Hora_label", y="Receita",
        color_discrete_sequence=["#6366F1"],
        labels={"Hora_label": "Hora", "Receita": "Receita (R$)"},
    )
    fig_hora.update_traces(line_color="#6366F1", fillcolor="rgba(99,102,241,0.15)")
    fig_hora.update_layout(
        paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)",
        font_color="#94a3b8", xaxis=dict(gridcolor="#1E1E2E"),
        yaxis=dict(gridcolor="#1E1E2E"), height=320,
    )
    st.plotly_chart(fig_hora, use_container_width=True)

# ── row 2: top produtos + receita por categoria ──────────────────────────────
c3, c4 = st.columns(2)

with c3:
    st.subheader("Top 5 Produtos por Receita")
    top_prod = (
        df.groupby("nome_produto")["valor_total"]
        .sum()
        .reset_index()
        .nlargest(5, "valor_total")
        .rename(columns={"nome_produto": "Produto", "valor_total": "Receita"})
    )
    fig_top = px.bar(
        top_prod.sort_values("Receita"), x="Receita", y="Produto",
        orientation="h",
        color_discrete_sequence=["#6366F1"],
        labels={"Receita": "Receita (R$)", "Produto": ""},
    )
    fig_top.update_layout(
        paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)",
        font_color="#94a3b8", xaxis=dict(gridcolor="#1E1E2E"),
        yaxis=dict(gridcolor="#1E1E2E"), height=320,
    )
    st.plotly_chart(fig_top, use_container_width=True)

with c4:
    st.subheader("Receita por Categoria")
    cat_df = (
        df.groupby("categoria")["valor_total"]
        .sum()
        .reset_index()
        .rename(columns={"categoria": "Categoria", "valor_total": "Receita"})
        .sort_values("Receita", ascending=False)
    )
    fig_cat = px.bar(
        cat_df.sort_values("Receita"), x="Receita", y="Categoria",
        orientation="h",
        color_discrete_sequence=["#10B981"],
        labels={"Receita": "Receita (R$)", "Categoria": ""},
    )
    fig_cat.update_layout(
        paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)",
        font_color="#94a3b8", xaxis=dict(gridcolor="#1E1E2E"),
        yaxis=dict(gridcolor="#1E1E2E"), height=320,
    )
    st.plotly_chart(fig_cat, use_container_width=True)

st.divider()
st.caption("Fonte: tabelas `vendas` e `produtos` · Supabase read-only")
