import { describe, expect, it } from 'vitest'
import { compactResolution, exactResolution } from './resolution'

describe('exactResolution', () => {
  it('finds a zero-waste factor pair for a composite character count', () => {
    const result = exactResolution(20000, { width: 10, height: 20 })
    expect(result.columns * result.rows).toBe(20000)
    expect(result.unusedCells).toBe(0)
    expect(result.occupancy).toBe(1)
    expect(result.width).toBe(result.columns * 10)
    expect(result.height).toBe(result.rows * 20)
  })

  it('matches the doc-verified 1000 character example (40 x 25)', () => {
    const result = exactResolution(1000, { width: 10, height: 20 })
    expect(result.columns).toBe(40)
    expect(result.rows).toBe(25)
    expect(result.width).toBe(400)
    expect(result.height).toBe(500)
  })

  it('degrades to a 1 x N strip for prime character counts', () => {
    const result = exactResolution(9973, { width: 10, height: 20 })
    expect(result.columns * result.rows).toBe(9973)
    expect(result.unusedCells).toBe(0)
    expect([result.columns, result.rows]).toContain(1)
  })

  it('rejects non-positive or non-integer input', () => {
    expect(() => exactResolution(0)).toThrow()
    expect(() => exactResolution(-5)).toThrow()
    expect(() => exactResolution(1.5)).toThrow()
  })
})

describe('compactResolution', () => {
  it('never loses characters (capacity >= characters)', () => {
    const result = compactResolution(9973, { width: 10, height: 20 })
    expect(result.capacity).toBeGreaterThanOrEqual(9973)
    expect(result.unusedCells).toBeGreaterThanOrEqual(0)
  })

  it('produces a near-square image for a prime character count', () => {
    const result = exactResolution(9973, { width: 10, height: 20 })
    const compact = compactResolution(9973, { width: 10, height: 20 })
    const exactAspect = result.width / result.height
    const compactAspect = compact.width / compact.height
    expect(Math.abs(Math.log(compactAspect))).toBeLessThan(Math.abs(Math.log(exactAspect)))
  })

  it('respects an explicit column cap', () => {
    const result = compactResolution(50000, { width: 10, height: 20 }, 1, 100)
    expect(result.columns).toBeLessThanOrEqual(100)
    expect(result.capacity).toBeGreaterThanOrEqual(50000)
  })
})
