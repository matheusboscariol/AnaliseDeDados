import { createClient } from '../supabase'

export interface CompetidorPreco {
  nome_concorrente: string
  preco_concorrente: number
  data_coleta: string
}

export interface ProdutoComPrecos {
  id_produto: string
  nome_produto: string
  categoria: string
  marca: string
  preco: number
  preco_competidores: CompetidorPreco[]
}

export interface CategoriaPrecoMedio {
  categoria: string
  precoMedioProprio: number
  precoMedioConcorrente: number | null
  temConcorrente: boolean
  produtosCount: number
}

export interface ProdutoIndice {
  id_produto: string
  nome_produto: string
  categoria: string
  marca: string
  preco: number
  precoMedioConcorrente: number
  indiceCompetitividade: number
}

export interface PricingDataset {
  produtos: ProdutoComPrecos[]
  categorias: CategoriaPrecoMedio[]
  indices: ProdutoIndice[]
  acimaConcorrente: ProdutoIndice[]
  abaixoConcorrente: ProdutoIndice[]
  categoriasSemConcorrente: string[]
  maiorGap: { categoria: string; gapPercent: number } | null
  oportunidadesRisco: ProdutoIndice[]
  oportunidadesUpside: ProdutoIndice[]
}

export async function getPricingData(): Promise<PricingDataset> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('produtos')
    .select(
      'id_produto, nome_produto, categoria, marca, preco, preco_competidores(nome_concorrente, preco_concorrente, data_coleta)'
    )

  if (error) {
    console.error('[pricing] erro ao buscar produtos:', error.message)
    return {
      produtos: [],
      categorias: [],
      indices: [],
      acimaConcorrente: [],
      abaixoConcorrente: [],
      categoriasSemConcorrente: [],
      maiorGap: null,
      oportunidadesRisco: [],
      oportunidadesUpside: [],
    }
  }

  const produtos = (data ?? []) as ProdutoComPrecos[]

  const categoriasMap = new Map<
    string,
    { precosProprios: number[]; precosConcorrentes: number[] }
  >()

  for (const p of produtos) {
    const entry = categoriasMap.get(p.categoria) ?? {
      precosProprios: [],
      precosConcorrentes: [],
    }
    entry.precosProprios.push(Number(p.preco))
    for (const c of p.preco_competidores ?? []) {
      entry.precosConcorrentes.push(Number(c.preco_concorrente))
    }
    categoriasMap.set(p.categoria, entry)
  }

  const categorias: CategoriaPrecoMedio[] = Array.from(categoriasMap.entries())
    .map(([categoria, { precosProprios, precosConcorrentes }]) => {
      const precoMedioProprio = avg(precosProprios)
      const temConcorrente = precosConcorrentes.length > 0
      return {
        categoria,
        precoMedioProprio,
        precoMedioConcorrente: temConcorrente ? avg(precosConcorrentes) : null,
        temConcorrente,
        produtosCount: precosProprios.length,
      }
    })
    .sort((a, b) => a.categoria.localeCompare(b.categoria))

  const indices: ProdutoIndice[] = produtos
    .filter((p) => (p.preco_competidores ?? []).length > 0)
    .map((p) => {
      const precos = p.preco_competidores.map((c) => Number(c.preco_concorrente))
      const precoMedioConcorrente = avg(precos)
      const indiceCompetitividade =
        precoMedioConcorrente > 0
          ? (Number(p.preco) / precoMedioConcorrente - 1) * 100
          : 0
      return {
        id_produto: p.id_produto,
        nome_produto: p.nome_produto,
        categoria: p.categoria,
        marca: p.marca,
        preco: Number(p.preco),
        precoMedioConcorrente,
        indiceCompetitividade,
      }
    })
    .sort((a, b) => b.indiceCompetitividade - a.indiceCompetitividade)

  const acimaConcorrente = indices.filter((i) => i.indiceCompetitividade > 0)
  const abaixoConcorrente = indices.filter((i) => i.indiceCompetitividade < 0)

  const categoriasSemConcorrente = categorias
    .filter((c) => !c.temConcorrente)
    .map((c) => c.categoria)

  const categoriasComGap = categorias.filter(
    (c) => c.temConcorrente && c.precoMedioConcorrente && c.precoMedioConcorrente > 0
  )
  const maiorGap =
    categoriasComGap.length > 0
      ? categoriasComGap
          .map((c) => ({
            categoria: c.categoria,
            gapPercent:
              ((c.precoMedioProprio - (c.precoMedioConcorrente ?? 0)) /
                (c.precoMedioConcorrente ?? 1)) *
              100,
          }))
          .sort((a, b) => Math.abs(b.gapPercent) - Math.abs(a.gapPercent))[0]
      : null

  const oportunidadesRisco = indices.filter((i) => i.indiceCompetitividade > 15)
  const oportunidadesUpside = indices.filter((i) => i.indiceCompetitividade < -15)

  return {
    produtos,
    categorias,
    indices,
    acimaConcorrente,
    abaixoConcorrente,
    categoriasSemConcorrente,
    maiorGap,
    oportunidadesRisco,
    oportunidadesUpside,
  }
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0
  return nums.reduce((s, n) => s + n, 0) / nums.length
}
