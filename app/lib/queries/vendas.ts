import { createClient } from '../supabase'

export interface VendaRow {
  id_venda: string
  data_venda: string | null
  id_cliente: string | null
  id_produto: string | null
  canal_venda: string | null
  quantidade: number | null
  preco_unitario: number | null
  produtos: {
    nome_produto: string | null
    categoria: string | null
  } | null
}

export interface ResumoVendas {
  receitaTotal: number
  ticketMedio: number
  unidadesVendidas: number
  totalPedidos: number
}

export interface FatiaCanal {
  canal: string
  receita: number
  pedidos: number
  percentual: number
}

export interface TopProduto {
  nome: string
  receita: number
  unidades: number
}

export interface ReceitaPorHora {
  hora: string
  receita: number
  pedidos: number
}

export interface ReceitaPorCategoria {
  categoria: string
  receita: number
  unidades: number
}

export async function fetchVendasComProdutos(): Promise<VendaRow[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('vendas')
    .select(
      'id_venda, data_venda, id_cliente, id_produto, canal_venda, quantidade, preco_unitario, produtos(nome_produto, categoria)'
    )
    .order('data_venda', { ascending: true })

  if (error) {
    console.error('[vendas.fetchVendasComProdutos]', error.message)
    return []
  }

  return (data ?? []) as unknown as VendaRow[]
}

function valorVenda(v: VendaRow): number {
  const qtd = v.quantidade ?? 0
  const preco = Number(v.preco_unitario ?? 0)
  return qtd * preco
}

export function calcularResumo(vendas: VendaRow[]): ResumoVendas {
  const receitaTotal = vendas.reduce((acc, v) => acc + valorVenda(v), 0)
  const unidadesVendidas = vendas.reduce((acc, v) => acc + (v.quantidade ?? 0), 0)
  const totalPedidos = vendas.length
  const ticketMedio = totalPedidos > 0 ? receitaTotal / totalPedidos : 0
  return { receitaTotal, ticketMedio, unidadesVendidas, totalPedidos }
}

export function calcularMixCanal(vendas: VendaRow[]): FatiaCanal[] {
  const total = vendas.reduce((acc, v) => acc + valorVenda(v), 0)
  const mapa = new Map<string, { receita: number; pedidos: number }>()
  for (const v of vendas) {
    const canal = v.canal_venda ?? 'desconhecido'
    const atual = mapa.get(canal) ?? { receita: 0, pedidos: 0 }
    atual.receita += valorVenda(v)
    atual.pedidos += 1
    mapa.set(canal, atual)
  }
  return Array.from(mapa.entries())
    .map(([canal, { receita, pedidos }]) => ({
      canal,
      receita,
      pedidos,
      percentual: total > 0 ? (receita / total) * 100 : 0,
    }))
    .sort((a, b) => b.receita - a.receita)
}

export function calcularTopProdutos(vendas: VendaRow[], topN = 5): TopProduto[] {
  const mapa = new Map<string, { receita: number; unidades: number }>()
  for (const v of vendas) {
    const nome = v.produtos?.nome_produto ?? v.id_produto ?? 'desconhecido'
    const atual = mapa.get(nome) ?? { receita: 0, unidades: 0 }
    atual.receita += valorVenda(v)
    atual.unidades += v.quantidade ?? 0
    mapa.set(nome, atual)
  }
  return Array.from(mapa.entries())
    .map(([nome, { receita, unidades }]) => ({ nome, receita, unidades }))
    .sort((a, b) => b.receita - a.receita)
    .slice(0, topN)
}

const formatadorHoraSP = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  hour: '2-digit',
  hour12: false,
})

export function calcularReceitaPorHora(vendas: VendaRow[]): ReceitaPorHora[] {
  const mapa = new Map<number, { receita: number; pedidos: number }>()
  for (const v of vendas) {
    if (!v.data_venda) continue
    const horaStr = formatadorHoraSP.format(new Date(v.data_venda))
    const hora = Number.parseInt(horaStr, 10)
    if (Number.isNaN(hora)) continue
    const atual = mapa.get(hora) ?? { receita: 0, pedidos: 0 }
    atual.receita += valorVenda(v)
    atual.pedidos += 1
    mapa.set(hora, atual)
  }
  if (mapa.size === 0) return []
  const horas = Array.from(mapa.keys())
  const minHora = Math.min(...horas)
  const maxHora = Math.max(...horas)
  const resultado: ReceitaPorHora[] = []
  for (let h = minHora; h <= maxHora; h++) {
    const dado = mapa.get(h) ?? { receita: 0, pedidos: 0 }
    resultado.push({
      hora: `${String(h).padStart(2, '0')}h`,
      receita: dado.receita,
      pedidos: dado.pedidos,
    })
  }
  return resultado
}

export function calcularReceitaPorCategoria(vendas: VendaRow[]): ReceitaPorCategoria[] {
  const mapa = new Map<string, { receita: number; unidades: number }>()
  for (const v of vendas) {
    const categoria = v.produtos?.categoria ?? 'sem categoria'
    const atual = mapa.get(categoria) ?? { receita: 0, unidades: 0 }
    atual.receita += valorVenda(v)
    atual.unidades += v.quantidade ?? 0
    mapa.set(categoria, atual)
  }
  return Array.from(mapa.entries())
    .map(([categoria, { receita, unidades }]) => ({ categoria, receita, unidades }))
    .sort((a, b) => b.receita - a.receita)
}
