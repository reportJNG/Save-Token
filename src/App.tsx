import { useState } from 'react'
import { useTheme } from '@/hooks/useTheme'
import { InputScreen } from '@/components/features/InputScreen'
import { ResultScreen } from '@/components/features/ResultScreen'

type Screen = 'input' | 'result'

function App() {
  useTheme()
  const [screen, setScreen] = useState<Screen>('input')

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div aria-hidden className="grid-backdrop pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-2xl px-4 sm:px-6">
        {screen === 'input' ? (
          <InputScreen key="input" onGenerated={() => setScreen('result')} />
        ) : (
          <ResultScreen key="result" onReset={() => setScreen('input')} />
        )}
      </div>
    </div>
  )
}

export default App
