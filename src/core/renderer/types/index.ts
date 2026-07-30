import type { TextMetrics } from '@/core/text'

export interface RenderStatistics extends TextMetrics {
  textTokens: number
  visionTokens: number
  compressionRatio: number
  percentSaved: number
  /** Codepoints pxpipe's glyph atlas couldn't render (blank cells). */
  droppedChars: number
}

export interface RenderResult {
  png: Blob
  width: number
  height: number
  /** Wall-clock render time in milliseconds. */
  renderTime: number
  statistics: RenderStatistics
}
