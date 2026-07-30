import { useEffect } from 'react'
import { Loader2, Sparkles, X, AlertCircle } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from './ThemeSwitcher'
import { useLayoutStore } from '@/stores/layoutStore'
import { useLayoutPlan } from '@/hooks/useLayoutPlan'
import { useExportStore } from '@/stores/exportStore'

const MAX_CHARACTERS = 2_000_000
const IMAGE_FORMAT = 'png'
const IMAGE_QUALITY = 0.92
const numberFormat = new Intl.NumberFormat('en-US')

export function InputScreen({ onGenerated }: { onGenerated: () => void }) {
  const text = useLayoutStore((state) => state.text)
  const setText = useLayoutStore((state) => state.setText)
  const plan = useLayoutPlan()
  const status = useExportStore((state) => state.status)
  const error = useExportStore((state) => state.error)
  const renderAll = useExportStore((state) => state.renderAll)

  const isTooLong = text.length > MAX_CHARACTERS
  const isRendering = status === 'rendering'
  const canGenerate = text.trim().length > 0 && !isTooLong && !isRendering

  useEffect(() => {
    if (status === 'done') onGenerated()
  }, [status, onGenerated])

  const handleGenerate = () => {
    if (!canGenerate) return
    renderAll(plan.pages, IMAGE_FORMAT, IMAGE_QUALITY, text)
  }

  return (
    <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300 flex min-h-[90vh] w-full flex-col items-center justify-center gap-6 py-10">
      <div className="flex w-full justify-end">
        <ThemeSwitcher />
      </div>

      <div className="space-y-1 text-center">
        <h1 className="font-mono text-2xl font-medium tracking-tight sm:text-3xl">
          Text → Image
          <span className="ml-0.5 text-primary motion-safe:animate-pulse" aria-hidden>
            _
          </span>
        </h1>
        <p className="text-sm text-muted-foreground">Paste your text — sizing is calculated automatically.</p>
      </div>

      <div className="w-full max-w-xl">
        <div className="relative">
          <Textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Paste your text here…"
            spellCheck={false}
            aria-invalid={isTooLong}
            autoFocus
            disabled={isRendering}
            className="min-h-56 w-full resize-y rounded-2xl border-2 p-5 pr-11 text-base shadow-sm focus-visible:ring-2"
          />
          {text.length > 0 && !isRendering && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Clear text"
              onClick={() => setText('')}
              className="absolute top-3 right-3 size-7 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between text-xs">
          <span className={isTooLong ? 'font-medium text-destructive' : 'text-muted-foreground'}>
            {isTooLong ? 'Over the limit — trim it down to generate.' : ' '}
          </span>
          <span
            className={`font-mono tabular-nums ${isTooLong ? 'font-medium text-destructive' : 'text-muted-foreground'}`}
          >
            {numberFormat.format(text.length)} / {numberFormat.format(MAX_CHARACTERS)}
          </span>
        </div>
      </div>

      <Button size="lg" className="w-full max-w-xl rounded-xl" disabled={!canGenerate} onClick={handleGenerate}>
        {isRendering ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
        {isRendering ? 'Generating…' : 'Generate'}
      </Button>

      {status === 'error' && error && (
        <div className="flex w-full max-w-xl items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}
    </div>
  )
}
