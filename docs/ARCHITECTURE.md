# Architecture

## Layering

```
core/            pure functions — no React, no DOM, no Canvas
  layout/        character metrics, resolution, grid, pagination, tokens, draw plans
  ocr/           OCR legibility heuristic
  optimizer/     named goal → concrete layout config presets (used for the default "balanced" config)

lib/             framework-adjacent utilities that consume core/
  canvas/        turns a pure draw plan into actual pixels (Canvas API + Worker)
  export/        download / ZIP / clipboard / report-generation utilities

stores/          Zustand — state only, no calculation logic
  layoutStore    the raw pasted text
  settingsStore  every configurable knob, defaulted + persisted to localStorage
  exportStore    render-to-blob status + the rendered blobs themselves

hooks/           the *only* place core/ functions are called from React
  useLayoutPlan  text + settings → LayoutPlan (memoized)
  useOcrQuality  plan + settings → OcrQualityResult (memoized)
  useTheme       applies the theme preference to the document root

components/
  ui/            shadcn/ui-style Radix primitives (Button, Card, Dialog, ...)
  features/      the app's actual feature components (see below)
```

This is a strict one-way dependency chain:
`components → hooks → stores → lib → core`. `core/` never imports
anything above it, which is what makes it trivially unit-testable and
reusable outside a browser (e.g. from a CLI or a different framework)
if that's ever needed.

## The UI is intentionally one screen

The product surface is deliberately small: a single textarea and a
Generate button (`GeneratePanel.tsx`). There's no per-request layout
configuration in the primary flow — `settingsStore` already defaults to
the "balanced" optimizer preset, so the engine picks cell size,
resolution mode, and page limits automatically. A gear icon in the
toolbar (`SettingsDialog.tsx`) exposes every knob for anyone who wants
to override the automatic choice, but it's opt-in, not required.

`GeneratePanel` covers the whole loop:

1. Text goes into `layoutStore` from a plain controlled `<Textarea>` —
   the only validation rule is a length cap, checked inline, so there's
   no form-library indirection for a single free-text field.
2. `useLayoutPlan()` recomputes a `LayoutPlan` live, on every keystroke,
   and a small stats line shows the running token/compression numbers.
3. The **Generate** button is disabled until there's text and re-disables
   itself (showing a spinner) for the duration of the render — it only
   becomes pressable again once the previous render has actually
   produced blobs or failed.
4. Once rendering finishes, the resulting image is shown directly (with
   page navigation if the text paginated) alongside a Download button.
   `ExportDialog` ("More") holds the secondary actions — ZIP, clipboard,
   JSON/Markdown report — and only enables once images exist.

## Why the engine is pure

Every mathematical decision — grid dimensions, pagination boundaries,
token counts, OCR score — is implemented as a pure function that takes
plain data in and returns plain data out. This means:

- The entire engine is tested with Vitest without touching the DOM.
- `generateLayoutPlan()` (`core/layout/index.ts`) is the single entry
  point that composes every stage of the pipeline; nothing about the
  layout is decided ad hoc inside a component.
- The Canvas-drawing step (`lib/canvas/renderPage.ts`) is a thin
  consumer of a `PageDrawPlan` — it has no decisions left to make, only
  pixels left to paint.

## Where calculations actually happen

Per the project's guiding rule ("never put calculations inside
components"), the only two places that call into `core/` from React are:

- `useLayoutPlan()` — recomputed via `useMemo` whenever the text or any
  layout-affecting setting changes.
- `useOcrQuality()` — derived from the plan's first page and the current
  cell size.

Every feature component receives an already-computed `LayoutPlan` (or a
slice of one) as a prop/store value and only renders it.

## Rendering pipeline

1. `useLayoutPlan()` builds a `LayoutPlan`: metrics, pagination, and one
   `PageDrawPlan` per page (rows of characters + geometry + style — pure
   data, no pixels yet).
2. Pressing **Generate** calls `exportStore.renderAll()`, which sends
   every `PageDrawPlan` to `RenderWorkerClient` → `render.worker.ts`,
   where an `OffscreenCanvas` renders it and returns a `Blob` off the
   main thread — so a huge document doesn't freeze the UI while it
   renders. If `Worker`/`OffscreenCanvas` isn't available, it
   transparently falls back to synchronous main-thread rendering.
3. The resulting object URLs are handed straight to an `<img>` in
   `GeneratePanel` — there's no separate live-preview canvas to keep in
   sync; the picture the user sees *is* the exported image.

## The Web Worker and TypeScript's `lib` conflict

`render.worker.ts` needs `WebWorker` lib types (`DedicatedWorkerGlobalScope`,
`OffscreenCanvas`'s worker-side APIs) while the rest of the app needs
`DOM` lib types. These two lib sets historically conflict on ambient
globals like `self`. This project resolves it with a **separate
TypeScript project** (`tsconfig.worker.json`, referenced from the root
`tsconfig.json`) scoped to `src/**/*.worker.ts`, with both `DOM` and
`WebWorker` libs enabled — which TypeScript accepts without the global
mangling that occurs when a *non-worker* file mixes them. `tsconfig.app.json`
excludes worker files from its own type-checking pass so the two
configurations never fight over the same file's meaning of `self`.

## Error handling

Three layers, each catching a different kind of failure:

- **`ErrorBoundary`** (`src/components/ErrorBoundary.tsx`), wrapping the
  whole app in `main.tsx` — catches unexpected render-time crashes and
  shows a recovery screen instead of a white page. Text isn't lost on
  recovery since `layoutStore` lives outside the React tree.
- **`exportStore.error`** — surfaces failures from the render pipeline
  itself (a worker error, an unsupported format) directly in
  `GeneratePanel`, with the actual error message shown, not swallowed.
- **Per-action try/catch in `ExportDialog`** — every secondary export
  action (clipboard copy, ZIP build, report export) is wrapped
  individually so one failing action (e.g. clipboard permission denied)
  can't silently no-op or throw an unhandled rejection; each shows
  success/error feedback inline.

`lib/export/clipboard.ts` throws a specific, readable error ("Clipboard
access is not available...") when `navigator.clipboard` or
`ClipboardItem` is missing, rather than letting the underlying
`TypeError` leak through.

## State ownership

- **`layoutStore`**: exactly one field, the raw text. Kept separate from
  settings so pasting a huge document doesn't re-render every settings
  control.
- **`settingsStore`**: every layout/style/export knob, defaulted to the
  "balanced" preset and persisted to `localStorage` via Zustand's
  `persist` middleware so any manual override survives a reload.
- **`exportStore`**: owns the async rendering workflow and the resulting
  object URLs (revoked on every new render pass and on reset, to avoid
  leaking memory).

## Adding a new optimizer goal

1. Add the goal to the `OptimizerGoal` union in `core/optimizer/optimizer.ts`.
2. Add a concrete preset to the `PRESETS` record in the same file.
3. Call `settingsStore.applyOptimizerPreset(goal)` from wherever it
   should be surfaced (currently only `'balanced'` is used, as the
   default — the other presets exist and are tested but aren't wired
   into the simplified UI).

## Adding a new export format

1. Extend the `ImageFormat` union in `lib/canvas/exportImage.ts` and its
   `IMAGE_MIME` / `IMAGE_EXTENSION` maps.
2. Add the option to the format `<Select>` in `SettingsDialog.tsx`.
   `canvasToBlob` / the render worker already dispatch on `ImageFormat`
   generically, so no further changes are needed.
