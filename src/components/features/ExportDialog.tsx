import { useState } from 'react'
import { MoreHorizontal } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useSettingsStore } from '@/stores/settingsStore'
import { useExportStore } from '@/stores/exportStore'
import { useOcrQuality } from '@/hooks/useOcrQuality'
import type { LayoutPlan } from '@/core/layout'
import { pageFileName } from '@/lib/canvas/exportImage'
import {
  downloadBlob,
  downloadText,
  downloadAsZip,
  buildReportData,
  reportToJson,
  reportToMarkdown,
  copyImageToClipboard,
  copyTextToClipboard,
} from '@/lib/export'

/** Extra export actions for images the Generate button has already rendered. */
export function ExportDialog({ plan }: { plan: LayoutPlan }) {
  const imageFormat = useSettingsStore((state) => state.imageFormat)
  const { status, renderedPages, renderedFromText } = useExportStore()
  const ocr = useOcrQuality(plan)
  const [copyMessage, setCopyMessage] = useState<string | null>(null)

  const isReady =
    status === 'done' && renderedPages.length === plan.pages.length && renderedFromText === plan.text

  const handleDownloadAll = () => {
    renderedPages.forEach((page) => downloadBlob(page.blob, pageFileName(page.index, plan.pageCount, imageFormat)))
  }

  const handleDownloadZip = async () => {
    await downloadAsZip(
      renderedPages.map((page) => ({ filename: pageFileName(page.index, plan.pageCount, imageFormat), blob: page.blob })),
    )
  }

  const handleCopyImage = async () => {
    const first = renderedPages[0]
    if (!first) return
    await copyImageToClipboard(first.blob)
    setCopyMessage('Image copied to clipboard')
    setTimeout(() => setCopyMessage(null), 2000)
  }

  const handleCopyMetadata = async () => {
    const report = buildReportData(plan, ocr)
    await copyTextToClipboard(reportToJson(report))
    setCopyMessage('Metadata copied to clipboard')
    setTimeout(() => setCopyMessage(null), 2000)
  }

  const handleExportJson = () => {
    const report = buildReportData(plan, ocr)
    downloadText(reportToJson(report), 'text-image-report.json', 'application/json')
  }

  const handleExportMarkdown = () => {
    const report = buildReportData(plan, ocr)
    downloadText(reportToMarkdown(report), 'text-image-report.md', 'text/markdown')
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={!isReady}>
          <MoreHorizontal className="size-4" /> More
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>More export options</DialogTitle>
          <DialogDescription>
            {plan.pageCount} page{plan.pageCount === 1 ? '' : 's'} rendered as {imageFormat.toUpperCase()}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadAll} disabled={!isReady || plan.pageCount < 2}>
              Download all
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadZip} disabled={!isReady || plan.pageCount < 2}>
              Download ZIP
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopyImage} disabled={!isReady}>
              Copy image
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopyMetadata}>
              Copy metadata
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportJson}>
              Export JSON
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportMarkdown}>
              Export Markdown
            </Button>
          </div>

          {copyMessage && <p className="text-center text-xs text-muted-foreground">{copyMessage}</p>}
        </div>
      </DialogContent>
    </Dialog>
  )
}
