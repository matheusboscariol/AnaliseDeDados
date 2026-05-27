"""
Analytics Ecommerce — Hub
Snapshot 13/12/2025
"""
import streamlit as st

st.set_page_config(
    page_title="Analytics Ecommerce",
    page_icon="📈",
    layout="wide",
)

st.markdown(
    """
    <style>
    .card {
        background: #111118;
        border: 1px solid #1E1E2E;
        border-radius: 12px;
        padding: 24px;
        height: 100%;
        transition: border-color .2s;
    }
    .card:hover { border-color: #2A2A40; }
    .card-icon {
        width: 40px; height: 40px;
        border-radius: 8px;
        display: flex; align-items: center; justify-content: center;
        font-size: 13px; font-weight: 600;
        margin-bottom: 16px;
    }
    .card-title { font-size: 18px; font-weight: 600; color: #f1f5f9; margin-bottom: 8px; }
    .card-desc  { font-size: 13px; color: #94a3b8; margin-bottom: 16px; }
    .card-bullet { font-size: 12px; color: #64748b; margin-bottom: 4px; }
    .tag { font-size: 10px; font-weight: 500; color: #475569;
           text-transform: uppercase; letter-spacing: .08em; }
    </style>
    """,
    unsafe_allow_html=True,
)

# ---------- header ----------
st.markdown('<p class="tag">Snapshot 13/12/2025</p>', unsafe_allow_html=True)
st.title("Analytics Ecommerce")
st.markdown(
    '<p style="color:#94a3b8;font-size:14px;max-width:680px">'
    "Três visões executivas sobre a operação: receita do dia, "
    "posicionamento de preço contra o mercado e comportamento da base de clientes."
    "</p>",
    unsafe_allow_html=True,
)

st.divider()

# ---------- cards ----------
sections = [
    {
        "icon": "R$",
        "color": "#6366F1",
        "title": "Vendas & Receita",
        "desc": "Receita, ticket médio, mix de canal e top produtos do snapshot de 13/12/2025.",
        "bullets": ["80 vendas · R$ 50.169,43", "E-commerce vs. loja física", "Top categorias e produtos"],
        "page": "pages/1_📊_Vendas.py",
        "label": "Abrir Vendas →",
    },
    {
        "icon": "%",
        "color": "#10B981",
        "title": "Pricing & Margem",
        "desc": "Comparativo do nosso preço contra concorrentes, índice de competitividade e oportunidades de repricing.",
        "bullets": ["45 produtos · 48 preços de concorrentes", "Banda saudável: 0,95–1,05", "4 categorias sem dado de mercado"],
        "page": "pages/2_💰_Pricing.py",
        "label": "Abrir Pricing →",
    },
    {
        "icon": "Co",
        "color": "#F59E0B",
        "title": "Clientes & Comportamento",
        "desc": "Base de clientes, taxa de ativação, distribuição geográfica e LTV do dia.",
        "bullets": ["35 clientes cadastrados", "Distribuição por estado", "Canal preferido por cliente"],
        "page": "pages/3_👥_Clientes.py",
        "label": "Abrir Clientes →",
    },
]

col1, col2, col3 = st.columns(3)
cols = [col1, col2, col3]

for col, s in zip(cols, sections):
    with col:
        hex_bg = s["color"] + "1A"
        st.markdown(
            f"""
            <div class="card">
              <div class="card-icon" style="background:{hex_bg};color:{s['color']}">{s['icon']}</div>
              <div class="card-title">{s['title']}</div>
              <div class="card-desc">{s['desc']}</div>
              {''.join(f'<div class="card-bullet">· {b}</div>' for b in s['bullets'])}
            </div>
            """,
            unsafe_allow_html=True,
        )
        # Streamlit page link (works in multipage apps)
        st.page_link(s["page"], label=s["label"])

st.divider()
st.caption(
    "Fonte: Supabase (4 tabelas · read-only via anon key). "
    "Todas as vendas concentradas em 13/12/2025 — KPIs representam um snapshot pontual."
)
