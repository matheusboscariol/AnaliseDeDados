# Design System — Ecommerce Dashboard

## Paleta de Cores (Tema Escuro)
- Background: #0A0A0F
- Surface (cards): #111118
- Border: #1E1E2E
- Primary: #6366F1 (indigo)
- Success: #10B981 (emerald)
- Warning: #F59E0B (amber)
- Danger: #EF4444 (red)
- Text Primary: #F1F5F9
- Text Secondary: #94A3B8
- Text Muted: #475569

## Tipografia
- Font: system-ui, -apple-system, sans-serif (sem import externo)
- KPI Number: text-3xl font-bold text-slate-100
- KPI Label: text-sm font-medium text-slate-400 uppercase tracking-wider
- Section Title: text-2xl font-semibold text-slate-100
- Body: text-sm text-slate-300
- Muted: text-xs text-slate-500

## Tailwind Classes Padrão
- Card: bg-[#111118] border border-[#1E1E2E] rounded-xl p-6
- Section wrapper: bg-[#0A0A0F] min-h-screen p-6
- Grid KPIs: grid grid-cols-2 md:grid-cols-4 gap-4
- Gap padrão: gap-4 (16px) ou gap-6 (24px)

## Biblioteca de Gráficos
- Recharts (já instalado via npm install recharts)
- Cores dos gráficos: ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']
- Todos os gráficos usam ResponsiveContainer width="100%" height={300}

## Componentes Base (em /app/components/ui/)
- KPICard.tsx
- SectionHeader.tsx
- ChartWrapper.tsx
- LoadingSpinner.tsx
- EmptyState.tsx
