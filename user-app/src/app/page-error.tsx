import { Link } from 'react-router'
import PageHeader from '@/components/page-header.tsx'
import { Button, buttonVariants } from '@/components/ui/button.tsx'

type PageErrorProps = {
  onRetry: () => void
}

// Shown in the content area when a page throws, so the sidebar and top bar keep working.
function PageError({ onRetry }: PageErrorProps) {
  return (
    <PageHeader
      title="Something went wrong"
      description="This page hit an error. Try again, or go back to Overview."
      actions={
        <>
          <Button className="h-10 px-4" onClick={onRetry}>
            Try again
          </Button>
          <Link to="/" className={buttonVariants({ variant: 'outline', className: 'h-10 px-4' })}>
            Go to Overview
          </Link>
        </>
      }
    />
  )
}

export default PageError
