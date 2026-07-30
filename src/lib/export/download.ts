import { saveAs } from 'file-saver'

export function downloadBlob(blob: Blob, filename: string): void {
  saveAs(blob, filename)
}

export function downloadText(content: string, filename: string, mime = 'text/plain'): void {
  downloadBlob(new Blob([content], { type: mime }), filename)
}
