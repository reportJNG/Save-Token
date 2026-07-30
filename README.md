# Text → Image Context Compressor

Turns pasted text into a dense, AI-readable PNG — the kind of image
you'd hand to a vision-enabled LLM instead of raw text, to trade text
tokens for (usually cheaper, sometimes not) vision tokens.

This is **not** an OCR tool and **not** a screenshot tool. Rendering is
handled entirely by [pxpipe](https://github.com/teamchong/pxpipe)'s
text-to-PNG renderer — a pure-JS bitmap-font rasterizer with no Canvas
or Node dependency at render time — via a single adapter boundary
(`src/core/renderer/`). This app supplies the UI, the live text
statistics, and the token/compression estimates; pxpipe decides every
pixel.

Everything runs **entirely in the browser** — no backend, no network
calls, no server-side rendering. pxpipe's renderer runs off the main
thread in a Web Worker so the UI never blocks while an image is
generated.

## Quick start

The `pxpipe/` folder is a vendored, trimmed copy of [pxpipe](https://github.com/teamchong/pxpipe)'s
core text-to-PNG renderer, not an npm package — this app imports its **built** output directly
(`pxpipe/dist/`) via a relative path rather than installing it as an npm dependency. Trimmed
means only `src/core/` (the browser-safe renderer) is vendored here; upstream pxpipe's CLI,
Cloudflare Worker, dashboard, and eval/test suites aren't needed and aren't included — see
`pxpipe/README.md`. `dist/` isn't committed, so build pxpipe once before the app can run:

```bash
cd pxpipe && npm install && npm run build && cd ..
npm install
npm run dev
```

Open the printed local URL, paste text into the input, and the character/
word/text-token counter updates live as you type.

## What it does

Paste text into the one big box and press **Generate** — everything
else is automatic:

1. Counts characters, words, and lines, and estimates normal text tokens
   (`characters ÷ 4.5`) live as you type — no rendering involved yet.
2. Input is capped at pxpipe's own single-image character budget, so
   generation never splits into multiple pictures.
3. Hands the text to pxpipe's renderer inside a Web Worker (falling back
   to the main thread where Workers are unsupported), which lays out,
   rasterizes, and PNG-encodes it — no Canvas, no font/cell/spacing
   settings to tune.
4. Estimates GPT-5.6-style vision tokens (`ceil(w/32) × ceil(h/32)`) from
   the PNG pxpipe returns, and reports the compression ratio / percentage
   saved compared to text tokens.
5. Shows the resulting picture immediately, with a Download button.

There are no rendering settings anywhere in the UI — pxpipe decides
cell size, font, canvas dimensions, and spacing automatically.

See [`docs/FORMULAS.md`](docs/FORMULAS.md) for the statistics this app
still computes itself and [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
for how the codebase (and the pxpipe integration boundary) is organized.

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · Radix primitives (styled
in the shadcn/ui convention) · Zustand · [pxpipe](https://github.com/teamchong/pxpipe)
(vendored, trimmed to its core renderer, at `./pxpipe` — its built output
imported by relative path, see "Quick start") for rendering · a dedicated
Web Worker to keep rendering off the main thread · Vitest.

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
  core/
    text/      pure text statistics (chars/words/lines, token estimation) — no pxpipe
    renderer/  the pxpipe integration boundary (see docs/ARCHITECTURE.md):
               pxpipe/ (the only file that imports pxpipe) → adapter/ → workers/ → service/
  lib/export/  download + clipboard utilities, format-agnostic
  stores/      Zustand state (layout text, theme, export status/result)
  hooks/       React glue between stores and core/
  components/
    ui/        shadcn-style Radix primitives
    features/  the app's actual feature components (InputScreen, ResultScreen)
pxpipe/        vendored, trimmed pxpipe core — just the rendering engine (src/core/)
```

## Browser support

Requires `Blob` and the Clipboard API for the full feature set, plus
`CompressionStream` (used internally by pxpipe's PNG encoder — supported
in all current evergreen browsers). Rendering uses a `Worker` when
available and transparently falls back to running on the main thread
otherwise.

## Contributing

See [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md).
