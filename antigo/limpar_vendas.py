import csv

from limpeza import limpar

INPUT_FILE  = "data/planilha_vendas.csv"
OUTPUT_FILE = "data/planilha_vendas_corrigida.csv"


def main():
    with open(INPUT_FILE, encoding="utf-8-sig") as f:
        reader = csv.DictReader(f, delimiter=";")
        fieldnames = reader.fieldnames
        rows = list(reader)

    print(f"Registros lidos: {len(rows)}")

    limpos, removidos = limpar(rows)
    print(f"Duplicatas removidas: {removidos}")

    with open(OUTPUT_FILE, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter=";")
        writer.writeheader()
        writer.writerows(limpos)

    print(f"Registros gravados: {len(limpos)}")
    print(f"Arquivo salvo em: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
