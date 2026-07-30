# Formula documentation

All formulas below are implemented as pure functions in `src/core/` and
covered by unit tests in `*.test.ts` files next to them. Nothing in the
UI performs its own arithmetic — it only calls these functions.

## Character metrics (`core/layout/characterMetrics.ts`)

- **Characters**: `text.length` (every code unit counts, including
  spaces, punctuation, and control characters).
- **Words**: the trimmed text split on runs of whitespace (`0` for an
  empty/whitespace-only string).
- **Cell area**: `charWidth × charHeight`.
- **Total pixel area**: `characterCount × charWidth × charHeight`.

## Resolution (`core/layout/resolution.ts`)

Given `N` characters and a cell size `(cw, ch)`:

### Exact mode

Finds the divisor pair `(columns, rows)` of `N` — i.e. `columns × rows = N`
— whose pixel aspect ratio `(columns·cw) / (rows·ch)` is closest (in log
space) to the target aspect ratio. Guarantees **zero unused cells**, but
degenerates to a `1 × N` strip for prime `N`.

### Compact mode

Starts from the continuous ideal column count for a given aspect ratio:

```
idealColumns = √(N × targetAspect × ch / cw)
```

then searches a neighborhood of integer column counts, picking the one
that minimizes, in order: aspect-ratio error, unused cells, then total
pixel count. `rows = ceil(N / columns)`, so `columns × rows ≥ N` always
— **no characters are ever dropped**, at the cost of a few unused cells
in the final row.

## Grid placement (`core/layout/grid.ts`)

Character `i` (0-indexed) is placed at:

```
column = i mod columns
row    = floor(i / columns)
```

This index-based placement ignores the text's own line breaks — it's
what keeps the grid mathematically exact regardless of content. Control
characters (`\n`, `\t`, `\r`) are swapped for printable placeholders
before drawing; the character still occupies its cell, only its glyph
changes.

## Pagination (`core/layout/pagination.ts`)

1. Compute the resolution for the *whole* text.
2. If it fits within `maxPageWidth × maxPageHeight`, use one page.
3. Otherwise, compute `pageCapacity = floor(maxPageWidth / cw) × floor(maxPageHeight / ch)`
   and split the text into `ceil(N / pageCapacity)` pages. Every page but
   the last is a full `maxPageWidth × maxPageHeight` image; the last page
   is laid out with the same resolution algorithm at its own (smaller)
   remainder character count.

No character is ever counted twice or dropped across a page boundary —
enforced by a unit test that reassembles the offsets.

## Token estimation (`core/layout/tokenEstimator.ts`)

- **Text tokens**: `ceil(characters / 4.5)` — derived from ~6 characters
  per word and ~1.333 tokens per word (1 token ≈ 0.75 words).
- **Vision tokens** (GPT-5.6 `original`/`auto` patch calculation):
  `ceil(width / 32) × ceil(height / 32)` per page; the app sums this
  across all pages for a multi-page document.
- **Compression ratio**: `textTokens / visionTokens`.
- **Percent saved**: `(textTokens − visionTokens) / textTokens × 100`.
  This can be *negative* — a small amount of text rendered at a large
  resolution can cost more vision tokens than it would as plain text,
  and the UI surfaces that honestly rather than hiding it.

## OCR quality (`core/ocr/ocrQuality.ts`)

A heuristic score (0–100), not a guarantee, built from two curves:

- **Cell-size score**: larger character cells score higher (interpolated
  breakpoints from 8px → 15 to 32px → 100).
- **Dimension penalty**: images beyond ~4096px per side are penalized,
  since vision APIs typically downscale large images before tokenizing,
  which degrades legibility independent of how large you rendered the
  characters.

`score = clamp(cellSizeScore − dimensionPenalty, 0, 100)`, mapped to a
label: Excellent (≥90) / Good (≥70) / Average (≥50) / Poor (≥30) / Very
Poor (<30).

## Layout optimizer presets (`core/optimizer/optimizer.ts`)

Five named goals map to concrete `(cellWidth, cellHeight, mode,
maxPageWidth, maxPageHeight)` presets — e.g. "Best OCR" enlarges the cell
to 14×28px and allows bigger pages; "Smallest resolution" and "Lowest
token usage" shrink the cell to 6×12px, with the latter also using
smaller max-page bounds so more, smaller pages are preferred over one
huge one.
