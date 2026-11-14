import type { ErrorInfo, ReactNode } from 'react'
import { Component } from 'react'

type ErrorBoundaryProps = {
  fallback: (reset: () => void) => ReactNode
  // The error clears when this changes.
  resetKey?: string
  onError?: (error: Error, info: ErrorInfo) => void
  children: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
  resetKey?: string
}

// Our own boundary: declarative routing has no errorElement. Render errors only, not event handlers or async code.
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, resetKey: this.props.resetKey }

  static getDerivedStateFromError(): Partial<ErrorBoundaryState> {
    return { hasError: true }
  }

  // The key is stored even without an error, so a page that throws on arrival, with the new key,
  // doesn't clear its own error and render (and throw) a second time.
  static getDerivedStateFromProps(
    props: ErrorBoundaryProps,
    state: ErrorBoundaryState,
  ): Partial<ErrorBoundaryState> | null {
    if (props.resetKey === state.resetKey) return null
    return { hasError: false, resetKey: props.resetKey }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info)
  }

  reset = () => {
    this.setState({ hasError: false })
  }

  render() {
    return this.state.hasError ? this.props.fallback(this.reset) : this.props.children
  }
}

export default ErrorBoundary
