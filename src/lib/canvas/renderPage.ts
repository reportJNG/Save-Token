import type { PageDrawPlan } from '@/core/layout/imageGenerator'

type Context2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

function drawRoundedRect(ctx: Context2D, x: number, y: number, width: number, height: number, radius: number): void {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2))
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + width, y, x + width, y + height, r)
  ctx.arcTo(x + width, y + height, x, y + height, r)
  ctx.arcTo(x, y + height, x, y, r)
  ctx.arcTo(x, y, x + width, y, r)
  ctx.closePath()
}

/**
 * Draws one page's characters into cell-aligned positions. Each glyph is
 * drawn individually (rather than as a row string) so its position always
 * matches the mathematical grid regardless of the font's own metrics.
 */
export function renderPageOnCanvas(ctx: Context2D, plan: PageDrawPlan): void {
  const { style, cell, rows, canvasWidth, canvasHeight } = plan
  const offsetX = style.margin + style.padding
  const offsetY = style.margin + style.padding

  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  if (!style.transparentBackground) {
    const rectX = style.margin
    const rectY = style.margin
    const rectW = canvasWidth - style.margin * 2
    const rectH = canvasHeight - style.margin * 2
    drawRoundedRect(ctx, rectX, rectY, rectW, rectH, style.cornerRadius)
    ctx.fillStyle = style.backgroundColor
    ctx.fill()
  }

  ctx.fillStyle = style.textColor
  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'

  const fontSize = Math.max(1, Math.floor(cell.height * 0.8))
  ctx.font = `${fontSize}px ${style.fontFamily}, monospace`

  rows.forEach((row, rowIndex) => {
    const y = offsetY + rowIndex * cell.height + (cell.height - fontSize) / 2
    for (let col = 0; col < row.length; col++) {
      const x = offsetX + col * cell.width
      ctx.fillText(row[col], x, y)
    }
  })
}
