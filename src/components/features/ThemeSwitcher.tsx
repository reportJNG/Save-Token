import { Moon, Sun, SunMoon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useSettingsStore } from '@/stores/settingsStore'

const CYCLE = ['light', 'dark', 'system'] as const

const ICONS = {
  light: Sun,
  dark: Moon,
  system: SunMoon,
} as const

export function ThemeSwitcher() {
  const theme = useSettingsStore((state) => state.theme)
  const setTheme = useSettingsStore((state) => state.setTheme)
  const Icon = ICONS[theme]

  const cycleTheme = () => {
    const next = CYCLE[(CYCLE.indexOf(theme) + 1) % CYCLE.length]
    setTheme(next)
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" onClick={cycleTheme} aria-label="Toggle theme">
          <Icon className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Theme: {theme}</TooltipContent>
    </Tooltip>
  )
}
