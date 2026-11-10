import { Button, buttonVariants } from '@/components/ui/button.tsx'
import CenteredLayout from './layouts/centered-layout.tsx'

type AppErrorProps = {
  onRetry: () => void
}

// The last resort, when the layout itself throws. "Go to Overview" is a plain link that reloads the page,
// because a router link alone wouldn't clear the boundary or rely on a router that may be broken.
function AppError({ onRetry }: AppErrorProps) {
  return (
    <CenteredLayout>
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">
          This page hit an error. Try again, or go back to Overview.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button className="h-10 px-4" onClick={onRetry}>
          Try again
        </Button>
        <a href="/" className={buttonVariants({ variant: 'outline', className: 'h-10 px-4' })}>
          Go to Overview
        </a>
      </div>
    </CenteredLayout>
  )
}

export default AppError
