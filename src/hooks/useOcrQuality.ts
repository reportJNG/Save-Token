import { useMemo } from 'react'
import { assessOcrQuality, type OcrQualityResult } from '@/core/ocr/ocrQuality'
import { useSettingsStore } from '@/stores/settingsStore'
import type { LayoutPlan } from '@/core/layout'

export function useOcrQuality(plan: LayoutPlan): OcrQualityResult {
  const cellWidth = useSettingsStore((state) => state.cellWidth)
  const cellHeight = useSettingsStore((state) => state.cellHeight)
  const page = plan.pages[0]
  const imageWidth = page?.canvasWidth ?? 0
  const imageHeight = page?.canvasHeight ?? 0

  return useMemo(
    () => assessOcrQuality({ cellWidth, cellHeight, imageWidth, imageHeight }),
    [cellWidth, cellHeight, imageWidth, imageHeight],
  )
}
