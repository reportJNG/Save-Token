import type { RawRenderOutput } from '../adapter/PxpipeRenderer'
import type { RenderWorkerRequest, RenderWorkerResponse } from './render.worker'

/**
 * Thin promise-based client around render.worker.ts — the only place the app touches pxpipe's
 * (large) module graph from the main thread's perspective, and even here only through a
 * dynamically-imported fallback. Falls back to running the adapter directly on the main
 * thread if Workers aren't available (older browsers, some test environments).
 */
export class PxpipeRenderWorkerClient {
  private worker: Worker | null = null
  private nextId = 0
  private pending = new Map<number, { resolve: (output: RawRenderOutput) => void; reject: (error: unknown) => void }>()

  private static isSupported(): boolean {
    return typeof Worker !== 'undefined'
  }

  private ensureWorker(): Worker {
    if (!this.worker) {
      this.worker = new Worker(new URL('./render.worker.ts', import.meta.url), { type: 'module' })
      this.worker.onmessage = (event: MessageEvent<RenderWorkerResponse>) => {
        const entry = this.pending.get(event.data.id)
        if (!entry) return
        this.pending.delete(event.data.id)

        if (event.data.ok) {
          const { png, width, height, droppedChars } = event.data
          entry.resolve({ png, width, height, droppedChars })
        } else {
          entry.reject(new Error(event.data.message))
        }
      }
      this.worker.onerror = (event) => {
        const detail = event.message ? `${event.message} (${event.filename}:${event.lineno})` : 'Render worker crashed'
        const error = new Error(detail)
        for (const entry of this.pending.values()) entry.reject(error)
        this.pending.clear()
      }
    }
    return this.worker
  }

  async render(text: string): Promise<RawRenderOutput> {
    if (!PxpipeRenderWorkerClient.isSupported()) {
      const { renderWithPxpipeAdapter } = await import('../adapter/PxpipeRenderer')
      return renderWithPxpipeAdapter(text)
    }

    const worker = this.ensureWorker()
    const id = this.nextId++

    return new Promise<RawRenderOutput>((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      const request: RenderWorkerRequest = { id, text }
      worker.postMessage(request)
    })
  }
}
