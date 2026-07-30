import { analyzeText, estimateCompression } from '@/core/text'
import { PxpipeRenderWorkerClient } from '../workers/renderWorkerClient'
import type { RenderResult } from '../types'

const client = new PxpipeRenderWorkerClient()

/** The single rendering entry point the rest of the app calls. Everything downstream of pxpipe lives behind this. */
export async function renderText(text: string): Promise<RenderResult> {
  const start = performance.now()
  const raw = await client.render(text)
  const renderTime = performance.now() - start

  const metrics = analyzeText(text)
  const compression = estimateCompression(metrics.characterCount, raw.width, raw.height)

  return {
    png: new Blob([new Uint8Array(raw.png)], { type: 'image/png' }),
    width: raw.width,
    height: raw.height,
    renderTime,
    statistics: {
      ...metrics,
      ...compression,
      droppedChars: raw.droppedChars,
    },
  }
}
