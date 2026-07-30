import { describe, expect, it } from 'vitest'
import { renderWithPxpipeAdapter } from './PxpipeRenderer'
import { MAX_CHARACTERS } from '../pxpipe/constants'

describe('renderWithPxpipeAdapter', () => {
  it('renders text to a single PNG with positive dimensions', async () => {
    const result = await renderWithPxpipeAdapter('Hello, pxpipe!\nSecond line of text.')

    expect(result.png).toBeInstanceOf(Uint8Array)
    expect(result.png.length).toBeGreaterThan(0)
    expect(result.width).toBeGreaterThan(0)
    expect(result.height).toBeGreaterThan(0)
    expect(result.droppedChars).toBe(0)

    const pngSignature = Array.from(result.png.slice(0, 8))
    expect(pngSignature).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  })

  it('rejects text long enough that pxpipe splits it into multiple pages', async () => {
    await expect(renderWithPxpipeAdapter('x'.repeat(200000))).rejects.toThrow(/too long/i)
  })

  it('fits short-line content (code-shaped, one line at a time) at MAX_CHARACTERS into a single page', async () => {
    // Regression coverage: without `reflow: true`, many short hard-wrapped lines each waste
    // most of a row's width, so a character count safe for flowing prose could still split
    // into a dozen pages for code/log-shaped text. See constants.ts's measurement notes.
    const codeLike = 'const value = 1;\n'.repeat(Math.ceil(MAX_CHARACTERS / 18)).slice(0, MAX_CHARACTERS)

    const result = await renderWithPxpipeAdapter(codeLike)

    expect(result.width).toBeGreaterThan(0)
    expect(result.height).toBeGreaterThan(0)
  })
})
