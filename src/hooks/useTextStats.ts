import { useMemo } from 'react'
import { useLayoutStore } from '@/stores/layoutStore'
import { analyzeText, estimateTextTokens, type TextMetrics } from '@/core/text'

export interface TextStats extends TextMetrics {
  textTokens: number
}

/** Cheap, render-free live statistics — computed on every keystroke, never touches pxpipe. */
export function useTextStats(): TextStats {
  const text = useLayoutStore((state) => state.text)

  return useMemo(() => {
    const metrics = analyzeText(text)
    return { ...metrics, textTokens: estimateTextTokens(metrics.characterCount) }
  }, [text])
}
