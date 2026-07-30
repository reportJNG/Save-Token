/// <reference lib="webworker" />
import type { PageDrawPlan } from '@/core/layout/imageGenerator'
import { renderPageOnCanvas } from './renderPage'
import type { ImageFormat } from './exportImage'
import { IMAGE_MIME } from './exportImage'

export interface RenderWorkerRequest {
  id: number
  plan: PageDrawPlan
  format: ImageFormat
  quality: number
}

export interface RenderWorkerResponse {
  id: number
  blob: Blob
}

const ctx = self as unknown as DedicatedWorkerGlobalScope

ctx.onmessage = async (event: MessageEvent<RenderWorkerRequest>) => {
  const { id, plan, format, quality } = event.data

  const canvas = new OffscreenCanvas(plan.canvasWidth, plan.canvasHeight)
  const canvasCtx = canvas.getContext('2d')
  if (!canvasCtx) throw new Error('OffscreenCanvas 2D context unavailable')

  renderPageOnCanvas(canvasCtx, plan)

  const blob = await canvas.convertToBlob({
    type: IMAGE_MIME[format],
    quality: format === 'png' ? undefined : quality,
  })

  const response: RenderWorkerResponse = { id, blob }
  ctx.postMessage(response)
}
