import type { CharacterCellConfig } from './characterMetrics'
import { compactResolution, exactResolution, type ResolutionMode, type ResolutionResult } from './resolution'

export interface PaginationConfig {
  cell: CharacterCellConfig
  mode: ResolutionMode
  targetAspect: number
  /** Largest single-image side allowed before the text must be split across pages. */
  maxPageWidth: number
  maxPageHeight: number
}

export interface Page extends ResolutionResult {
  index: number
  startChar: number
  /** Exclusive end offset into the source text. */
  endChar: number
}

export interface PaginationResult {
  pageCount: number
  pages: Page[]
  /** True when the text fit in a single image with no forced split. */
  singlePage: boolean
}

function resolve(characters: number, config: PaginationConfig, maxColumns?: number): ResolutionResult {
  return config.mode === 'exact'
    ? exactResolution(characters, config.cell, config.targetAspect)
    : compactResolution(characters, config.cell, config.targetAspect, maxColumns)
}

export function computePagination(characterCount: number, config: PaginationConfig): PaginationResult {
  if (characterCount < 1) {
    return { pageCount: 0, pages: [], singlePage: true }
  }

  const whole = resolve(characterCount, config)

  if (whole.width <= config.maxPageWidth && whole.height <= config.maxPageHeight) {
    return {
      pageCount: 1,
      singlePage: true,
      pages: [{ ...whole, index: 0, startChar: 0, endChar: characterCount }],
    }
  }

  const maxColumns = Math.floor(config.maxPageWidth / config.cell.width)
  const maxRows = Math.floor(config.maxPageHeight / config.cell.height)
  const pageCapacity = maxColumns * maxRows

  if (pageCapacity < 1) {
    throw new Error('Page dimensions are too small to fit a single character cell')
  }

  const pageCount = Math.ceil(characterCount / pageCapacity)
  const pages: Page[] = []

  for (let index = 0; index < pageCount; index++) {
    const startChar = index * pageCapacity
    const remaining = Math.min(pageCapacity, characterCount - startChar)
    const isFullPage = remaining === pageCapacity

    const geometry: ResolutionResult = isFullPage
      ? {
          characters: pageCapacity,
          columns: maxColumns,
          rows: maxRows,
          width: config.maxPageWidth,
          height: config.maxPageHeight,
          capacity: pageCapacity,
          unusedCells: 0,
          occupancy: 1,
          pixelArea: config.maxPageWidth * config.maxPageHeight,
        }
      : resolve(remaining, config, maxColumns)

    pages.push({
      ...geometry,
      index,
      startChar,
      endChar: startChar + remaining,
    })
  }

  return { pageCount, pages, singlePage: false }
}
