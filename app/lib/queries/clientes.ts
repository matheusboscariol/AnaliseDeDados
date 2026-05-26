import { createClient } from '../supabase'

export interface ClienteComVendas {
  id_cliente: string
  nome_cliente: string
  estado: string | null
  pais: string | null
  data_cadastro: string | null
  totalPedidos: number
  receitaTotal: number
  canalPreferido: string | null
  categoriasCompradas: string[]
}

export interface ResumoClientes {
  totalCadastrados: number
  totalAtivos: number
  taxaRecompra: number
  ticketMedioCliente: number
}

interface ClienteRowRaw {
  id_cliente: string
  nome_cliente: string
  estado: string | null
  pais: string | null
  data_cadastro: string | null
}

interface VendaRowRaw {
  id_venda: string
  id_cliente: string | null
  canal_venda: string | null
  quantidade: number | null
  preco_unitario: number | null
  produtos: { categoria: string | null } | null
}

function valorVenda(qtd: number | null, preco: number | null): number {
  return (qtd ?? 0) * Number(preco ?? 0)
}

export async function fetchClientesComVendas(): Promise<ClienteComVendas[]> {
  const supabase = createClient()

  const [clientesRes, vendasRes] = await Promise.all([
    supabase.from('clientes').select('id_cliente, nome_cliente, estado, pais, data_cadastro'),
    supabase
      .from('vendas')
      .select('id_venda, id_cliente, canal_venda, quantidade, preco_unitario, produtos(categoria)'),
  ])

  if (clientesRes.error) {
    console.error('[clientes.fetchClientesComVendas:clientes]', clientesRes.error.message)
    return []
  }
  if (vendasRes.error) {
    console.error('[clientes.fetchClientesComVendas:vendas]', vendasRes.error.message)
    return []
  }

  const clientes = (clientesRes.data ?? []) as ClienteRowRaw[]
  const vendas = (vendasRes.data ?? []) as unknown as VendaRowRaw[]

  const vendasPorCliente = new Map<string, VendaRowRaw[]>()
  for (const v of vendas) {
    if (!v.id_cliente) continue
    const lista = vendasPorCliente.get(v.id_cliente) ?? []
    lista.push(v)
    vendasPorCliente.set(v.id_cliente, lista)
  }

  return clientes.map((c) => {
    const vendasCliente = vendasPorCliente.get(c.id_cliente) ?? []

    const receitaTotal = vendasCliente.reduce(
      (acc, v) => acc + valorVenda(v.quantidade, v.preco_unitario),
      0
    )

    const canalCount = new Map<string, number>()
    for (const v of vendasCliente) {
      const canal = v.canal_venda?.trim()
      if (!canal) continue
      canalCount.set(canal, (canalCount.get(canal) ?? 0) + 1)
    }
    let canalPreferido: string | null = null
    let maiorCount = 0
    for (const [canal, count] of canalCount) {
      if (count > maiorCount) {
        maiorCount = count
        canalPreferido = canal
      }
    }

    const categoriasSet = new Set<string>()
    for (const v of vendasCliente) {
      const cat = v.produtos?.categoria?.trim()
      if (cat) categoriasSet.add(cat)
    }

    return {
      id_cliente: c.id_cliente,
      nome_cliente: c.nome_cliente,
      estado: c.estado,
      pais: c.pais,
      data_cadastro: c.data_cadastro,
      totalPedidos: vendasCliente.length,
      receitaTotal,
      canalPreferido,
      categoriasCompradas: Array.from(categoriasSet).sort(),
    }
  })
}

export function calcularResumoClientes(clientes: ClienteComVendas[]): ResumoClientes {
  const totalCadastrados = clientes.length
  const ativos = clientes.filter((c) => c.totalPedidos > 0)
  const totalAtivos = ativos.length
  const recompradores = ativos.filter((c) => c.totalPedidos > 1).length
  const taxaRecompra = totalAtivos > 0 ? (recompradores / totalAtivos) * 100 : 0
  const receitaTotal = ativos.reduce((acc, c) => acc + c.receitaTotal, 0)
  const ticketMedioCliente = totalAtivos > 0 ? receitaTotal / totalAtivos : 0
  return { totalCadastrados, totalAtivos, taxaRecompra, ticketMedioCliente }
}

export function calcularTopClientes(
  clientes: ClienteComVendas[],
  topN = 5
): ClienteComVendas[] {
  return [...clientes]
    .filter((c) => c.receitaTotal > 0)
    .sort((a, b) => b.receitaTotal - a.receitaTotal)
    .slice(0, topN)
}

export function calcularDistribuicaoEstados(
  clientes: ClienteComVendas[]
): { estado: string; clientes: number; receita: number }[] {
  const mapa = new Map<string, { clientes: number; receita: number }>()
  for (const c of clientes) {
    const uf = c.estado?.trim() || 'N/D'
    const atual = mapa.get(uf) ?? { clientes: 0, receita: 0 }
    atual.clientes += 1
    atual.receita += c.receitaTotal
    mapa.set(uf, atual)
  }
  return Array.from(mapa.entries())
    .map(([estado, { clientes, receita }]) => ({ estado, clientes, receita }))
    .sort((a, b) => b.clientes - a.clientes || b.receita - a.receita)
}

export function calcularCanalPreferido(
  clientes: ClienteComVendas[]
): { canal: string; clientes: number }[] {
  const mapa = new Map<string, number>()
  for (const c of clientes) {
    if (!c.canalPreferido) continue
    mapa.set(c.canalPreferido, (mapa.get(c.canalPreferido) ?? 0) + 1)
  }
  return Array.from(mapa.entries())
    .map(([canal, clientes]) => ({ canal, clientes }))
    .sort((a, b) => b.clientes - a.clientes)
}

export async function fetchCategoriasMaisCompradas(): Promise<
  { categoria: string; unidades: number; receita: number }[]
> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('vendas')
    .select('quantidade, preco_unitario, produtos(categoria)')

  if (error) {
    console.error('[clientes.fetchCategoriasMaisCompradas]', error.message)
    return []
  }

  const linhas = (data ?? []) as unknown as VendaRowRaw[]
  const mapa = new Map<string, { unidades: number; receita: number }>()
  for (const v of linhas) {
    const categoria = v.produtos?.categoria?.trim() || 'Sem categoria'
    const atual = mapa.get(categoria) ?? { unidades: 0, receita: 0 }
    atual.unidades += v.quantidade ?? 0
    atual.receita += valorVenda(v.quantidade, v.preco_unitario)
    mapa.set(categoria, atual)
  }
  return Array.from(mapa.entries())
    .map(([categoria, { unidades, receita }]) => ({ categoria, unidades, receita }))
    .sort((a, b) => b.unidades - a.unidades)
}
