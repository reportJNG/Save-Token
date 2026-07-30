import { describe, expect, it } from 'vitest'
import { estimateCompression, estimateTextTokens, estimateVisionTokens, patchCount } from './tokenEstimator'

describe('estimateTextTokens', () => {
  it('rounds up characters / 4.5', () => {
    expect(estimateTextTokens(30000)).toBe(6667)
    expect(estimateTextTokens(9)).toBe(2)
  })
})

describe('patchCount', () => {
  it('ceils pixel size to the nearest 32px patch', () => {
    expect(patchCount(32)).toBe(1)
    expect(patchCount(33)).toBe(2)
    expect(patchCount(2464)).toBe(77)
  })
})

describe('estimateVisionTokens', () => {
  it('matches the doc-verified 2464x2464 example (77 x 77 = 5929)', () => {
    expect(estimateVisionTokens(2464, 2464)).toBe(5929)
  })
})

describe('estimateCompression', () => {
  it('matches the doc-verified 5,000 word / 30,000 char example', () => {
    const result = estimateCompression(30000, 2464, 2464)
    expect(result.textTokens).toBe(6667)
    expect(result.visionTokens).toBe(5929)
    expect(result.percentSaved).toBeCloseTo(11.07, 1)
  })

  it('reports negative savings when the image is more expensive than text', () => {
    const result = estimateCompression(10, 4096, 4096)
    expect(result.percentSaved).toBeLessThan(0)
  })
})
