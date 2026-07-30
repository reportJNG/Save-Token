import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Sparkles, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useLayoutStore } from '@/stores/layoutStore'
import { useLayoutPlan } from '@/hooks/useLayoutPlan'
import { useExportStore } from '@/stores/exportStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { downloadBlob } from '@/lib/export'
import { pageFileName } from '@/lib/canvas/exportImage'
import { textInputSchema, type TextInputValues } from '@/lib/validation'
import { ExportDialog } from './ExportDialog'

const numberFormat = new Intl.NumberFormat('en-US')

export function GeneratePanel() {
  const text = useLayoutStore((state) => state.text)
  const setText = useLayoutStore((state) => state.setText)
  const plan = useLayoutPlan()

  const { register, watch, formState } = useForm<TextInputValues>({
    resolver: zodResolver(textInputSchema),
    defaultValues: { text },
    mode: 'onChange',
  })
  const watchedText = watch('text')

  useEffect(() => {
    if (watchedText !== text) setText(watchedText ?? '')
  }, [watchedText, text, setText])

  const imageFormat = useSettingsStore((state) => state.imageFormat)
  const quality = useSettingsStore((state) => state.quality)
  const { status, renderedPages, renderedFromText, renderAll } = useExportStore()
  const [pageIndex, setPageIndex] = useState(0)

  const isEmpty = text.trim().length === 0
  const isRendering = status === 'rendering'
  const canGenerate = !isEmpty && !isRendering
  const currentImage = renderedPages[Math.min(pageIndex, renderedPages.length - 1)]
  const isStale = status === 'done' && renderedFromText !== null && renderedFromText !== text

  const handleGenerate = () => {
    if (!canGenerate) return
    setPageIndex(0)
    renderAll(plan.pages, imageFormat, quality, text)
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-5 py-10">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Text → Image</h1>
        <p className="text-sm text-muted-foreground">
          Paste your text — resolution, pages, and layout are all calculated automatically.
        </p>
      </div>

      <div className="w-full">
        <Textarea
          {...register('text')}
          placeholder="Paste your text here…"
          spellCheck={false}
          className="min-h-56 w-full resize-y rounded-2xl border-2 p-5 text-base shadow-sm focus-visible:ring-2"
        />
        {formState.errors.text && (
          <p className="mt-2 text-sm text-destructive">{formState.errors.text.message}</p>
        )}
      </div>

      <Button size="lg" className="w-full rounded-xl" disabled={!canGenerate} onClick={handleGenerate}>
        {isRendering ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
        {isRendering ? 'Generating…' : 'Generate'}
      </Button>

      {plan.pages.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>{numberFormat.format(plan.metrics.characterCount)} chars</span>
          <span>·</span>
          <span>{numberFormat.format(plan.compression.textTokens)} text tokens</span>
          <span>·</span>
          <span>{numberFormat.format(plan.compression.visionTokens)} vision tokens</span>
          <span>·</span>
          <span className={plan.compression.percentSaved >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}>
            {plan.compression.percentSaved >= 0 ? '−' : '+'}
            {Math.abs(plan.compression.percentSaved).toFixed(1)}%
          </span>
        </div>
      )}

      {currentImage && (
        <div className="w-full space-y-3">
          {isStale && (
            <p className="text-center text-xs text-amber-600 dark:text-amber-400">
              Text changed since this image was generated — press Generate again to update it.
            </p>
          )}
          <div className="flex justify-center rounded-2xl border border-border bg-secondary/30 p-4">
            <img
              src={currentImage.url}
              alt={`Generated page ${pageIndex + 1}`}
              className="max-h-[480px] rounded-lg shadow-lg"
            />
          </div>
          <div className="flex items-center justify-between">
            {renderedPages.length > 1 ? (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
                  disabled={pageIndex === 0}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span>
                  Page {pageIndex + 1} / {renderedPages.length}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPageIndex((i) => Math.min(renderedPages.length - 1, i + 1))}
                  disabled={pageIndex === renderedPages.length - 1}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-2">
              <ExportDialog plan={plan} />
              <Button
                size="sm"
                onClick={() =>
                  downloadBlob(currentImage.blob, pageFileName(currentImage.index, plan.pageCount, imageFormat))
                }
              >
                <Download className="size-4" /> Download
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
