import { describe, expect, it } from 'vitest'
import { renderText } from './renderService'

describe('renderText', () => {
  it('returns a PNG blob, dimensions, timing, and statistics', async () => {
    const result = await renderText('The quick brown fox jumps over the lazy dog.')

    expect(result.png).toBeInstanceOf(Blob)
    expect(result.png.type).toBe('image/png')
    expect(result.png.size).toBeGreaterThan(0)
    expect(result.width).toBeGreaterThan(0)
    expect(result.height).toBeGreaterThan(0)
    expect(result.renderTime).toBeGreaterThanOrEqual(0)

    expect(result.statistics.characterCount).toBe(44)
    expect(result.statistics.wordCount).toBe(9)
    expect(result.statistics.lineCount).toBe(1)
    expect(result.statistics.textTokens).toBeGreaterThan(0)
    expect(result.statistics.visionTokens).toBeGreaterThan(0)
  })
})
