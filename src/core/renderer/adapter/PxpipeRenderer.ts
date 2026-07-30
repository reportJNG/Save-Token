import { renderWithPxpipe } from '../pxpipe/pxpipeClient'

export interface RawRenderOutput {
  png: Uint8Array
  width: number
  height: number
  /** Codepoints pxpipe's glyph atlas couldn't render (blank cells). */
  droppedChars: number
}

/**
 * Normalizes pxpipe's paginated output into this app's single-image contract. The app caps
 * input length (see `pxpipe/constants.ts`) so a page split should never happen in practice;
 * if it ever does, that's surfaced as an error rather than silently discarding content pxpipe
 * couldn't tell us how to recover (its public API doesn't expose per-page character ranges).
 */
export async function renderWithPxpipeAdapter(text: string): Promise<RawRenderOutput> {
  const result = await renderWithPxpipe(text)
  const [page, ...rest] = result.pages

  if (!page) {
    throw new Error('pxpipe produced no output for this text')
  }
  if (rest.length > 0) {
    throw new Error(
      `Text is too long for a single image (pxpipe split it into ${result.pages.length} pages) — trim it down.`,
    )
  }

  return { png: page.png, width: page.width, height: page.height, droppedChars: result.droppedChars }
}
