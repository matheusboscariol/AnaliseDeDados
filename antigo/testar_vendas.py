import csv
import re
import pytest

from limpeza import REGIOES_VALIDAS, STATUS_VALIDOS, CHAVES_DEDUP, PADRAO_DATA, PADRAO_RECEITA

FILE          = "data/planilha_vendas_corrigida.csv"
IDS_REMOVIDOS = {"1027", "1028"}


@pytest.fixture(scope="session")
def rows():
    with open(FILE, encoding="utf-8-sig") as f:
        return list(csv.DictReader(f, delimiter=";"))


# ── 0. Integridade geral ──────────────────────────────────

def test_arquivo_tem_28_registros(rows):
    assert len(rows) == 28, f"esperado 28, encontrado {len(rows)}"


def test_arquivo_tem_9_colunas(rows):
    assert len(rows[0]) == 9, f"esperado 9, encontrado {len(rows[0])}"


# ── 1. Datas ─────────────────────────────────────────────

def test_datas_formato_dd_mm_yyyy(rows):
    invalidas = [(r["ID"], r["Data do Pedido"]) for r in rows
                 if not PADRAO_DATA.match(r["Data do Pedido"])]
    assert not invalidas, f"Datas fora do padrão DD/MM/YYYY: {invalidas}"


def test_datas_sem_formato_iso_ou_texto(rows):
    invalidas = [(r["ID"], r["Data do Pedido"]) for r in rows
                 if re.match(r"\d{4}-\d{2}-\d{2}", r["Data do Pedido"])
                 or re.search(r"[a-z]", r["Data do Pedido"], re.I)]
    assert not invalidas, f"Datas em formato ISO ou texto livre: {invalidas}"


# ── 2. Receita ────────────────────────────────────────────

def test_receitas_com_prefixo_rs(rows):
    sem_prefixo = [(r["ID"], r["Receita"]) for r in rows if "R$" not in r["Receita"]]
    assert not sem_prefixo, f"Receitas sem prefixo R$: {sem_prefixo}"


def test_receitas_formato_padrao(rows):
    invalidas = [(r["ID"], r["Receita"]) for r in rows
                 if not PADRAO_RECEITA.match(r["Receita"])]
    assert not invalidas, f"Receitas fora do padrão R$ X.XXX,XX: {invalidas}"


# ── 3. Status ─────────────────────────────────────────────

def test_status_valores_validos(rows):
    invalidos = [(r["ID"], r["Status"]) for r in rows
                 if r["Status"] not in STATUS_VALIDOS]
    assert not invalidos, f"Status fora do conjunto válido: {invalidos}"


def test_status_caixa_correta(rows):
    erros = [(r["ID"], r["Status"]) for r in rows
             if r["Status"] != r["Status"].title()]
    assert not erros, f"Status com caixa errada: {erros}"


# ── 4. Região ─────────────────────────────────────────────

def test_regioes_validas(rows):
    invalidas = [(r["ID"], r["Região"]) for r in rows
                 if r["Região"] not in REGIOES_VALIDAS]
    assert not invalidas, f"Regiões com grafia/caixa errada: {invalidas}"


# ── 5. Nome do Cliente ────────────────────────────────────

def test_nomes_title_case(rows):
    erros = [(r["ID"], r["Nome do Cliente"]) for r in rows
             if r["Nome do Cliente"] != r["Nome do Cliente"].title()]
    assert not erros, f"Nomes com caixa errada: {erros}"


# ── 6. Representante ──────────────────────────────────────

def test_representantes_title_case(rows):
    erros = [(r["ID"], r["Representante"]) for r in rows
             if r["Representante"] != r["Representante"].title()]
    assert not erros, f"Representantes com caixa errada: {erros}"


# ── 7. Duplicatas ─────────────────────────────────────────

def test_sem_linhas_duplicadas(rows):
    seen: dict[tuple, str] = {}
    duplicatas = []
    for r in rows:
        key = tuple(r[c].strip().lower() for c in CHAVES_DEDUP)
        if key in seen:
            duplicatas.append((r["ID"], seen[key]))
        else:
            seen[key] = r["ID"]
    assert not duplicatas, f"Linhas duplicadas encontradas: {duplicatas}"


def test_ids_removidos_ausentes(rows):
    ids_presentes = {r["ID"] for r in rows}
    ainda_presentes = IDS_REMOVIDOS & ids_presentes
    assert not ainda_presentes, f"IDs que deveriam ter sido removidos: {ainda_presentes}"


# ── 8. Observações ────────────────────────────────────────

def test_observacoes_sem_receita_ausente_contraditor(rows):
    erros = [(r["ID"], r["Observações"]) for r in rows
             if "receita ausente" in r["Observações"].lower() and r["Receita"].strip()]
    assert not erros, f"'receita ausente' com receita preenchida: {erros}"


def test_observacoes_sem_sem_representante_contraditor(rows):
    erros = [(r["ID"], r["Observações"]) for r in rows
             if "sem representante" in r["Observações"].lower() and r["Representante"].strip()]
    assert not erros, f"'sem representante' com representante preenchido: {erros}"


def test_observacoes_sem_redundancia_com_status(rows):
    erros = [(r["ID"], r["Observações"]) for r in rows
             if r["Observações"].strip().lower() == r["Status"].strip().lower()]
    assert not erros, f"Observações idênticas ao status: {erros}"


def test_observacoes_sem_termos_em_ingles(rows):
    erros = [(r["ID"], r["Observações"]) for r in rows
             if re.search(r"\bclosed (won|lost)\b", r["Observações"], re.I)]
    assert not erros, f"Termos em inglês nas observações: {erros}"
