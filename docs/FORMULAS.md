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

### A note on tied factor pairs

Some character counts have two factor pairs whose aspect ratios are
exact reciprocals of one another (e.g. 2,000 characters: 25×80 → 800×500
and 40×50 → 500×800 are both `|log(aspect)| ≈ 0.47` from square). Both are
equally optimal zero-waste layouts, and — because `ceil(w/32)·ceil(h/32)`
is symmetric under swapping `w` and `h` — they cost the **same number of
vision tokens** either way. `exactResolution`'s tie-break (first divisor
found, ascending) picks a specific orientation deterministically; a
golden-data test (`exactFitTable.golden.test.ts`, transcribed from an
external reference table) checks this explicitly for the two character
counts in its table where a tie occurs, asserting score-equivalence
rather than a specific orientation.

## Square estimate (`core/layout/squareResolution.ts`)

A cheaper, non-grid-tracking estimate used for quick word-count
comparisons: treat the required pixel area as a perfect square and round
its side up to the nearest patch boundary.

```
area = N × cw × ch
side = ceil(√area / patchSize) × patchSize
```

This is deliberately simpler than `exactResolution`/`compactResolution`
— it doesn't produce an actual character grid, only a sizing estimate —
and is what `computeWordComparison` (`core/layout/wordComparison.ts`)
uses for its "equivalent square resolution" column, alongside the real
pagination engine for its "recommended pages" column.

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
   the last is a full, zero-waste `maxPageWidth × maxPageHeight` image
   (`pageCapacity` characters exactly fill it by construction).

No character is ever counted twice or dropped across a page boundary —
enforced by a unit test that reassembles the offsets.

### Why the last page always uses compact mode

The default resolution mode is **"exact"** (zero unused cells) — see
[the note above](#a-note-on-tied-factor-pairs) and `settingsStore`'s
default. But the *last, partial* page's remainder count is whatever's
left over, and exact factorization of an arbitrary (possibly prime)
number can degenerate to a `1 × N` strip far wider or taller than the
page-size cap this pagination step exists to enforce. So regardless of
the configured mode, the last page always uses `compactResolution`
bounded to `maxColumns` — staying within the page-size cap takes
priority over zero waste on that one page. A regression test
(`pagination.test.ts`) covers this with a deliberately prime remainder.

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
