import { useTheme } from '@/hooks/useTheme'
import { Toolbar } from '@/components/features/Toolbar'
import { GeneratePanel } from '@/components/features/GeneratePanel'

function App() {
  useTheme()

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 pb-16 sm:p-6">
      <Toolbar />
      <GeneratePanel />
    </div>
  )
}

export default App
