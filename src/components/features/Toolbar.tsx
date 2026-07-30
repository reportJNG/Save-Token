import { ImageIcon } from 'lucide-react'
import { ThemeSwitcher } from './ThemeSwitcher'
import { SettingsDialog } from './SettingsDialog'

export function Toolbar() {
  return (
    <header className="glass sticky top-0 z-40 flex items-center justify-between rounded-xl px-5 py-3">
      <div className="flex items-center gap-2">
        <ImageIcon className="size-5 text-primary" />
        <span className="text-sm font-semibold tracking-tight">Text → Image Context Compressor</span>
      </div>
      <div className="flex items-center gap-2">
        <SettingsDialog />
        <ThemeSwitcher />
      </div>
    </header>
  )
}
