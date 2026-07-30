export async function copyTextToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text)
}

export async function copyImageToClipboard(blob: Blob): Promise<void> {
  const ClipboardItemCtor = (globalThis as { ClipboardItem?: typeof ClipboardItem }).ClipboardItem
  if (!ClipboardItemCtor) {
    throw new Error('Copying images is not supported in this browser')
  }
  await navigator.clipboard.write([new ClipboardItemCtor({ [blob.type]: blob })])
}
