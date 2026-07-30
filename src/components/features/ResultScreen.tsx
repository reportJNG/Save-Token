import { useState } from 'react'
import { Copy, Download, Home, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from './ThemeSwitcher'
import { useExportStore } from '@/stores/exportStore'
import { useLayoutStore } from '@/stores/layoutStore'
import { downloadBlob, copyImageToClipboard } from '@/lib/export'
import { pageFileName } from '@/lib/canvas/exportImage'

type Feedback = { type: 'success' | 'error'; message: string }

function messageFor(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

export function ResultScreen({ onReset }: { onReset: () => void }) {
  const renderedPages = useExportStore((state) => state.renderedPages)
  const resetExport = useExportStore((state) => state.reset)
  const clearText = useLayoutStore((state) => state.clear)
  const [pageIndex, setPageIndex] = useState(0)
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  const pageCount = renderedPages.length
  const image = renderedPages[Math.min(pageIndex, Math.max(0, pageCount - 1))]

  const showFeedback = (next: Feedback) => {
    setFeedback(next)
    setTimeout(() => setFeedback(null), 2000)
  }

  const handleCopy = async () => {
    if (!image) return
    try {
      await copyImageToClipboard(image.blob)
      showFeedback({ type: 'success', message: 'Copied image' })
    } catch (error) {
      showFeedback({ type: 'error', message: messageFor(error, "Couldn't copy the image") })
    }
  }

  const handleDownload = () => {
    if (!image) return
    downloadBlob(image.blob, pageFileName(image.index, pageCount, 'png'))
  }

  const handleReset = () => {
    resetExport()
    clearText()
    onReset()
  }

  if (!image) return null

  return (
    <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300 flex min-h-[90vh] w-full flex-col items-center justify-center gap-6 py-10">
      <div className="flex w-full justify-end">
        <ThemeSwitcher />
      </div>

      <div className="flex max-w-full justify-center rounded-2xl border border-border bg-secondary/30 p-4">
        <img
          src={image.url}
          alt={`Generated image ${pageIndex + 1}`}
          className="max-h-[520px] max-w-full rounded-lg object-contain shadow-lg"
        />
      </div>

      {pageCount > 1 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Previous page"
            onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
            disabled={pageIndex === 0}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span>
            Page {pageIndex + 1} / {pageCount}
          </span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Next page"
            onClick={() => setPageIndex((i) => Math.min(pageCount - 1, i + 1))}
            disabled={pageIndex === pageCount - 1}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}

      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          aria-label="Copy image"
          onClick={handleCopy}
          className="size-12 rounded-full"
        >
          <Copy className="size-5" />
        </Button>
        <Button
          variant="default"
          size="icon"
          aria-label="Start over"
          onClick={handleReset}
          className="size-12 rounded-full"
        >
          <Home className="size-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Download image"
          onClick={handleDownload}
          className="size-12 rounded-full"
        >
          <Download className="size-5" />
        </Button>
      </div>

      <div className="flex h-5 items-center justify-center text-xs">
        {feedback && (
          <p
            className={`motion-safe:animate-in motion-safe:fade-in flex items-center gap-1.5 ${
              feedback.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="size-3.5" />
            ) : (
              <AlertCircle className="size-3.5" />
            )}
            {feedback.message}
          </p>
        )}
      </div>
    </div>
  )
}
