import { useMemo } from 'react'
import { useLayoutStore } from '@/stores/layoutStore'
import { generateLayoutPlan, type LayoutPlan } from '@/core/layout'
import { DEFAULT_CELL } from '@/core/layout/characterMetrics'
import { DEFAULT_RENDER_STYLE } from '@/core/layout/imageGenerator'

/**
 * Resolution/style are fixed here — always the tightest exact-fit layout, no manual tuning.
 * The 4096px page cap keeps single-image output for realistic inputs (up to ~83k characters)
 * while still guarding against turning a pathologically long text into one absurdly large
 * image that a real vision model would just downscale into unreadable mush anyway.
 */
const AUTO_CONFIG = {
  cell: DEFAULT_CELL,
  mode: 'exact' as const,
  targetAspect: 1,
  maxPageWidth: 4096,
  maxPageHeight: 4096,
  style: DEFAULT_RENDER_STYLE,
}

/** The only place the pure layout engine is invoked from React — never inline it in a component. */
export function useLayoutPlan(): LayoutPlan {
  const text = useLayoutStore((state) => state.text)

  return useMemo(() => generateLayoutPlan(text, AUTO_CONFIG), [text])
}
