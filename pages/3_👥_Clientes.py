"""
Clientes & Comportamento — Analytics Ecommerce
"""
import streamlit as st
import pandas as pd
import plotly.express as px
from supabase import create_client

st.set_page_config(page_title="Clientes & Comportamento", page_icon="👥", layout="wide")

# ── helpers ──────────────────────────────────────────────────────────────────

@st.cache_resource
def get_supabase():
    url = st.secrets["SUPABASE_URL"]
    key = st.secrets["SUPABASE_KEY"]
    return create_client(url, key)


@st.cache_data(ttl=300, show_spinner="Carregando clientes…")
def fetch_clientes():
    supabase = get_supabase()

    clientes_resp = (
        supabase.table("clientes")
        .select("id_cliente, nome_cliente, estado, pais, data_cadastro")
        .execute()
    )
    vendas_resp = (
        supabase.table("vendas")
        .select("id_venda, id_cliente, canal_venda, quantidade, preco_unitario, produtos(categoria)")
        .execute()
    )

    clientes_raw = clientes_resp.data or []
    vendas_raw   = vendas_resp.data or []

    # agregar vendas por cliente
    venda_agg = {}
    for v in vendas_raw:
        cid = v.get("id_cliente")
        if not cid:
            continue
        entry = venda_agg.setdefault(cid, {"receita": 0, "pedidos": 0, "canais": [], "categorias": []})
        qtd   = v.get("quantidade") or 0
        preco = float(v.get("preco_unitario") or 0)
        entry["receita"]  += qtd * preco
        entry["pedidos"]  += 1
        canal = (v.get("canal_venda") or "").strip()
        if canal:
            entry["canais"].append(canal)
        cat = (v.get("produtos") or {}).get("categoria", "").strip()
        if cat:
            entry["categorias"].append(cat)

    records = []
    for c in clientes_raw:
        cid  = c["id_cliente"]
        agg  = venda_agg.get(cid, {"receita": 0, "pedidos": 0, "canais": [], "categorias": []})
        canais_count = {}
        for canal in agg["canais"]:
            canais_count[canal] = canais_count.get(canal, 0) + 1
        canal_pref = max(canais_count, key=canais_count.get) if canais_count else None

        records.append({
            "id_cliente":    cid,
            "nome_cliente":  c.get("nome_cliente"),
            "estado":        (c.get("estado") or "N/D").strip(),
            "pais":          c.get("pais"),
            "data_cadastro": c.get("data_cadastro"),
            "total_pedidos": agg["pedidos"],
            "receita_total": agg["receita"],
            "canal_preferido": canal_pref,
            "categorias":    sorted(set(agg["categorias"])),
        })

    return pd.DataFrame(records)


def fmt_brl(v: float) -> str:
    return f"R$ {v:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


# ── layout ───────────────────────────────────────────────────────────────────

st.markdown("### 👥 Clientes & Comportamento")
st.caption("Snapshot 13/12/2025")

df = fetch_clientes()

if df.empty:
    st.warning("Nenhum dado encontrado.")
    st.stop()

# KPIs
total_cad    = len(df)
ativos       = df[df["total_pedidos"] > 0]
total_ativos = len(ativos)
recompradores= int((ativos["total_pedidos"] > 1).sum())
taxa_recompra = (recompradores / total_ativos * 100) if total_ativos else 0
receita_sum  = ativos["receita_total"].sum()
ticket_medio = receita_sum / total_ativos if total_ativos else 0

k1, k2, k3, k4 = st.columns(4)
k1.metric("👤 Total Cadastrados", f"{total_cad}")
k2.metric("✅ Clientes Ativos",   f"{total_ativos}")
k3.metric("🔁 Taxa de Recompra",  f"{taxa_recompra:.1f}%")
k4.metric("💰 Ticket Médio/Cliente", fmt_brl(ticket_medio))

st.divider()

# ── row 1: distribuição por estado + canal preferido ─────────────────────────
c1, c2 = st.columns(2)

with c1:
    st.subheader("Distribuição por Estado")
    estados = (
        df.groupby("estado")
        .agg(clientes=("id_cliente", "count"), receita=("receita_total", "sum"))
        .reset_index()
        .sort_values("clientes", ascending=False)
    )
    fig_est = px.bar(
        estados.head(15).sort_values("clientes"),
        x="clientes", y="estado",
        orientation="h",
        color="receita",
        color_continuous_scale=["#1E1E40", "#6366F1"],
        labels={"clientes": "Clientes", "estado": "", "receita": "Receita (R$)"},
    )
    fig_est.update_layout(
        paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)",
        font_color="#94a3b8", xaxis=dict(gridcolor="#1E1E2E"),
        yaxis=dict(gridcolor="#1E1E2E"),
        coloraxis_colorbar=dict(title="Receita", tickfont=dict(color="#94a3b8")),
        height=380,
    )
    st.plotly_chart(fig_est, use_container_width=True)

with c2:
    st.subheader("Canal Preferido")
    canal_df = (
        df[df["canal_preferido"].notna()]
        .groupby("canal_preferido")
        .size()
        .reset_index(name="clientes")
        .rename(columns={"canal_preferido": "Canal"})
        .sort_values("clientes", ascending=False)
    )
    fig_canal = px.pie(
        canal_df, values="clientes", names="Canal",
        color_discrete_sequence=["#F59E0B", "#6366F1", "#10B981"],
        hole=0.45,
    )
    fig_canal.update_traces(textinfo="label+percent", textfont_size=12)
    fig_canal.update_layout(
        paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)",
        font_color="#94a3b8", legend=dict(font=dict(color="#94a3b8")),
        height=380,
    )
    st.plotly_chart(fig_canal, use_container_width=True)

# ── row 2: top clientes + categorias mais compradas ──────────────────────────
c3, c4 = st.columns(2)

with c3:
    st.subheader("Top 5 Clientes por Receita")
    top_cli = (
        ativos.nlargest(5, "receita_total")
        [["nome_cliente", "receita_total", "total_pedidos"]]
        .rename(columns={"nome_cliente": "Cliente", "receita_total": "Receita", "total_pedidos": "Pedidos"})
    )
    fig_cli = px.bar(
        top_cli.sort_values("Receita"), x="Receita", y="Cliente",
        orientation="h",
        color_discrete_sequence=["#F59E0B"],
        labels={"Receita": "Receita (R$)", "Cliente": ""},
    )
    fig_cli.update_layout(
        paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)",
        font_color="#94a3b8", xaxis=dict(gridcolor="#1E1E2E"),
        yaxis=dict(gridcolor="#1E1E2E"), height=320,
    )
    st.plotly_chart(fig_cli, use_container_width=True)

with c4:
    st.subheader("Categorias Mais Compradas")
    # flatten categorias de todos os clientes
    all_cats: list[str] = []
    for cats in df["categorias"]:
        all_cats.extend(cats)
    cat_counts = pd.Series(all_cats).value_counts().reset_index()
    cat_counts.columns = ["Categoria", "Clientes"]

    fig_cat2 = px.bar(
        cat_counts.sort_values("Clientes"), x="Clientes", y="Categoria",
        orientation="h",
        color_discrete_sequence=["#10B981"],
        labels={"Clientes": "Qtd. Clientes", "Categoria": ""},
    )
    fig_cat2.update_layout(
        paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)",
        font_color="#94a3b8", xaxis=dict(gridcolor="#1E1E2E"),
        yaxis=dict(gridcolor="#1E1E2E"), height=320,
    )
    st.plotly_chart(fig_cat2, use_container_width=True)

# ── tabela completa ───────────────────────────────────────────────────────────
with st.expander("Ver todos os clientes"):
    display = df[["nome_cliente", "estado", "total_pedidos", "receita_total", "canal_preferido"]].copy()
    display.columns = ["Cliente", "Estado", "Pedidos", "Receita (R$)", "Canal Preferido"]
    display["Receita (R$)"] = display["Receita (R$)"].apply(fmt_brl)
    st.dataframe(display, use_container_width=True, hide_index=True)

st.divider()
st.caption("Fonte: tabelas `clientes` e `vendas` · Supabase read-only")
