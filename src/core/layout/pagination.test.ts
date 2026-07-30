import { describe, expect, it } from 'vitest'
import { computePagination, type PaginationConfig } from './pagination'

const baseConfig: PaginationConfig = {
  cell: { width: 10, height: 20 },
  mode: 'compact',
  targetAspect: 1,
  maxPageWidth: 2048,
  maxPageHeight: 2048,
}

describe('computePagination', () => {
  it('returns a single page when the text fits within the page bounds', () => {
    const result = computePagination(5000, baseConfig)
    expect(result.singlePage).toBe(true)
    expect(result.pageCount).toBe(1)
    expect(result.pages[0].startChar).toBe(0)
    expect(result.pages[0].endChar).toBe(5000)
  })

  it('splits large text across multiple full pages plus a remainder page', () => {
    const maxColumns = Math.floor(2048 / 10)
    const maxRows = Math.floor(2048 / 20)
    const pageCapacity = maxColumns * maxRows
    const characterCount = pageCapacity * 2 + 500

    const result = computePagination(characterCount, baseConfig)

    expect(result.singlePage).toBe(false)
    expect(result.pageCount).toBe(3)
    expect(result.pages[0].width).toBe(2048)
    expect(result.pages[0].height).toBe(2048)
    expect(result.pages[2].characters).toBe(500)
  })

  it('never drops or duplicates a character across page boundaries', () => {
    const characterCount = 123456
    const result = computePagination(characterCount, baseConfig)

    const covered = result.pages.reduce((sum, page) => sum + (page.endChar - page.startChar), 0)
    expect(covered).toBe(characterCount)
    result.pages.forEach((page, i) => {
      if (i > 0) expect(page.startChar).toBe(result.pages[i - 1].endChar)
    })
  })

  it('returns an empty plan for empty text', () => {
    const result = computePagination(0, baseConfig)
    expect(result.pages).toHaveLength(0)
  })
})
