import { createClient } from '../supabase'

export interface ProdutoRef {
  nome_produto: string | null
  categoria: string | null
}

export interface VendaCliente {
  id_venda: string
  canal_venda: string | null
  quantidade: number | null
  preco_unitario: number | null
  id_produto: string | null
  produtos: ProdutoRef | null
}

export interface ClienteRow {
  id_cliente: string
  nome_cliente: string
  estado: string | null
  pais: string | null
  data_cadastro: string | null
  vendas: VendaCliente[] | null
}

export async function getClientesData(): Promise<ClienteRow[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('clientes')
    .select(
      'id_cliente, nome_cliente, estado, pais, data_cadastro, vendas(id_venda, canal_venda, quantidade, preco_unitario, id_produto, produtos(nome_produto, categoria))'
    )
  if (error) {
    console.error('[clientes.getClientesData]', error.message)
    return []
  }
  return (data ?? []) as unknown as ClienteRow[]
}
