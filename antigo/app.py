import csv
import io

import pandas as pd
import streamlit as st

from limpeza import diagnosticar, limpar, total_erros, validar, REGIOES_VALIDAS, STATUS_VALIDOS


# ─────────────────────────────────────────────
# Helpers de I/O
# ─────────────────────────────────────────────

def ler_csv(file) -> list[dict]:
    content = file.read().decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(content), delimiter=";")
    return list(reader)


def rows_to_df(rows: list[dict]) -> pd.DataFrame:
    return pd.DataFrame(rows)


def df_to_csv_bytes(df: pd.DataFrame) -> bytes:
    return df.to_csv(index=False, sep=";", encoding="utf-8-sig").encode("utf-8-sig")


def df_to_excel_bytes(df: pd.DataFrame) -> bytes:
    buf = io.BytesIO()
    with pd.ExcelWriter(buf, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Vendas Limpas")
        ws = writer.sheets["Vendas Limpas"]
        for col in ws.columns:
            max_len = max(len(str(c.value)) for c in col if c.value)
            ws.column_dimensions[col[0].column_letter].width = max_len + 4
    return buf.getvalue()


# ─────────────────────────────────────────────
# Interface
# ─────────────────────────────────────────────

st.set_page_config(
    page_title="Limpeza de Planilha de Vendas",
    page_icon="🧹",
    layout="wide",
)

st.title("🧹 Limpeza de Planilha de Vendas")
st.caption("Faça upload do CSV de vendas para diagnóstico, limpeza automática e download.")

uploaded = st.file_uploader("Selecione o arquivo CSV", type="csv")

if not uploaded:
    st.info("Aguardando upload do arquivo CSV.")
    st.stop()

# ── Leitura ──────────────────────────────────
rows_orig = ler_csv(uploaded)
df_orig   = rows_to_df(rows_orig)

st.divider()

# ── Pré-visualização ─────────────────────────
with st.expander("📄 Dados originais", expanded=False):
    st.dataframe(df_orig, use_container_width=True)

# ── Diagnóstico ──────────────────────────────
st.subheader("🔍 Diagnóstico — antes da limpeza")

diag  = diagnosticar(rows_orig)
total = total_erros(diag)

LABELS = {
    "datas_erradas":           "Datas com formato errado",
    "receitas_erradas":        "Receitas fora do padrão",
    "status_errados":          "Status com caixa errada",
    "regioes_erradas":         "Regiões com grafia errada",
    "nomes_errados":           "Nomes com caixa errada",
    "representantes_errados":  "Representantes com caixa errada",
    "duplicatas":              "Linhas duplicadas",
    "obs_contraditorias":      "Observações contraditórias",
}

# Linha 1: total + 4 categorias
col_total, c1, c2, c3, c4 = st.columns([1.4, 1, 1, 1, 1])
col_total.metric("⚠️ Total de problemas", total,
                 delta=f"em {len(rows_orig)} registros", delta_color="inverse")

items = list(LABELS.items())
for col, (chave, label) in zip([c1, c2, c3, c4], items[:4]):
    n = len(diag[chave])
    col.metric(label, n,
               delta="ok" if n == 0 else f"{n} afetados",
               delta_color="normal" if n == 0 else "inverse")

# Linha 2: 4 categorias restantes
c5, c6, c7, c8 = st.columns(4)
for col, (chave, label) in zip([c5, c6, c7, c8], items[4:]):
    n = len(diag[chave])
    col.metric(label, n,
               delta="ok" if n == 0 else f"{n} afetados",
               delta_color="normal" if n == 0 else "inverse")

# Tabela detalhada de IDs afetados
with st.expander("Ver IDs afetados por categoria"):
    tabela = [{"Categoria": lbl,
               "IDs afetados": ", ".join(diag[chave]) or "—",
               "Qtd": len(diag[chave])}
              for chave, lbl in LABELS.items()]
    st.dataframe(pd.DataFrame(tabela), use_container_width=True, hide_index=True)

st.divider()

# ── Limpeza ──────────────────────────────────
st.subheader("✨ Limpeza automática")

with st.spinner("Aplicando correções..."):
    rows_limpos, ids_removidos = limpar(rows_orig)
    df_limpo = rows_to_df(rows_limpos)

erros_depois    = total_erros(diagnosticar(rows_limpos))
erros_corrigidos = total - erros_depois

c1, c2, c3 = st.columns(3)
c1.metric("Registros originais",  len(rows_orig))
c2.metric("Duplicatas removidas", len(ids_removidos),
          delta=f"IDs: {', '.join(ids_removidos)}" if ids_removidos else "nenhuma",
          delta_color="inverse")
c3.metric("Registros finais", len(rows_limpos))

c4, c5 = st.columns(2)
c4.metric("Problemas encontrados",  total,            delta_color="inverse")
c5.metric("Problemas corrigidos",   erros_corrigidos,
          delta=f"{erros_corrigidos}/{total}",
          delta_color="normal")

st.divider()

# ── Validação ────────────────────────────────
st.subheader("✅ Validação — testes automatizados")

resultados = validar(rows_limpos)
passou     = sum(1 for r in resultados if r["passou"])
total_t    = len(resultados)

prog_col, badge_col = st.columns([3, 1])
prog_col.progress(passou / total_t, text=f"{passou}/{total_t} testes passando")
if passou == total_t:
    badge_col.success(f"✓ {passou}/{total_t} PASSED")
else:
    badge_col.error(f"✗ {total_t - passou} FAILED")

with st.expander("Ver resultado de cada teste"):
    for r in resultados:
        icon = "✅" if r["passou"] else "❌"
        st.markdown(f"{icon} **{r['teste']}** — `{r['detalhe']}`")

st.divider()

# ── Comparativo ──────────────────────────────
st.subheader("🔄 Comparativo antes × depois")

tab_antes, tab_depois = st.tabs(["Antes", "Depois"])
with tab_antes:
    st.dataframe(df_orig, use_container_width=True)
with tab_depois:
    st.dataframe(df_limpo, use_container_width=True)

st.divider()

# ── Download ─────────────────────────────────
st.subheader("⬇️ Download da planilha limpa")

d1, d2 = st.columns(2)
with d1:
    st.download_button(
        label="📥 Baixar CSV",
        data=df_to_csv_bytes(df_limpo),
        file_name="planilha_vendas_corrigida.csv",
        mime="text/csv",
        use_container_width=True,
    )
with d2:
    st.download_button(
        label="📊 Baixar Excel",
        data=df_to_excel_bytes(df_limpo),
        file_name="planilha_vendas_corrigida.xlsx",
        mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        use_container_width=True,
    )
