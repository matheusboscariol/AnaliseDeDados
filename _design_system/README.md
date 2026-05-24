# MSB · Matheus Boscariol Consultoria — Design System

> **Versão:** 1.0 — Maio 2026
> **Stack do produto:** Next.js 14 (App Router) + Tailwind + Vercel
> **Direção visual:** dark-first, sóbria, técnica, com vibe de IA + crescimento
> **Princípio guia:** *sofisticação pela contenção* — espaço escuro generoso, geometria limpa, sem ornamentos desnecessários

---

## 1. O que é este design system

Sistema visual completo para a Matheus Boscariol Consultoria — consultor em **marketing digital, processos, tecnologia e IA** para PMEs em crescimento e startups early-stage. O artefato principal é uma **landing page única** com foco em conversão para agendamento de diagnóstico.

A identidade nasceu a partir das referências **Vercel, Linear, Anthropic, Mercury, Stripe**: tipografia geométrica (Geist), paleta escura com um único accent técnico, e um símbolo de marca que encena o que a empresa entrega — fluxo entre nós (M → S → B) como metáfora de pipelines de marketing, processos e IA.

**EVITAR:** visual de agência de marketing, futurismo exagerado, vibe "guru de internet", estética festiva de startup.

## 2. Fontes deste sistema

| Fonte | Tipo | Caminho / link |
|---|---|---|
| Codebase do site | Next.js 14 + Tailwind | `Site-Portfolio/` (montado localmente; ver `app/page.tsx` e `components/sections/`) |
| GitHub do codebase | Repo | https://github.com/matheusboscariol/Site-Portfolio |
| PRD completo | Markdown | `Site-Portfolio/.llm/prd.md` (548 linhas; copy, estrutura e direcionamento) |
| Pré design system v2.0 | HTML standalone | `uploads/msb-design-system-v2.html` (1.776 linhas — referência mestre para tokens, logo e mockup) |

Para iteração mais fiel, vale **acessar o repo do GitHub** acima (`matheusboscariol/Site-Portfolio`) — ele tem o código-fonte de produção dos componentes em React/Tailwind que aqui foram traduzidos para JSX puro.

## 3. Índice — manifesto do projeto

```
.
├── README.md                       ← você está aqui
├── SKILL.md                        ← carregado como Agent Skill
├── colors_and_type.css             ← tokens (CSS vars) — colar em qualquer projeto
├── assets/                         ← logos em SVG (lockup, símbolo, favicon, monograma alt)
├── preview/                        ← cards do Design System tab (700×variável)
└── ui_kits/
    └── website/                    ← UI kit hi-fi do site (React/Babel)
        ├── index.html              ← demo viva — abrir para ver tudo aplicado
        ├── Primitives.jsx          ← Container, SectionHeader, Button, Card, EyebrowBar, BrandMark
        ├── Header.jsx              ← nav sticky com blur
        ├── Hero.jsx                ← hero com grid + glow + CTAs + trust bar
        ├── Sections.jsx            ← ForWhom, Pillars
        └── Lower.jsx               ← Methodology, Results, FinalCTA, Footer
```

---

## 4. Content fundamentals — como a copy é escrita

A copy é o coração desta marca. Não há ornamento que substitua uma frase clara.

### Princípios (do PRD §5)
- **StoryBrand:** o cliente é o herói; Matheus é o guia que oferece o plano.
- **Você > Eu:** nas primeiras dobras, o pronome dominante é **"você"**. Falar diretamente com o leitor.
- **Concreto > abstrato:** "R$ 750 mil em receita" sempre vence "resultados expressivos".
- **Verbos no presente e na ativa:** *Organizo, estruturo, ajudo* — nunca *será realizado*, *tem como objetivo*.
- **Frases curtas, parágrafos curtos.** Web é leitura escaneável.
- **Sem jargão desnecessário.** Termo técnico só se ele puxar peso real.

### Tom de voz
| Atributo | Como soa |
|---|---|
| **Direto** | "Sem achismo, sem desperdício de tempo." |
| **Sóbrio** | "Em uma conversa de 30 minutos, entendo o contexto da sua empresa." |
| **Confiante, não arrogante** | "A ponte entre o técnico e o de negócio." |
| **Espelho da dor** | "Você sabe que precisa evoluir no digital. O problema é que nada disso é simples." |
| **Numérico onde dá** | "12+ anos · 150+ clientes atendidos · R$ 750k+ em receita gerada" |

### Padrões de microcopy
- **Eyebrow text** sempre em CAPS MONO: `A SOLUÇÃO`, `COMO TRABALHO`, `PRÓXIMO PASSO`.
- **CTAs primários:** verbos de ação curtos. *"Agendar diagnóstico gratuito →"*. A seta `→` aparece à direita.
- **CTAs secundários:** confirmam um canal humano. *"Falar pelo WhatsApp"*.
- **Trust bar:** lista de credenciais separadas por `·` (interpunto). Sem ícones.
- **Casing:** título de seção em sentence-case ("Um caminho claro, em 5 etapas."); só eyebrows e tokens em CAPS.

### Vocabulário recorrente
> **ponte · clareza · execução · diagnóstico · destravar · pilares · ciclos · sprint · estratégia · IA · processos**

### Emoji?
**Não.** A marca não usa emoji em produção. (No mock interativo deste UI kit, `💬` aparece como placeholder para um ícone de WhatsApp Lucide — substituir por `<MessageCircle />` em produção.)

---

## 5. Visual foundations

### Color
Paleta **dark-first** com um único accent **azul técnico** em ramp de 4 tons (Blue 900/600/500/400). Hierarquia vem dos neutros, não da saturação. Todos os tokens em `colors_and_type.css`.

| Camada | Token | Hex |
|---|---|---|
| BG principal | `--bg-primary` | `#0A0B0F` |
| Cards | `--bg-secondary` | `#11131A` |
| Hover/inputs | `--bg-tertiary` | `#1A1D26` |
| Borda padrão | `--border-subtle` | `#272A33` |
| Texto principal | `--text-primary` | `#F5F6F8` |
| Texto secundário | `--text-secondary` | `#A1A4AE` |
| Texto muted | `--text-muted` | `#71747E` |
| Accent sólido | `--accent-mid` | `#2563EB` (CTA default) |
| Accent hover | `--accent-hover` | `#3B82F6` |
| Accent eyebrow | `--accent-bright` | `#60A5FA` |

> **Nota sobre roxo vs. azul.** O PRD original e o codebase atual (`Site-Portfolio/app/globals.css`) usam roxo `#7C3AED`. O pré design system v2.0 (`uploads/msb-design-system-v2.html`) — referência mais recente — migrou para o azul descrito acima. Este sistema segue **v2.0 (azul)**. Se a decisão for retornar para roxo, basta swap de `--accent-*` (todo o resto funciona idêntico).

### Type
- **Geist Sans** — display, headings, body. Pesos: 400 / 500 / 600 / 700. Tracking apertado em títulos (`-0.025em` → `-0.015em`).
- **Geist Mono** — eyebrows em CAPS, estatísticas grandes, captions técnicos, código inline.
- Ambas as fontes estão disponíveis no Google Fonts (carregadas via `@import` em `colors_and_type.css`). Em produção no Next.js o `next/font/google` cuida do load. **Nenhum arquivo `.ttf` local é necessário.**

### Spacing & layout
- Base de **4px** (Tailwind padrão).
- Seções: `py-24` desktop / `py-16` mobile.
- Container: `max-w-[1200px]` com `px-6` mobile / `px-8` desktop.
- Espaço escuro generoso é uma **decisão de design** — preferir respiro a densificar.

### Backgrounds & motifs
- **Hero & FinalCTA:** grid sutil (`rgba(255,255,255,0.04)` a 56px) + **radial glow azul** centrado no topo (`rgba(37,99,235,0.18)`). Mask radial fade-out para o fundo escuro.
- **Sem imagens hand-drawn, sem gradientes complexos, sem patterns repetitivos.** A "textura" da página é o grid + glow + a profundidade dos cards.
- Backgrounds alternados de seção: `bg-secondary/40` para criar ritmo visual.

### Borders & cards
- Border default: `1px solid #272A33` — quase imperceptível, define os limites.
- **Card:** `border-radius: 12px`, fundo `#11131A`, padding `24-32px`.
- Hover de card: borda passa a accent (`#2563EB/50`) + glow externo `0 20px 40px -16px rgba(37,99,235,0.45)`.
- Sem `box-shadow` dramática. Toda elevação é **tingida pelo accent** — nunca shadow neutro.

### Corner radii
- `6px` — pills/badges
- `8px` — botões, inputs
- `12px` — cards (default)
- `16px` — containers grandes (hero mock)
- `999px` — pills, dots

### Motion & states
- **Easing padrão:** `cubic-bezier(0.16, 1, 0.3, 1)` (snappy ease-out — *"out-expo"*).
- **Duração padrão:** `200ms`. Slow: `300ms`.
- **Hover de botão primário:** `translateY(-1px)` + glow ligeiramente maior. **Não usar scale agressivo** (o pré-DS v1 tinha `scale(1.02)` — substituído).
- **Hover de card:** borda accent + glow externo.
- **Press state:** apenas leve volta ao default sem `translateY`. Não há shrink.
- **Animação de fluxo no logo:** linhas tracejadas com `stroke-dashoffset` (16px ciclo, 2s linear) + dots pulsantes (`scale 1 → 1.2 → 1`, 2.5s).
- **Fade-in em scroll:** sutil, `translateY(8px) opacity(0)` → estado final.

### Transparência & blur
- **Sticky nav:** `bg-primary/80` + `backdrop-blur-md` + `saturate-180`. É o único uso de glass na marca.
- Accent translúcido aparece como `rgba(37,99,235, 0.10)` para fundos de badge e área de ícone.

### Focus / a11y
- **Focus visible:** `outline: 2px solid var(--accent-mid)` + `outline-offset: 2px`.
- Contraste mínimo WCAG AA validado nos pares text-primary/bg-primary e text-secondary/bg-secondary.

### Iconography — ver §6.

---

## 6. Iconography

A marca usa **Lucide React** como sistema único de ícones — escolhido pelo stroke fino (~1.5–2px), consistência métrica e estética moderna que combina com Geist. No codebase (`Site-Portfolio/components/sections/`), o uso aparece em:

```tsx
import { Compass, Cpu, GitMerge, Megaphone, Search, Users, GraduationCap,
         Wrench, Timer, ArrowRight, MessageCircle, Linkedin, Instagram,
         Menu, X } from "lucide-react";
```

**Padrões de uso:**
- Tamanho default: `18–22px`. Em botão: `18px`. Em card ícone-pílula: `22px`.
- Cor: `--accent-bright` (#60A5FA) para ícones ativos / decorativos; `--text-muted` para nav e social; cor herdada do botão para ícones inline.
- Sempre dentro de um container quadrado de `40×40` ou `44×44` com `border-radius: 8px`, fundo `--bg-tertiary` ou `--accent-subtle`, border `--border-subtle`.
- **Stroke fino é regra** — nunca usar ícones fill ou duotone.

**Neste UI kit (raster-free demo)** os ícones aparecem como **placeholders Unicode** (`◎ ✦ ▣ ⇌ ↗ 💬 ☰ ✕`) para evitar dependência de bundler. Em produção, **substituir todos por imports do `lucide-react`** correspondentes:
- `◎` → `<Compass />`
- `✦` → `<Megaphone />` (ou `<Sparkles />`)
- `▣` → `<Cpu />`
- `⇌` → `<GitMerge />`
- `↗` / `→` → `<ArrowRight />`
- `💬` → `<MessageCircle />`
- `☰` / `✕` → `<Menu />` / `<X />`

**Emoji em produção:** não. Unicode chars como ícones: não. Sempre Lucide.

### Logos & marca

| Arquivo | Uso |
|---|---|
| `assets/logo-pipeline-lockup.svg` | Lockup horizontal completo — pipeline + wordmark. Site, propostas, apresentações. |
| `assets/logo-pipeline-symbol.svg` | Símbolo isolado (sem trilhas externas) — header, footer, contextos compactos. |
| `assets/logo-pipeline-mono-white.svg` | Variação mono branca — quando o azul é proibido ou em peças B&W. |
| `assets/logo-pipeline-light.svg` | Light mode — fundos claros. |
| `assets/logo-favicon.svg` | Favicon — apenas o nó central S. Use em 16-32px. |
| `assets/logo-monogram-msb.svg` | **Concept 1 alternativo** — monograma geométrico. Backup direction. |

**Anatomia do logo principal (Concept 2):**
- **M (input)** — letra arredondada com três trilhas de entrada.
- **S (processador)** — círculo central maior, fill `#1E3A8A`, stroke `#3B82F6`.
- **B (output)** — letra arredondada com três trilhas de saída.
- Conexões em três camadas: linha sólida central + duas curvas tracejadas animadas + dots pulsantes representando dados em fluxo.

---

## 7. UI kits

### `ui_kits/website/`
Recreação hi-fi do site institucional em React (Babel in-browser). Abra `ui_kits/website/index.html` para ver tudo aplicado: header sticky, hero com grid + glow, para-quem-é, pilares, metodologia em 5 etapas, resultados com stats grandes, CTA final, footer.

Componentes:
- **Primitives.jsx** — `Container`, `SectionHeader`, `Button`, `EyebrowBar`, `Card`, `BrandMark`
- **Header.jsx** — nav sticky com brand mark e CTA
- **Hero.jsx** — hero completo com background grid + glow + CTAs + trust bar
- **Sections.jsx** — `ForWhom` e `Pillars`
- **Lower.jsx** — `Methodology`, `Results`, `FinalCTA`, `Footer`

Todos os componentes lêem dos tokens globais. Tipografia via classes utilitárias `msb-display`, `msb-h1`, `msb-h2`, `msb-h3`, `msb-body-lg`, `msb-body`, `msb-caption`, `msb-eyebrow`. Botões via `msb-btn` + `msb-btn--{primary,secondary,ghost}`.

---

## 8. Caveats & decisões em aberto

1. **Accent: azul vs. roxo.** Codebase + PRD original = roxo `#7C3AED`. Pré-DS v2.0 = azul `#2563EB`. **Este sistema segue azul.** Confirmar direção.
2. **Geist via Google Fonts.** Carregada via `@import` — não há `.ttf` local em `fonts/`. Em Next.js, usar `next/font/google` (já configurado em `tailwind.config.ts`).
3. **Ícones Unicode no UI kit.** Demo standalone (sem bundler) usa placeholders Unicode. Em produção: Lucide React. Mapping documentado em §6.
4. **Foto profissional, logos de clientes/empresas, depoimentos:** ainda pendentes (PRD §6). O UI kit usa fundo dark vazio com monograma "MB" em `accent/70` como placeholder na seção "Sobre" (omitida no demo atual).
5. **Concept 1 vs Concept 2.** O pré-DS já decidiu pelo **pipeline (Concept 2)**. O monograma geométrico (Concept 1) ficou como direção alternativa, em `assets/logo-monogram-msb.svg`.

---

**Última atualização:** Maio 2026 · v1.0
