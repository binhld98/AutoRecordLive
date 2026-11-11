import { Outlet, useLocation } from 'react-router'
import ErrorBoundary from '../error-boundary.tsx'
import PageError from '../page-error.tsx'
import AppSidebar from './app-sidebar.tsx'
import AppSidebarProvider from './app-sidebar-provider.tsx'
import TopBar from './top-bar.tsx'

function AppLayout() {
  const { pathname } = useLocation()

  return (
    <AppSidebarProvider>
      <AppSidebar />
      {/* Not SidebarInset: it renders a <main> of its own, and the page's <main> lives in here. */}
      <div className="flex min-w-0 flex-1 flex-col bg-background">
        <TopBar />
        <main id="content" className="flex flex-1 flex-col p-4">
          {/* A crashing page shows PageError here while the nav keeps working. Navigating away clears it. */}
          <ErrorBoundary resetKey={pathname} fallback={(reset) => <PageError onRetry={reset} />}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </AppSidebarProvider>
  )
}

export default AppLayout
