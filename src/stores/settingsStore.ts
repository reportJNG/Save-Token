import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SettingsState {
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

const DEFAULTS = {
  theme: 'system' as const,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'text2image-settings',
      // Bump this whenever a DEFAULTS value changes meaningfully — otherwise
      // returning users keep whatever was persisted under the old default
      // forever, silently masking the new one. `migrate` just drops the
      // stale state (instead of zustand's default no-op warning) so
      // everyone lands on the current DEFAULTS after a version bump.
      version: 3,
      migrate: () => DEFAULTS,
    },
  ),
)
