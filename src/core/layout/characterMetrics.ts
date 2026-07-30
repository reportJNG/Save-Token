export interface TextMetrics {
  characterCount: number
  wordCount: number
  lineCount: number
}

/** Splits on runs of whitespace; an empty/whitespace-only string has zero words. */
export function analyzeText(text: string): TextMetrics {
  const trimmed = text.trim()
  const wordCount = trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length
  const lineCount = text.length === 0 ? 0 : text.split(/\r\n|\r|\n/).length

  return {
    characterCount: text.length,
    wordCount,
    lineCount,
  }
}

export interface CharacterCellConfig {
  width: number
  height: number
}

export const DEFAULT_CELL: CharacterCellConfig = { width: 10, height: 20 }

export function cellArea(cell: CharacterCellConfig): number {
  return cell.width * cell.height
}

/** Total pixel area required to render `characterCount` characters at the given cell size. */
export function totalPixelArea(characterCount: number, cell: CharacterCellConfig): number {
  return characterCount * cellArea(cell)
}

export function validateCellConfig(cell: CharacterCellConfig): void {
  if (!Number.isFinite(cell.width) || cell.width <= 0) {
    throw new Error('Character cell width must be a positive finite number')
  }
  if (!Number.isFinite(cell.height) || cell.height <= 0) {
    throw new Error('Character cell height must be a positive finite number')
  }
}
