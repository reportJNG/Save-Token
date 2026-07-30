import { beforeEach, describe, expect, it } from 'vitest'
import { useSettingsStore } from './settingsStore'

describe('settingsStore', () => {
  beforeEach(() => {
    useSettingsStore.getState().setTheme('system')
  })

  it('defaults to system theme', () => {
    expect(useSettingsStore.getState().theme).toBe('system')
  })

  it('cycles through theme values', () => {
    useSettingsStore.getState().setTheme('dark')
    expect(useSettingsStore.getState().theme).toBe('dark')

    useSettingsStore.getState().setTheme('light')
    expect(useSettingsStore.getState().theme).toBe('light')
  })
})
