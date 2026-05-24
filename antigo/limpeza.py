"""
Lógica de diagnóstico, limpeza e validação de planilha de vendas.
Importável por app.py, limpar_vendas.py e testar_vendas.py.
"""
import re

REGIOES_VALIDAS = {"Sudeste", "Sul", "Nordeste", "Norte", "Centro-Oeste"}
STATUS_VALIDOS  = {"Fechado Ganho", "Fechado Perdido"}
PADRAO_DATA     = re.compile(r"^\d{2}/\d{2}/\d{4}$")
PADRAO_RECEITA  = re.compile(r"^R\$ [\d.]+,\d{2}$")
CHAVES_DEDUP    = ["Nome do Cliente", "Região", "Representante",
                   "Data do Pedido", "Receita", "Produto", "Status"]

MESES = {
    "jan": 1, "fev": 2, "mar": 3, "abr": 4, "mai": 5, "jun": 6,
    "jul": 7, "ago": 8, "set": 9, "out": 10, "nov": 11, "dez": 12,
    "janeiro": 1, "fevereiro": 2, "março": 3, "abril": 4, "maio": 5,
    "junho": 6, "julho": 7, "agosto": 8, "setembro": 9, "outubro": 10,
    "novembro": 11, "dezembro": 12,
}
REGIOES_MAP = {
    "sudeste": "Sudeste", "sul": "Sul", "nordeste": "Nordeste",
    "norte": "Norte", "centro-oeste": "Centro-Oeste",
}
STATUS_MAP = {
    "fechado ganho": "Fechado Ganho",
    "fechado perdido": "Fechado Perdido",
}


# ─────────────────────────────────────────────
# Normalização individual
# ─────────────────────────────────────────────

def normalizar_data(valor: str) -> str:
    v = valor.strip()
    if re.match(r"^\d{2}/\d{2}/\d{4}$", v):
        return v
    m = re.match(r"^(\d{4})-(\d{2})-(\d{2})$", v)
    if m:
        return f"{m.group(3)}/{m.group(2)}/{m.group(1)}"
    m = re.match(r"^(\d{1,2})\s+([a-záéíóúâêôãõç\.]+)\s+(\d{4})$", v, re.IGNORECASE)
    if m:
        dia, mes_str, ano = int(m.group(1)), m.group(2).rstrip(".").lower(), int(m.group(3))
        mes = MESES.get(mes_str)
        if mes:
            return f"{dia:02d}/{mes:02d}/{ano}"
    return v


def normalizar_receita(valor: str) -> str:
    limpo = re.sub(r"R\$\s*", "", valor).replace(".", "").replace(",", ".").strip()
    try:
        numero = float(limpo)
    except ValueError:
        return valor
    inteiro = int(numero)
    centavos = round((numero - inteiro) * 100)
    return f"R$ {inteiro:,}".replace(",", ".") + f",{centavos:02d}"


def normalizar_observacoes(obs: str, receita: str, representante: str, status: str) -> str:
    obs_lower = obs.strip().lower()
    if "receita ausente" in obs_lower and receita.strip():
        return ""
    if "sem representante" in obs_lower and representante.strip():
        return ""
    for en, pt in {"closed won": "Fechado Ganho", "closed lost": "Fechado Perdido"}.items():
        if obs_lower == en:
            obs, obs_lower = pt, pt.lower()
            break
    if obs_lower == status.strip().lower():
        return ""
    return obs.strip()


# ─────────────────────────────────────────────
# Diagnóstico
# ─────────────────────────────────────────────

def diagnosticar(rows: list[dict]) -> dict:
    """Mapeia cada categoria de problema para a lista de IDs afetados."""
    d = {
        "datas_erradas":            [],
        "receitas_erradas":         [],
        "status_errados":           [],
        "regioes_erradas":          [],
        "nomes_errados":            [],
        "representantes_errados":   [],
        "duplicatas":               [],
        "obs_contraditorias":       [],
    }
    seen: dict[tuple, str] = {}
    for r in rows:
        id_ = r["ID"]
        if not PADRAO_DATA.match(r["Data do Pedido"].strip()):
            d["datas_erradas"].append(id_)
        if not PADRAO_RECEITA.match(r["Receita"].strip()):
            d["receitas_erradas"].append(id_)
        if r["Status"].strip() not in STATUS_VALIDOS:
            d["status_errados"].append(id_)
        if r["Região"].strip() not in REGIOES_VALIDAS:
            d["regioes_erradas"].append(id_)
        nome = r["Nome do Cliente"].strip()
        if nome != nome.title():
            d["nomes_errados"].append(id_)
        rep = r["Representante"].strip()
        if rep != rep.title():
            d["representantes_errados"].append(id_)
        key = tuple(r[c].strip().lower() for c in CHAVES_DEDUP)
        if key in seen:
            d["duplicatas"].append(id_)
        else:
            seen[key] = id_
        obs = r["Observações"].strip().lower()
        if (("receita ausente" in obs and r["Receita"].strip()) or
                ("sem representante" in obs and r["Representante"].strip()) or
                bool(re.search(r"\bclosed (won|lost)\b", obs, re.I)) or
                (obs == r["Status"].strip().lower())):
            d["obs_contraditorias"].append(id_)
    return d


def total_erros(diag: dict) -> int:
    return sum(len(v) for v in diag.values())


# ─────────────────────────────────────────────
# Limpeza
# ─────────────────────────────────────────────

def limpar(rows: list[dict]) -> tuple[list[dict], list[str]]:
    """Retorna (linhas_limpas, ids_removidos)."""
    seen: dict[tuple, str] = {}
    sem_dup, removidos = [], []
    for r in rows:
        key = tuple(r[c].strip().lower() for c in CHAVES_DEDUP)
        if key in seen:
            removidos.append(r["ID"])
        else:
            seen[key] = r["ID"]
            sem_dup.append(r)

    limpos = []
    for r in sem_dup:
        status  = STATUS_MAP.get(r["Status"].strip().lower(), r["Status"].strip())
        receita = normalizar_receita(r["Receita"])
        rep     = r["Representante"].strip().title()
        obs     = normalizar_observacoes(r["Observações"], receita, rep, status)
        limpos.append({
            "ID":               r["ID"],
            "Nome do Cliente":  r["Nome do Cliente"].strip().title(),
            "Região":           REGIOES_MAP.get(r["Região"].strip().lower(), r["Região"].strip()),
            "Representante":    rep,
            "Data do Pedido":   normalizar_data(r["Data do Pedido"]),
            "Receita":          receita,
            "Produto":          r["Produto"].strip(),
            "Status":           status,
            "Observações":      obs,
        })
    return limpos, removidos


# ─────────────────────────────────────────────
# Validação
# ─────────────────────────────────────────────

def validar(rows: list[dict]) -> list[dict]:
    """Retorna lista de {teste, passou, detalhe}."""
    resultados = []

    def t(nome, cond, detalhe=""):
        resultados.append({"teste": nome, "passou": cond, "detalhe": detalhe if not cond else "✓"})

    invalidas_data = [(r["ID"], r["Data do Pedido"]) for r in rows if not PADRAO_DATA.match(r["Data do Pedido"])]
    t("Datas no formato DD/MM/YYYY", not invalidas_data, str(invalidas_data))

    iso_texto = [(r["ID"], r["Data do Pedido"]) for r in rows
                 if re.match(r"\d{4}-\d{2}-\d{2}", r["Data do Pedido"]) or re.search(r"[a-z]", r["Data do Pedido"], re.I)]
    t("Nenhuma data ISO ou texto livre", not iso_texto, str(iso_texto))

    sem_rs = [(r["ID"], r["Receita"]) for r in rows if "R$" not in r["Receita"]]
    t("Receitas com prefixo R$", not sem_rs, str(sem_rs))

    fmt_rec = [(r["ID"], r["Receita"]) for r in rows if not PADRAO_RECEITA.match(r["Receita"])]
    t("Receitas no padrão R$ X.XXX,XX", not fmt_rec, str(fmt_rec))

    st_inv = [(r["ID"], r["Status"]) for r in rows if r["Status"] not in STATUS_VALIDOS]
    t("Status com valores válidos", not st_inv, str(st_inv))

    st_cx = [(r["ID"], r["Status"]) for r in rows if r["Status"] != r["Status"].title()]
    t("Status com caixa correta", not st_cx, str(st_cx))

    reg_inv = [(r["ID"], r["Região"]) for r in rows if r["Região"] not in REGIOES_VALIDAS]
    t("Regiões com grafia válida", not reg_inv, str(reg_inv))

    nome_cx = [(r["ID"], r["Nome do Cliente"]) for r in rows if r["Nome do Cliente"] != r["Nome do Cliente"].title()]
    t("Nomes em Title Case", not nome_cx, str(nome_cx))

    rep_cx = [(r["ID"], r["Representante"]) for r in rows if r["Representante"] != r["Representante"].title()]
    t("Representantes em Title Case", not rep_cx, str(rep_cx))

    seen: dict[tuple, str] = {}
    dups = []
    for r in rows:
        key = tuple(r[c].strip().lower() for c in CHAVES_DEDUP)
        if key in seen:
            dups.append(r["ID"])
        else:
            seen[key] = r["ID"]
    t("Sem linhas duplicadas", not dups, str(dups))

    obs_rec = [r["ID"] for r in rows if "receita ausente" in r["Observações"].lower() and r["Receita"].strip()]
    t("Sem 'receita ausente' contraditório", not obs_rec, str(obs_rec))

    obs_rep = [r["ID"] for r in rows if "sem representante" in r["Observações"].lower() and r["Representante"].strip()]
    t("Sem 'sem representante' contraditório", not obs_rep, str(obs_rep))

    obs_red = [r["ID"] for r in rows if r["Observações"].strip().lower() == r["Status"].strip().lower()]
    t("Sem observações redundantes com status", not obs_red, str(obs_red))

    obs_eng = [r["ID"] for r in rows if re.search(r"\bclosed (won|lost)\b", r["Observações"], re.I)]
    t("Sem termos em inglês nas observações", not obs_eng, str(obs_eng))

    return resultados
