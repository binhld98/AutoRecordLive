import type { ReactNode } from 'react'

type CenteredLayoutProps = {
  children: ReactNode
}

// A full page outside the app layout, with its content centred. For the not-found page and AppError.
function CenteredLayout({ children }: CenteredLayoutProps) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-4 text-center">
      <div className="flex max-w-md flex-col items-center gap-6">{children}</div>
    </main>
  )
}

export default CenteredLayout
