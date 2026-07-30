import type { PageDrawPlan } from '@/core/layout/imageGenerator'
import { renderPageToBlob, type ImageFormat } from './exportImage'
import type { RenderWorkerRequest, RenderWorkerResponse } from './render.worker'

/**
 * Thin promise-based client around render.worker.ts. Falls back to
 * synchronous main-thread rendering if Workers/OffscreenCanvas aren't
 * available (older browsers, some test environments).
 */
export class RenderWorkerClient {
  private worker: Worker | null = null
  private nextId = 0
  private pending = new Map<number, { resolve: (blob: Blob) => void; reject: (error: unknown) => void }>()

  private static isSupported(): boolean {
    return typeof Worker !== 'undefined' && typeof OffscreenCanvas !== 'undefined'
  }

  private ensureWorker(): Worker {
    if (!this.worker) {
      this.worker = new Worker(new URL('./render.worker.ts', import.meta.url), { type: 'module' })
      this.worker.onmessage = (event: MessageEvent<RenderWorkerResponse>) => {
        const entry = this.pending.get(event.data.id)
        if (entry) {
          entry.resolve(event.data.blob)
          this.pending.delete(event.data.id)
        }
      }
      this.worker.onerror = (event) => {
        for (const entry of this.pending.values()) entry.reject(event)
        this.pending.clear()
      }
    }
    return this.worker
  }

  async render(plan: PageDrawPlan, format: ImageFormat, quality = 0.92): Promise<Blob> {
    if (!RenderWorkerClient.isSupported()) {
      return renderPageToBlob(plan, format, quality)
    }

    const worker = this.ensureWorker()
    const id = this.nextId++

    return new Promise<Blob>((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      const request: RenderWorkerRequest = { id, plan, format, quality }
      worker.postMessage(request)
    })
  }
}
