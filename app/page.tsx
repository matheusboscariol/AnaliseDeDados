import Link from 'next/link'

type Section = {
  href: string
  icon: string
  title: string
  description: string
  bullets: string[]
  accent: string
}

const sections: Section[] = [
  {
    href: '/dashboard/vendas',
    icon: 'R$',
    title: 'Vendas & Receita',
    description:
      'Receita, ticket médio, mix de canal e top produtos do snapshot de 13/12/2025.',
    bullets: ['80 vendas · R$ 50.169,43', 'E-commerce vs. loja física', 'Top categorias e produtos'],
    accent: '#6366F1',
  },
  {
    href: '/dashboard/pricing',
    icon: '%',
    title: 'Pricing & Margem',
    description:
      'Comparativo do nosso preço contra concorrentes, índice de competitividade e oportunidades de repricing.',
    bullets: ['45 produtos · 48 preços de concorrentes', 'Banda saudável: 0,95–1,05', '4 categorias sem dado de mercado'],
    accent: '#10B981',
  },
  {
    href: '/dashboard/clientes',
    icon: 'Co',
    title: 'Clientes & Comportamento',
    description:
      'Base de clientes, taxa de ativação, distribuição geográfica e LTV do dia.',
    bullets: ['35 clientes cadastrados', 'Distribuição por estado', 'Canal preferido por cliente'],
    accent: '#F59E0B',
  },
]

export default function Home() {
  return (
    <main className="bg-[#0A0A0F] min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
            Snapshot 13/12/2025
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-100">
            Analytics Ecommerce
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-2xl">
            Três visões executivas sobre a operação: receita do dia, posicionamento de preço
            contra o mercado e comportamento da base de clientes.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="group bg-[#111118] border border-[#1E1E2E] rounded-xl p-6 transition-colors hover:border-[#2A2A40]"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold mb-4 tabular-nums"
                style={{ backgroundColor: `${s.accent}1A`, color: s.accent }}
              >
                {s.icon}
              </div>
              <h2 className="text-lg font-semibold text-slate-100 mb-2">{s.title}</h2>
              <p className="text-sm text-slate-400 mb-4">{s.description}</p>
              <ul className="space-y-1 mb-6">
                {s.bullets.map((b) => (
                  <li key={b} className="text-xs text-slate-500 flex gap-2">
                    <span className="text-slate-600">·</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <span
                className="text-sm font-medium inline-flex items-center gap-1 transition-transform group-hover:translate-x-0.5"
                style={{ color: s.accent }}
              >
                Abrir seção <span aria-hidden="true">→</span>
              </span>
            </Link>
          ))}
        </div>

        <footer className="mt-10 text-xs text-slate-600">
          Fonte: Supabase (4 tabelas · read-only via anon key). Todas as vendas concentradas em
          13/12/2025 — KPIs representam um snapshot pontual.
        </footer>
      </div>
    </main>
  )
}
