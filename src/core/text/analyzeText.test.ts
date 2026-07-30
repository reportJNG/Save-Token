import { describe, expect, it } from 'vitest'
import { analyzeText } from './analyzeText'

describe('analyzeText', () => {
  it('counts characters, words, and lines', () => {
    expect(analyzeText('hello world\nsecond line')).toEqual({
      characterCount: 23,
      wordCount: 4,
      lineCount: 2,
    })
  })

  it('treats an empty string as zero of everything', () => {
    expect(analyzeText('')).toEqual({ characterCount: 0, wordCount: 0, lineCount: 0 })
  })

  it('treats whitespace-only text as zero words but nonzero characters/lines', () => {
    expect(analyzeText('   \n  ')).toEqual({ characterCount: 6, wordCount: 0, lineCount: 2 })
  })

  it('normalizes CRLF and lone CR the same as LF for line counting', () => {
    expect(analyzeText('a\r\nb\rc\nd').lineCount).toBe(4)
  })
})
