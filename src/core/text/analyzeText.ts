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
