import { create } from 'zustand'
import { renderText, type RenderResult } from '@/core/renderer'

export type RenderStatus = 'idle' | 'rendering' | 'done' | 'error'

export interface ExportState {
  status: RenderStatus
  result: RenderResult | null
  previewUrl: string | null
  error: string | null
  /** The source text `result` was rendered from — lets callers detect staleness after an edit. */
  renderedFromText: string | null
  generate: (text: string) => Promise<void>
  reset: () => void
}

export const useExportStore = create<ExportState>()((set, get) => ({
  status: 'idle',
  result: null,
  previewUrl: null,
  error: null,
  renderedFromText: null,

  generate: async (text) => {
    const previousUrl = get().previewUrl
    if (previousUrl) URL.revokeObjectURL(previousUrl)
    set({ status: 'rendering', result: null, previewUrl: null, error: null, renderedFromText: null })

    try {
      const result = await renderText(text)
      set({
        status: 'done',
        result,
        previewUrl: URL.createObjectURL(result.png),
        renderedFromText: text,
      })
    } catch (error) {
      set({ status: 'error', error: error instanceof Error ? error.message : 'Rendering failed' })
    }
  },

  reset: () => {
    const previousUrl = get().previewUrl
    if (previousUrl) URL.revokeObjectURL(previousUrl)
    set({ status: 'idle', result: null, previewUrl: null, error: null, renderedFromText: null })
  },
}))
