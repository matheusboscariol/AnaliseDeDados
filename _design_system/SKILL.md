---
name: msb-design
description: Use this skill to generate well-branded interfaces and assets for Matheus Boscariol Consultoria (MSB) — a Brazilian consultancy in digital marketing, processes, technology and AI for growing SMEs and early-stage startups. Use for production code, throwaway prototypes, slides, mocks, or any visual artifact in the MSB brand. Contains design tokens (colors, type, spacing), brand assets (pipeline logo system + favicon), Lucide iconography rules, and a full Next.js/React UI kit reconstructed in JSX.
user-invocable: true
---

# MSB Design Skill

Read `README.md` first — it contains:
- Full content fundamentals (tone, voice, microcopy patterns — most copy is in **Brazilian Portuguese**)
- Visual foundations (color, type, spacing, motion, hover/press states, motifs)
- Iconography (Lucide React only — no emoji in production)
- Logo system (pipeline M→S→B + alternative monogram)
- Caveats (notably: accent is **blue #2563EB** per v2.0, not the older purple #7C3AED in the codebase)

Then explore:
- `colors_and_type.css` — all design tokens as CSS variables, drop-in for any project
- `assets/` — SVG logos in every variant
- `preview/` — small reference cards for every token cluster
- `ui_kits/website/` — full React/Babel hi-fi reconstruction of the landing page; `index.html` is the live demo

## When invoked

If creating **visual artifacts** (slides, mocks, throwaway prototypes, presentations):
- Copy needed SVGs out of `assets/` into your artifact folder
- Paste `colors_and_type.css` into your `<head>` (or inline the tokens you need)
- Write static HTML with the utility classes documented in `ui_kits/website/index.html`
- Default to **dark-first** layouts; the blue accent is a scalpel, not a brush

If working on **production code** (the Next.js site):
- Read the codebase via `Site-Portfolio/` (mounted) or https://github.com/matheusboscariol/Site-Portfolio
- Match the existing Tailwind + Geist + Lucide patterns in `components/`
- Match the Portuguese voice from `Site-Portfolio/.llm/prd.md` and the existing section copy

If the user invokes this skill **without other guidance**, ask:
1. What are they building? (site section, slide deck, social asset, email, prototype…)
2. Audience and language? (default: Brazilian Portuguese for prospects; English for internal/dev)
3. Are they extending the existing landing page, or creating a new surface (proposal deck, case study, etc.)?
4. Do they want to riff on the brand or stay strict?

Then act as an expert designer who outputs **HTML artifacts or production code**, depending on the need — always grounded in the tokens, voice, and motifs documented here.
