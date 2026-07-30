import { useEffect } from 'react'
import { useSettingsStore } from '@/stores/settingsStore'

/** Applies the user's theme preference (or the OS preference, for 'system') to the document root. */
export function useTheme(): void {
  const theme = useSettingsStore((state) => state.theme)

  useEffect(() => {
    const root = document.documentElement
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    const apply = () => {
      const isDark = theme === 'dark' || (theme === 'system' && media.matches)
      root.classList.toggle('dark', isDark)
    }

    apply()

    if (theme === 'system') {
      media.addEventListener('change', apply)
      return () => media.removeEventListener('change', apply)
    }
  }, [theme])
}
