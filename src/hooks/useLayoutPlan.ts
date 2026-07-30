import { useMemo } from 'react'
import { useLayoutStore } from '@/stores/layoutStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { generateLayoutPlan, type LayoutPlan } from '@/core/layout'
import { DEFAULT_RENDER_STYLE } from '@/core/layout/imageGenerator'

/** The only place the pure layout engine is invoked from React — never inline it in a component. */
export function useLayoutPlan(): LayoutPlan {
  const text = useLayoutStore((state) => state.text)
  const cellWidth = useSettingsStore((state) => state.cellWidth)
  const cellHeight = useSettingsStore((state) => state.cellHeight)
  const mode = useSettingsStore((state) => state.mode)
  const targetAspect = useSettingsStore((state) => state.targetAspect)
  const maxPageWidth = useSettingsStore((state) => state.maxPageWidth)
  const maxPageHeight = useSettingsStore((state) => state.maxPageHeight)
  const fontFamily = useSettingsStore((state) => state.fontFamily)
  const textColor = useSettingsStore((state) => state.textColor)
  const backgroundColor = useSettingsStore((state) => state.backgroundColor)
  const transparentBackground = useSettingsStore((state) => state.transparentBackground)
  const padding = useSettingsStore((state) => state.padding)
  const margin = useSettingsStore((state) => state.margin)
  const cornerRadius = useSettingsStore((state) => state.cornerRadius)

  return useMemo(
    () =>
      generateLayoutPlan(text, {
        cell: { width: cellWidth, height: cellHeight },
        mode,
        targetAspect,
        maxPageWidth,
        maxPageHeight,
        style: {
          ...DEFAULT_RENDER_STYLE,
          fontFamily,
          textColor,
          backgroundColor,
          transparentBackground,
          padding,
          margin,
          cornerRadius,
        },
      }),
    [
      text,
      cellWidth,
      cellHeight,
      mode,
      targetAspect,
      maxPageWidth,
      maxPageHeight,
      fontFamily,
      textColor,
      backgroundColor,
      transparentBackground,
      padding,
      margin,
      cornerRadius,
    ],
  )
}
