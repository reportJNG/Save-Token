import { beforeEach, describe, expect, it } from 'vitest'
import { useSettingsStore } from './settingsStore'

describe('settingsStore', () => {
  beforeEach(() => {
    useSettingsStore.getState().resetToDefaults()
  })

  it('clamps cell size to a minimum of 1 and ignores NaN input', () => {
    useSettingsStore.getState().setCellSize(0, -5)
    expect(useSettingsStore.getState().cellWidth).toBe(1)
    expect(useSettingsStore.getState().cellHeight).toBe(1)

    useSettingsStore.getState().setCellSize(12, 24)
    useSettingsStore.getState().setCellSize(Number.NaN, Number.NaN)
    expect(useSettingsStore.getState().cellWidth).toBe(12)
    expect(useSettingsStore.getState().cellHeight).toBe(24)
  })

  it('applies an optimizer preset atomically', () => {
    useSettingsStore.getState().applyOptimizerPreset('best-ocr')
    const state = useSettingsStore.getState()
    expect(state.optimizerGoal).toBe('best-ocr')
    expect(state.cellHeight).toBeGreaterThan(20)
  })

  it('resets to defaults', () => {
    useSettingsStore.getState().setCellSize(99, 99)
    useSettingsStore.getState().resetToDefaults()
    expect(useSettingsStore.getState().cellWidth).toBe(10)
    expect(useSettingsStore.getState().cellHeight).toBe(20)
  })
})
