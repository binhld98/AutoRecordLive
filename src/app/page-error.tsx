import { Link } from 'react-router'
import { Button, buttonVariants } from '@/components/ui/button.tsx'

type PageErrorProps = {
  onRetry: () => void
}

// Shown centered in the content area when a page throws, so the sidebar and top bar keep working.
function PageError({ onRetry }: PageErrorProps) {
  return (
    <div className="flex flex-1 items-center justify-center text-center">
      <div className="flex max-w-md flex-col items-center gap-6">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Something went wrong 😟</h1>
          <p className="text-sm text-muted-foreground">
            This page hit an error. Try again, or go back to Overview.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button variant="outline" className="h-10 px-4" onClick={onRetry}>
            Try again
          </Button>
          <Link to="/" className={buttonVariants({ className: 'h-10 px-4' })}>
            Go to Overview
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PageError
