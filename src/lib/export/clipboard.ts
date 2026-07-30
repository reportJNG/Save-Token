function requireClipboard(): Clipboard {
  if (!navigator.clipboard) {
    throw new Error('Clipboard access is not available in this browser or context')
  }
  return navigator.clipboard
}

export async function copyTextToClipboard(text: string): Promise<void> {
  await requireClipboard().writeText(text)
}

export async function copyImageToClipboard(blob: Blob): Promise<void> {
  const ClipboardItemCtor = (globalThis as { ClipboardItem?: typeof ClipboardItem }).ClipboardItem
  if (!ClipboardItemCtor) {
    throw new Error('Copying images is not supported in this browser')
  }
  await requireClipboard().write([new ClipboardItemCtor({ [blob.type]: blob })])
}
