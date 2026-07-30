/**
 * Character placement is purely index-based: character `i` sits at
 * column `i % columns`, row `floor(i / columns)`. This keeps the grid
 * mathematically exact regardless of the text's own line breaks —
 * implemented here as a straight fixed-width string slice per row,
 * which is equivalent to that index math without materializing a
 * per-character (column, row) tuple.
 */

/** Slices `text` into fixed-width rows of `columns` characters (last row may be shorter). */
export function chunkIntoRows(text: string, columns: number): string[] {
  if (columns < 1) throw new Error('columns must be at least 1')

  const rows: string[] = []
  for (let i = 0; i < text.length; i += columns) {
    rows.push(text.slice(i, i + columns))
  }
  return rows
}

/**
 * Control characters have no visible glyph in a monospace grid cell, so they
 * are swapped for a printable placeholder. The character still occupies its
 * cell — this only changes what gets drawn, never the character count.
 */
export function normalizeForRendering(char: string): string {
  switch (char) {
    case '\n':
      return '¶'
    case '\t':
      return '⇥'
    case '\r':
      return ' '
    default:
      return char
  }
}

export function rowsForRendering(text: string, columns: number): string[] {
  return chunkIntoRows(text, columns).map((row) => Array.from(row, normalizeForRendering).join(''))
}
