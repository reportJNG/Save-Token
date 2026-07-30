import type { PageDrawPlan } from '@/core/layout/imageGenerator'
import { renderPageOnCanvas } from './renderPage'

export type ImageFormat = 'png' | 'jpeg' | 'webp'

export const IMAGE_MIME: Record<ImageFormat, string> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
}

export const IMAGE_EXTENSION: Record<ImageFormat, string> = {
  png: 'png',
  jpeg: 'jpg',
  webp: 'webp',
}

export function createPageCanvas(plan: PageDrawPlan): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = plan.canvasWidth
  canvas.height = plan.canvasHeight

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas context unavailable')

  renderPageOnCanvas(ctx, plan)
  return canvas
}

export function canvasToBlob(canvas: HTMLCanvasElement, format: ImageFormat, quality = 0.92): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas export failed'))),
      IMAGE_MIME[format],
      format === 'png' ? undefined : quality,
    )
  })
}

export async function renderPageToBlob(plan: PageDrawPlan, format: ImageFormat, quality = 0.92): Promise<Blob> {
  const canvas = createPageCanvas(plan)
  return canvasToBlob(canvas, format, quality)
}

export function pageFileName(index: number, pageCount: number, format: ImageFormat): string {
  const padded = pageCount > 1 ? `-page-${String(index + 1).padStart(2, '0')}` : ''
  return `text-image${padded}.${IMAGE_EXTENSION[format]}`
}
