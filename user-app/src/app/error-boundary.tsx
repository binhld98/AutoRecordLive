import type { ReactNode } from 'react'
import { Component } from 'react'

type ErrorBoundaryProps = {
  // Gets `reset`, which clears the error and renders the children again.
  fallback: (reset: () => void) => ReactNode
  // When this changes while the fallback is showing, the error clears.
  resetKey?: string
  children: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
}

// Our own boundary: declarative routing has no errorElement. Render errors only, not event handlers or async code.
// The error isn't kept or shown. React already logs it to the console.
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps, prevState: ErrorBoundaryState) {
    // Only when the fallback was already showing before this update. Otherwise a page that throws
    // on arrival, with the new key, would clear its own error and render (and throw) a second time.
    if (prevState.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.reset()
    }
  }

  reset = () => {
    this.setState({ hasError: false })
  }

  render() {
    return this.state.hasError ? this.props.fallback(this.reset) : this.props.children
  }
}

export default ErrorBoundary
