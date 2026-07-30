# Contributing / developer guide

## Setup

```bash
npm install
npm run dev
```

## Before opening a PR

```bash
npm run lint
npm run test
npm run build
```

All three must pass. `npm run build` runs `tsc -b` first — the project
has **strict TypeScript with no `any`**, so a failing build usually means
a real type gap, not a config issue.

## Ground rules

- **`src/core/` stays pure.** No React, DOM, or Canvas imports in
  `core/layout`, `core/ocr`, or `core/optimizer`. If a function needs
  `document`/`canvas`/a React hook, it belongs in `lib/` or `hooks/`,
  not `core/`.
- **No calculations in components.** If you find yourself computing a
  resolution, token count, or OCR score inline inside a `.tsx` file,
  move it into `core/` and expose it through a hook (see
  `hooks/useLayoutPlan.ts` for the pattern).
- **No magic numbers.** Constants like the 4.5 chars/token ratio or the
  32px patch size are named exports in `core/layout/tokenEstimator.ts` —
  reuse them rather than re-deriving a number inline.
- **Every new formula gets a test.** Pure functions in `core/` are cheap
  to test exhaustively; there's no excuse not to.

## Adding a feature component

Feature components live in `src/components/features/` and receive
already-computed data (a `LayoutPlan`, a settings slice, etc.) as props
— they read from stores/hooks, they don't compute. Look at
`StatisticsCard.tsx` for the minimal shape, or `SettingsDialog.tsx` for
a more involved example wired directly to `useSettingsStore()`.

## Adding a UI primitive

Primitives in `src/components/ui/` follow the shadcn/ui convention:
Radix primitive + Tailwind classes composed with `cn()` from
`src/lib/utils.ts`, variants expressed with `class-variance-authority`.
Keep them free of app-specific logic — they should be reusable in any
project.

## Commit style

Small, focused commits. If a change touches both `core/` math and a
component that consumes it, prefer separating the formula change (with
its test) from the UI change that surfaces it.
