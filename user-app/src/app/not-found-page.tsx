import { Link } from 'react-router'
import { buttonVariants } from '@/components/ui/button.tsx'
import CenteredLayout from './layouts/centered-layout.tsx'

// Rendered by the `*` route.
function NotFoundPage() {
  return (
    <CenteredLayout>
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Page not found</h1>
        <p className="text-sm text-muted-foreground">That page doesn't exist or has moved.</p>
      </div>
      <Link to="/" className={buttonVariants({ className: 'h-10 px-4' })}>
        Go to Overview
      </Link>
    </CenteredLayout>
  )
}

export default NotFoundPage
