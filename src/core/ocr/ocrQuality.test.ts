import { describe, expect, it } from 'vitest'
import { assessOcrQuality } from './ocrQuality'

describe('assessOcrQuality', () => {
  it('rates large cells at a small image size as excellent', () => {
    const result = assessOcrQuality({ cellWidth: 16, cellHeight: 32, imageWidth: 1024, imageHeight: 1024 })
    expect(result.label).toBe('Excellent')
  })

  it('rates small cells at a huge image size as very poor', () => {
    const result = assessOcrQuality({ cellWidth: 4, cellHeight: 8, imageWidth: 12000, imageHeight: 12000 })
    expect(result.label).toBe('Very Poor')
  })

  it('score stays within 0-100 bounds', () => {
    const result = assessOcrQuality({ cellWidth: 100, cellHeight: 200, imageWidth: 100, imageHeight: 100 })
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
  })
})
