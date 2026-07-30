import { describe, expect, it } from 'vitest'
import { chunkIntoRows, normalizeForRendering, rowsForRendering } from './grid'

describe('chunkIntoRows', () => {
  it('never drops a trailing partial row', () => {
    const rows = chunkIntoRows('abcdefg', 3)
    expect(rows).toEqual(['abc', 'def', 'g'])
  })

  it('places characters index-based across columns and rows', () => {
    // Row i holds characters [i*columns, (i+1)*columns) — equivalent to
    // placing character k at column k%columns, row floor(k/columns).
    const rows = chunkIntoRows('abcdef', 4)
    expect(rows).toEqual(['abcd', 'ef'])
  })
})

describe('normalizeForRendering', () => {
  it('swaps control characters for printable placeholders without changing count', () => {
    expect(normalizeForRendering('\n')).toBe('¶')
    expect(normalizeForRendering('\t')).toBe('⇥')
    expect(normalizeForRendering('a')).toBe('a')
  })
})

describe('rowsForRendering', () => {
  it('produces one printable row string per chunk', () => {
    const rows = rowsForRendering('ab\ncd', 3)
    expect(rows).toEqual(['ab¶', 'cd'])
  })
})
