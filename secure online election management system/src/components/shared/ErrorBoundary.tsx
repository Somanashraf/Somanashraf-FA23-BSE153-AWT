import { Component, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  message?: string
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-muted-foreground mt-2">Please refresh the page.</p>
          {import.meta.env.DEV && this.state.message && (
            <p className="mt-4 max-w-md text-xs text-destructive font-mono break-all">
              {this.state.message}
            </p>
          )}
          <Button className="mt-6" onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}
