import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unhandled UI error:', error, info.componentStack)
  }

  private reset = (): void => this.setState({ error: null })

  render(): ReactNode {
    if (!this.state.error) return this.props.children

    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
        <AlertTriangle className="size-10 text-destructive" />
        <h1 className="text-lg font-semibold">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">
          The app hit an unexpected error. Your text hasn't been lost — reloading will bring you back to the editor.
        </p>
        <p className="rounded-md bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
          {this.state.error.message}
        </p>
        <Button onClick={this.reset}>Try again</Button>
      </div>
    )
  }
}
