import { useState } from 'react'
import { Copy, Download, Home, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from './ThemeSwitcher'
import { useExportStore } from '@/stores/exportStore'
import { useLayoutStore } from '@/stores/layoutStore'
import { downloadBlob, copyImageToClipboard } from '@/lib/export'

const FILE_NAME = 'text-image.png'

type Feedback = { type: 'success' | 'error'; message: string }

const numberFormat = new Intl.NumberFormat('en-US')

function messageFor(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

export function ResultScreen({ onReset }: { onReset: () => void }) {
  const result = useExportStore((state) => state.result)
  const previewUrl = useExportStore((state) => state.previewUrl)
  const resetExport = useExportStore((state) => state.reset)
  const clearText = useLayoutStore((state) => state.clear)
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  const showFeedback = (next: Feedback) => {
    setFeedback(next)
    setTimeout(() => setFeedback(null), 2000)
  }

  const handleCopy = async () => {
    if (!result) return
    try {
      await copyImageToClipboard(result.png)
      showFeedback({ type: 'success', message: 'Copied image' })
    } catch (error) {
      showFeedback({ type: 'error', message: messageFor(error, "Couldn't copy the image") })
    }
  }

  const handleDownload = () => {
    if (!result) return
    downloadBlob(result.png, FILE_NAME)
  }

  const handleReset = () => {
    resetExport()
    clearText()
    onReset()
  }

  if (!result || !previewUrl) return null

  const { statistics } = result

  return (
    <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300 flex min-h-[90vh] w-full flex-col items-center justify-center gap-6 py-10">
      <div className="flex w-full justify-end">
        <ThemeSwitcher />
      </div>

      <div className="flex max-w-full justify-center rounded-2xl border border-border bg-secondary/30 p-4">
        <img
          src={previewUrl}
          alt="Generated image"
          className="max-h-[520px] max-w-full rounded-lg object-contain shadow-lg"
        />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-mono text-xs tabular-nums text-muted-foreground">
        <span>
          {result.width}×{result.height}px
        </span>
        <span>~{numberFormat.format(statistics.visionTokens)} image tokens</span>
        <span className={statistics.percentSaved >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}>
          {statistics.percentSaved >= 0 ? '−' : '+'}
          {numberFormat.format(Math.abs(Math.round(statistics.percentSaved)))}% vs. text tokens
        </span>
        <span>{Math.round(result.renderTime)}ms</span>
      </div>

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
