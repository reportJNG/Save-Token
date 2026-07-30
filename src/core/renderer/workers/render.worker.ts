/// <reference lib="webworker" />
import { renderWithPxpipeAdapter } from '../adapter/PxpipeRenderer'

export interface RenderWorkerRequest {
  id: number
  text: string
}

export type RenderWorkerResponse =
  | { id: number; ok: true; png: Uint8Array; width: number; height: number; droppedChars: number }
  | { id: number; ok: false; message: string }

const ctx = self as unknown as DedicatedWorkerGlobalScope

ctx.onmessage = async (event: MessageEvent<RenderWorkerRequest>) => {
  const { id, text } = event.data

  try {
    const { png, width, height, droppedChars } = await renderWithPxpipeAdapter(text)
    const response: RenderWorkerResponse = { id, ok: true, png, width, height, droppedChars }
    ctx.postMessage(response, [png.buffer])
  } catch (error) {
    const response: RenderWorkerResponse = {
      id,
      ok: false,
      message: error instanceof Error ? error.message : 'Rendering failed',
    }
    ctx.postMessage(response)
  }
}
