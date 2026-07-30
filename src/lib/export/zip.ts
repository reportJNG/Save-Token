import JSZip from 'jszip'
import { downloadBlob } from './download'

export interface ZipEntry {
  filename: string
  blob: Blob
}

export async function downloadAsZip(entries: ZipEntry[], zipFilename = 'text-images.zip'): Promise<void> {
  const zip = new JSZip()
  entries.forEach((entry) => zip.file(entry.filename, entry.blob))
  const blob = await zip.generateAsync({ type: 'blob' })
  downloadBlob(blob, zipFilename)
}
