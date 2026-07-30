import type { CharacterCellConfig } from './characterMetrics'
import { DEFAULT_CELL, validateCellConfig } from './characterMetrics'

export type ResolutionMode = 'exact' | 'compact'

export interface ResolutionResult {
  characters: number
  columns: number
  rows: number
  width: number
  height: number
  /** columns * rows — total character slots in the grid. */
  capacity: number
  unusedCells: number
  /** 0..1 fraction of the grid actually holding characters. */
  occupancy: number
}

function buildResult(characters: number, columns: number, rows: number, cell: CharacterCellConfig): ResolutionResult {
  const width = columns * cell.width
  const height = rows * cell.height
  const capacity = columns * rows

  return {
    characters,
    columns,
    rows,
    width,
    height,
    capacity,
    unusedCells: capacity - characters,
    occupancy: capacity === 0 ? 0 : characters / capacity,
  }
}

/**
 * Mode 1 — exact factorization. Finds the divisor pair of `characters` whose
 * pixel-cell resolution is closest to `targetAspect`. Zero unused cells,
 * but may be extremely wide or tall when `characters` is prime.
 */
export function exactResolution(
  characters: number,
  cell: CharacterCellConfig = DEFAULT_CELL,
  targetAspect = 1,
): ResolutionResult {
  if (!Number.isSafeInteger(characters) || characters < 1) {
    throw new Error('characters must be a positive safe integer')
  }
  validateCellConfig(cell)

  let best: ResolutionResult | undefined
  let bestScore = Number.POSITIVE_INFINITY

  for (let divisor = 1; divisor * divisor <= characters; divisor++) {
    if (characters % divisor !== 0) continue

    const paired = characters / divisor
    const candidates: Array<[number, number]> = [
      [divisor, paired],
      [paired, divisor],
    ]

    for (const [columns, rows] of candidates) {
      const width = columns * cell.width
      const height = rows * cell.height
      const score = Math.abs(Math.log(width / height / targetAspect))

      if (score < bestScore) {
        bestScore = score
        best = buildResult(characters, columns, rows, cell)
      }
    }
  }

  return best as ResolutionResult
}

/**
 * Mode 2 — compact near-square fit. Never drops characters (capacity >= characters)
 * but may leave a handful of unused cells in the final row.
 */
export function compactResolution(
  characters: number,
  cell: CharacterCellConfig = DEFAULT_CELL,
  targetAspect = 1,
  maxColumns = Number.POSITIVE_INFINITY,
): ResolutionResult {
  if (!Number.isSafeInteger(characters) || characters < 1) {
    throw new Error('characters must be a positive safe integer')
  }
  validateCellConfig(cell)

  const idealColumns = Math.sqrt((characters * targetAspect * cell.height) / cell.width)
  const center = Math.min(Math.max(1, Math.round(idealColumns)), maxColumns)
  const radius = Math.max(64, Math.ceil(Math.sqrt(center)) + 4)

  const lowerBound = Math.max(1, center - radius)
  const upperBound = Math.min(maxColumns, center + radius)

  let best: ResolutionResult | undefined
  let bestScore: [number, number, number] | undefined

  for (let columns = lowerBound; columns <= upperBound; columns++) {
    const rows = Math.ceil(characters / columns)
    const width = columns * cell.width
    const height = rows * cell.height
    const aspectError = Math.abs(Math.log(width / height / targetAspect))
    const capacity = columns * rows
    const unusedCells = capacity - characters
    const score: [number, number, number] = [aspectError, unusedCells, width * height]

    const isBetter =
      !bestScore ||
      score[0] < bestScore[0] ||
      (score[0] === bestScore[0] && score[1] < bestScore[1]) ||
      (score[0] === bestScore[0] && score[1] === bestScore[1] && score[2] < bestScore[2])

    if (isBetter) {
      bestScore = score
      best = buildResult(characters, columns, rows, cell)
    }
  }

  return best as ResolutionResult
}
