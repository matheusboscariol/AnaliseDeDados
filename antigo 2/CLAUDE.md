# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project goal

Analyze the e-commerce data in `data/dados_ecommerce.xlsx` and produce an HTML dashboard styled with the MSB design system (`_design_system/`).

**Workflow** (from `.llm/prd.md`):
1. Inspect `dados_ecommerce.xlsx` — map each sheet, discover columns, and identify joins between sheets.
2. Compute KPIs in Python and save smaller derived files (CSV/JSON) instead of loading the full workbook into LLM context at once.
3. Feed those smaller KPI files into further analysis for deeper insights.
4. Build the final HTML dashboard using the design system tokens and UI patterns.

## Commands (antigo/ — reference only, do not modify)

The `antigo/` directory is a completed prior project (CSV sales-data cleaner). Run from inside it:

```bash
# Streamlit UI
streamlit run antigo/app.py

# CLI cleaner
python antigo/limpar_vendas.py

# pytest suite (expects antigo/data/planilha_vendas_corrigida.csv to exist)
pytest antigo/testar_vendas.py -v
```

The core logic lives in `antigo/limpeza.py` — `diagnosticar()`, `limpar()`, `validar()` — and can serve as a pattern for any new data-cleaning modules.

## Design system

All visual output must use **`_design_system/`**. Read `_design_system/README.md` first for the full specification. Key facts:

- **Stack:** Next.js 14 + Tailwind in production; HTML/Babel standalone for throwaway artifacts.
- **Accent color:** blue `#2563EB` (v2.0 — *not* the older purple `#7C3AED` found in some repo references).
- **Fonts:** Geist Sans (display, body) + Geist Mono (eyebrows, stats, mono code). Loaded via Google Fonts `@import` in `colors_and_type.css`.
- **Icons:** Lucide React only — no emoji, no Unicode placeholders in production.
- **Tokens:** all CSS variables are in `_design_system/colors_and_type.css` — drop this into any `<head>`.
- **UI kit:** `_design_system/ui_kits/website/index.html` is the live demo; component source in the same folder (`Primitives.jsx`, `Header.jsx`, `Hero.jsx`, `Sections.jsx`, `Lower.jsx`).
- **Skill:** invoking `msb-design` skill loads the design system context automatically.

For a standalone HTML artifact (the dashboard), paste `colors_and_type.css` inline, copy needed SVGs from `assets/`, and write static HTML using the utility classes documented in the UI kit.

## Architecture of the current project

```
data/dados_ecommerce.xlsx   ← source data (multiple sheets)
_design_system/             ← brand/visual system (read-only reference)
antigo/                     ← completed prior project (read-only reference)
.llm/prd.md                 ← project brief and workflow strategy
```

The project does **not** have a package manager, test runner, or build tool yet. As Python analysis scripts are created, follow the patterns from `antigo/limpeza.py`: pure functions, `list[dict]` as the data contract, and separate concerns (data logic vs. UI/output).

## Copy and language

All user-facing content (dashboard text, labels, section headers) must be in **Brazilian Portuguese**, following the MSB tone: direct, sober, concrete metrics over abstract claims. See `_design_system/README.md §4` for full copy guidelines.
