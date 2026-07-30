import type { CharacterCellConfig } from '../layout/characterMetrics'
import type { ResolutionMode } from '../layout/resolution'

export type OptimizerGoal =
  | 'smallest-resolution'
  | 'lowest-token-usage'
  | 'best-ocr'
  | 'balanced'
  | 'fast-generation'

export interface OptimizerConfig {
  cell: CharacterCellConfig
  mode: ResolutionMode
  maxPageWidth: number
  maxPageHeight: number
}

export const OPTIMIZER_GOALS: Array<{ value: OptimizerGoal; label: string; description: string }> = [
  { value: 'balanced', label: 'Balanced', description: 'Even trade-off between size, tokens, and legibility.' },
  { value: 'smallest-resolution', label: 'Smallest resolution', description: 'Shrinks character cells to minimize pixel area.' },
  { value: 'lowest-token-usage', label: 'Lowest token usage', description: 'Minimizes vision tokens above all else.' },
  { value: 'best-ocr', label: 'Best OCR', description: 'Enlarges character cells for maximum legibility.' },
  { value: 'fast-generation', label: 'Fast generation', description: 'Smaller pages that render quickly, more of them.' },
]

const PRESETS: Record<OptimizerGoal, OptimizerConfig> = {
  balanced: { cell: { width: 10, height: 20 }, mode: 'compact', maxPageWidth: 2048, maxPageHeight: 2048 },
  'smallest-resolution': { cell: { width: 6, height: 12 }, mode: 'compact', maxPageWidth: 2048, maxPageHeight: 2048 },
  'lowest-token-usage': { cell: { width: 6, height: 12 }, mode: 'compact', maxPageWidth: 1536, maxPageHeight: 1536 },
  'best-ocr': { cell: { width: 14, height: 28 }, mode: 'compact', maxPageWidth: 3072, maxPageHeight: 3072 },
  'fast-generation': { cell: { width: 10, height: 20 }, mode: 'compact', maxPageWidth: 1024, maxPageHeight: 1024 },
}

export function selectOptimizerConfig(goal: OptimizerGoal): OptimizerConfig {
  return PRESETS[goal]
}
