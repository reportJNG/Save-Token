import type { CharacterCellConfig } from './characterMetrics'
import { rowsForRendering } from './grid'
import type { Page } from './pagination'

export interface RenderStyle {
  fontFamily: string
  textColor: string
  backgroundColor: string
  transparentBackground: boolean
  padding: number
  margin: number
  cornerRadius: number
}

export const DEFAULT_RENDER_STYLE: RenderStyle = {
  fontFamily: 'JetBrains Mono',
  textColor: '#0b0b0f',
  backgroundColor: '#ffffff',
  transparentBackground: false,
  padding: 24,
  margin: 0,
  cornerRadius: 0,
}

/**
 * Pure description of what to draw for one page — no Canvas/DOM here.
 * The rendering layer (src/lib/canvas) turns this into pixels.
 */
export interface PageDrawPlan {
  index: number
  rows: string[]
  columns: number
  rowCount: number
  cell: CharacterCellConfig
  gridWidth: number
  gridHeight: number
  canvasWidth: number
  canvasHeight: number
  style: RenderStyle
  characterCount: number
  startChar: number
  endChar: number
  unusedCells: number
  occupancy: number
}

export function buildDrawPlan(
  text: string,
  pages: Page[],
  cell: CharacterCellConfig,
  style: RenderStyle,
): PageDrawPlan[] {
  const frame = (style.padding + style.margin) * 2

  return pages.map((page) => {
    const slice = text.slice(page.startChar, page.endChar)
    const rows = rowsForRendering(slice, page.columns)

    return {
      index: page.index,
      rows,
      columns: page.columns,
      rowCount: page.rows,
      cell,
      gridWidth: page.width,
      gridHeight: page.height,
      canvasWidth: page.width + frame,
      canvasHeight: page.height + frame,
      style,
      characterCount: page.characters,
      startChar: page.startChar,
      endChar: page.endChar,
      unusedCells: page.unusedCells,
      occupancy: page.occupancy,
    }
  })
}
