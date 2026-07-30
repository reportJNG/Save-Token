import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ResolutionMode } from '@/core/layout/resolution'
import type { ImageFormat } from '@/lib/canvas/exportImage'
import { selectOptimizerConfig, type OptimizerGoal } from '@/core/optimizer/optimizer'

export type FontFamily = 'JetBrains Mono' | 'Roboto Mono' | 'Consolas' | 'Fira Code'

/** Falls back to `fallback` for NaN/non-finite input (e.g. a cleared number field) and enforces a floor. */
function sanitizeNumber(value: number, fallback: number, min: number): number {
  return Number.isFinite(value) ? Math.max(min, value) : fallback
}

export interface SettingsState {
  cellWidth: number
  cellHeight: number
  mode: ResolutionMode
  targetAspect: number
  maxPageWidth: number
  maxPageHeight: number

  fontFamily: FontFamily
  textColor: string
  backgroundColor: string
  transparentBackground: boolean
  padding: number
  margin: number
  cornerRadius: number

  imageFormat: ImageFormat
  quality: number

  optimizerGoal: OptimizerGoal
  theme: 'light' | 'dark' | 'system'

  setCellSize: (width: number, height: number) => void
  setMode: (mode: ResolutionMode) => void
  setTargetAspect: (aspect: number) => void
  setMaxPageSize: (width: number, height: number) => void
  setFontFamily: (font: FontFamily) => void
  setTextColor: (color: string) => void
  setBackgroundColor: (color: string) => void
  setTransparentBackground: (value: boolean) => void
  setPadding: (value: number) => void
  setMargin: (value: number) => void
  setCornerRadius: (value: number) => void
  setImageFormat: (format: ImageFormat) => void
  setQuality: (value: number) => void
  setOptimizerGoal: (goal: OptimizerGoal) => void
  applyOptimizerPreset: (goal: OptimizerGoal) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  resetToDefaults: () => void
}

const DEFAULTS = {
  cellWidth: 10,
  cellHeight: 20,
  mode: 'compact' as ResolutionMode,
  targetAspect: 1,
  maxPageWidth: 2048,
  maxPageHeight: 2048,
  fontFamily: 'JetBrains Mono' as FontFamily,
  textColor: '#0b0b0f',
  backgroundColor: '#ffffff',
  transparentBackground: false,
  padding: 24,
  margin: 0,
  cornerRadius: 0,
  imageFormat: 'png' as ImageFormat,
  quality: 0.92,
  optimizerGoal: 'balanced' as OptimizerGoal,
  theme: 'system' as const,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...DEFAULTS,

      setCellSize: (width, height) =>
        set({
          cellWidth: sanitizeNumber(width, get().cellWidth, 1),
          cellHeight: sanitizeNumber(height, get().cellHeight, 1),
        }),
      setMode: (mode) => set({ mode }),
      setTargetAspect: (targetAspect) => set({ targetAspect: sanitizeNumber(targetAspect, get().targetAspect, 0.1) }),
      setMaxPageSize: (maxPageWidth, maxPageHeight) =>
        set({
          maxPageWidth: sanitizeNumber(maxPageWidth, get().maxPageWidth, 128),
          maxPageHeight: sanitizeNumber(maxPageHeight, get().maxPageHeight, 128),
        }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setTextColor: (textColor) => set({ textColor }),
      setBackgroundColor: (backgroundColor) => set({ backgroundColor }),
      setTransparentBackground: (transparentBackground) => set({ transparentBackground }),
      setPadding: (padding) => set({ padding: sanitizeNumber(padding, get().padding, 0) }),
      setMargin: (margin) => set({ margin: sanitizeNumber(margin, get().margin, 0) }),
      setCornerRadius: (cornerRadius) => set({ cornerRadius: sanitizeNumber(cornerRadius, get().cornerRadius, 0) }),
      setImageFormat: (imageFormat) => set({ imageFormat }),
      setQuality: (quality) => set({ quality: sanitizeNumber(quality, get().quality, 0.05) }),
      setOptimizerGoal: (optimizerGoal) => set({ optimizerGoal }),
      applyOptimizerPreset: (goal) => {
        const preset = selectOptimizerConfig(goal)
        set({
          optimizerGoal: goal,
          cellWidth: preset.cell.width,
          cellHeight: preset.cell.height,
          mode: preset.mode,
          maxPageWidth: preset.maxPageWidth,
          maxPageHeight: preset.maxPageHeight,
        })
      },
      setTheme: (theme) => set({ theme }),
      resetToDefaults: () => set(DEFAULTS),
    }),
    { name: 'text2image-settings' },
  ),
)
