export type OcrQualityLabel = 'Excellent' | 'Good' | 'Average' | 'Poor' | 'Very Poor'

export interface OcrQualityInput {
  cellWidth: number
  cellHeight: number
  imageWidth: number
  imageHeight: number
}

export interface OcrQualityResult {
  label: OcrQualityLabel
  /** 0-100, higher is better. */
  score: number
  reasons: string[]
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** Linear interpolation across a sorted set of (x, y) breakpoints. */
function interpolate(x: number, points: Array<[number, number]>): number {
  if (x <= points[0][0]) return points[0][1]
  const last = points[points.length - 1]
  if (x >= last[0]) return last[1]

  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i]
    const [x1, y1] = points[i + 1]
    if (x >= x0 && x <= x1) {
      const t = (x - x0) / (x1 - x0)
      return y0 + t * (y1 - y0)
    }
  }
  return last[1]
}

/** Bigger character cells render legibly at higher fidelity — this is the dominant factor. */
function cellSizeScore(cellHeight: number): number {
  return interpolate(cellHeight, [
    [8, 15],
    [12, 45],
    [16, 65],
    [20, 85],
    [24, 95],
    [32, 100],
  ])
}

/** Vision APIs downscale very large images before tokenizing, degrading legibility. */
function dimensionPenalty(maxSide: number): number {
  return interpolate(maxSide, [
    [2048, 0],
    [4096, 5],
    [6144, 15],
    [8192, 30],
    [12288, 50],
  ])
}

function labelFor(score: number): OcrQualityLabel {
  if (score >= 90) return 'Excellent'
  if (score >= 70) return 'Good'
  if (score >= 50) return 'Average'
  if (score >= 30) return 'Poor'
  return 'Very Poor'
}

export function assessOcrQuality(input: OcrQualityInput): OcrQualityResult {
  const maxSide = Math.max(input.imageWidth, input.imageHeight)
  const baseScore = cellSizeScore(input.cellHeight)
  const penalty = dimensionPenalty(maxSide)
  const score = clamp(baseScore - penalty, 0, 100)

  const reasons: string[] = []
  if (input.cellHeight < 16) {
    reasons.push('Character cells are small — glyphs may blur together at scan resolution.')
  }
  if (input.cellWidth / input.cellHeight < 0.4) {
    reasons.push('Cell aspect ratio is very narrow, which can compress glyph shapes.')
  }
  if (maxSide > 4096) {
    reasons.push('Image dimensions exceed 4096px — vision models typically downscale before reading it.')
  }
  if (reasons.length === 0) {
    reasons.push('Character size and image dimensions are within a comfortable OCR range.')
  }

  return { label: labelFor(score), score: Math.round(score), reasons }
}
