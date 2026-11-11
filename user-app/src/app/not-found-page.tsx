import { Link } from 'react-router'
import { buttonVariants } from '@/components/ui/button.tsx'

// Rendered by the `*` route, a full page outside the app layout.
function NotFoundPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-4 text-center">
      <div className="flex max-w-md flex-col items-center gap-6">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">404 not found</h1>
          <p className="text-sm text-muted-foreground">That page doesn't exist or has moved.</p>
        </div>
        <Link to="/" className={buttonVariants({ className: 'h-10 px-4' })}>
          Go to Overview
        </Link>
      </div>
    </main>
  )
}

export default NotFoundPage
