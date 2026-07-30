import { afterEach, describe, expect, it, vi } from 'vitest'
import { copyImageToClipboard, copyTextToClipboard } from './clipboard'

describe('clipboard', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('copies text when the Clipboard API is available', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })

    await copyTextToClipboard('hello')
    expect(writeText).toHaveBeenCalledWith('hello')
  })

  it('throws a clear error when the Clipboard API is unavailable', async () => {
    vi.stubGlobal('navigator', {})

    await expect(copyTextToClipboard('hello')).rejects.toThrow(/clipboard access is not available/i)
  })

  it('throws a clear error when ClipboardItem is unsupported', async () => {
    vi.stubGlobal('navigator', { clipboard: { write: vi.fn() } })
    const original = (globalThis as { ClipboardItem?: unknown }).ClipboardItem
    // @ts-expect-error simulating an older browser without ClipboardItem
    delete globalThis.ClipboardItem

    await expect(copyImageToClipboard(new Blob(['x']))).rejects.toThrow(/not supported/i)

    ;(globalThis as { ClipboardItem?: unknown }).ClipboardItem = original
  })
})
