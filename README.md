# Text → Image Context Compressor

Turns pasted text into mathematically laid-out, AI-readable images — the
kind of image you'd hand to a vision-enabled LLM instead of raw text, to
trade text tokens for (usually cheaper, sometimes not) vision tokens.

This is **not** an OCR tool and **not** a screenshot tool. It is a
resolution calculator + Canvas renderer: every character occupies a
fixed-size cell, the image dimensions are derived from character count
through pure math, and nothing about font size or layout is guessed.

Everything runs **entirely in the browser** — no backend, no network
calls, no server-side rendering.

## Quick start

```bash
npm install
npm run dev
```

Open the printed local URL, paste text into the input, and the preview,
statistics, token estimate, and OCR-quality read-out update live.

## What it does

Paste text into the one big box and press **Generate** — everything
else is automatic:

1. Counts characters, words, and lines, and estimates normal text tokens
   (`characters ÷ 4.5`) live as you type.
2. Computes the optimal pixel resolution for a monospace character grid
   at a balanced default cell size (10×20 px) — no manual tuning needed.
3. Splits the text across multiple pages automatically if the
   resolution would exceed a sane max page size.
4. Renders each page off the main thread (a Web Worker + `OffscreenCanvas`,
   falling back to synchronous rendering where unsupported) as PNG,
   JPEG, or WEBP, and shows you the resulting picture with a spinner
   while it works.
5. Estimates GPT-5.6-style vision tokens (`ceil(w/32) × ceil(h/32)` per
   page) and reports the compression ratio / percentage saved.
6. Scores expected OCR legibility from cell size and image dimensions.
7. Lets you download the image straight away, or open "More" for ZIP
   download, clipboard copy, and a JSON/Markdown report.

Every automatic choice is still overridable from the settings (gear)
icon if you want manual control over cell size, fonts, colors, or page
limits.

See [`docs/FORMULAS.md`](docs/FORMULAS.md) for the exact math and
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for how the codebase is
organized.

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · Radix primitives (styled
in the shadcn/ui convention) · Zustand · Canvas API · a dedicated Web
Worker for off-main-thread image export · Vitest.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check (`tsc -b`) and produce a production build |
| `npm run preview` | Preview the production build locally |
| `npm run test` | Run the Vitest unit tests |
| `npm run lint` | Run oxlint |

## Project layout

```
src/
  core/        pure, framework-free calculation engine (see docs/ARCHITECTURE.md)
  lib/         Canvas rendering + export utilities that consume the pure engine
  stores/      Zustand state (layout text, settings, export, history)
  hooks/       React glue between stores and the core engine
  components/
    ui/        shadcn-style Radix primitives
    features/  the app's actual feature components
```

## Browser support

Requires `<canvas>`, `Blob`, and the Clipboard API for the full feature
set. Image export uses `Worker` + `OffscreenCanvas` when available and
transparently falls back to synchronous main-thread rendering otherwise.

## Contributing

See [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md).
