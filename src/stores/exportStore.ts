import { create } from 'zustand'
import type { PageDrawPlan } from '@/core/layout/imageGenerator'
import { RenderWorkerClient } from '@/lib/canvas/renderWorkerClient'
import type { ImageFormat } from '@/lib/canvas/exportImage'

export type RenderStatus = 'idle' | 'rendering' | 'done' | 'error'

export interface RenderedPage {
  index: number
  blob: Blob
  url: string
}

export interface ExportState {
  status: RenderStatus
  renderedPages: RenderedPage[]
  error: string | null
  /** The source text the current `renderedPages` were rendered from — lets callers detect staleness after an edit. */
  renderedFromText: string | null
  renderAll: (pages: PageDrawPlan[], format: ImageFormat, quality: number, sourceText: string) => Promise<void>
  reset: () => void
}

const client = new RenderWorkerClient()

export const useExportStore = create<ExportState>()((set, get) => ({
  status: 'idle',
  renderedPages: [],
  error: null,
  renderedFromText: null,

  renderAll: async (pages, format, quality, sourceText) => {
    get().renderedPages.forEach((page) => URL.revokeObjectURL(page.url))
    set({ status: 'rendering', renderedPages: [], error: null, renderedFromText: null })

    try {
      const rendered = await Promise.all(
        pages.map(async (plan) => {
          const blob = await client.render(plan, format, quality)
          return { index: plan.index, blob, url: URL.createObjectURL(blob) }
        }),
      )
      set({
        status: 'done',
        renderedPages: rendered.sort((a, b) => a.index - b.index),
        renderedFromText: sourceText,
      })
    } catch (error) {
      set({ status: 'error', error: error instanceof Error ? error.message : 'Rendering failed' })
    }
  },

  reset: () => {
    get().renderedPages.forEach((page) => URL.revokeObjectURL(page.url))
    set({ status: 'idle', renderedPages: [], error: null, renderedFromText: null })
  },
}))
