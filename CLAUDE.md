# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server with HMR at localhost:5173
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

No test framework is configured.

## Architecture

Single-page React 19 app (Vite, plain JavaScript/JSX, no TypeScript) that provides a search UI over the Scryfall Magic: The Gathering card API.

**Entry point chain:** `index.html` → `src/main.jsx` → `src/scryfall-catalog.jsx`

`src/scryfall-catalog.jsx` contains essentially the entire application in one file (~580 lines):

- **Constants** at the top: `COLORS`, `TYPES`, `RARITIES`, `FORMATS`, color/rarity palette maps
- **`buildQuery()`** — assembles the Scryfall search query string from active filter state
- **Inline components** — `CardSkeleton`, `CardItem`, `CardModal`, `Pill`
- **`ScryfallCatalog`** — root component owning all state and filter logic

**API:** Direct `fetch()` to `https://api.scryfall.com/cards/search?q={query}`. Pagination is handled via the `next_page` URL returned by the API.

**Styling:** All inline styles, dark theme. No CSS modules, no component library, no Tailwind.

`src/App.jsx` and `src/App.css` are unused Vite template artifacts.
