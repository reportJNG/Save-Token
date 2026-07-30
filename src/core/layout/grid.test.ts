import { describe, expect, it } from 'vitest'
import { chunkIntoRows, mapCharactersToGrid, normalizeForRendering, rowsForRendering } from './grid'

describe('mapCharactersToGrid', () => {
  it('places characters index-based across columns and rows', () => {
    const positions = mapCharactersToGrid('abcdef', 4)
    expect(positions).toHaveLength(6)
    expect(positions[3]).toEqual({ char: 'd', column: 3, row: 0, index: 3 })
    expect(positions[4]).toEqual({ char: 'e', column: 0, row: 1, index: 4 })
  })
})

describe('chunkIntoRows', () => {
  it('never drops a trailing partial row', () => {
    const rows = chunkIntoRows('abcdefg', 3)
    expect(rows).toEqual(['abc', 'def', 'g'])
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
