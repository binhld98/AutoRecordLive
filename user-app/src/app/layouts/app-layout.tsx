import { Outlet } from 'react-router'
import AppSidebar from './app-sidebar.tsx'
import AppSidebarProvider from './app-sidebar-provider.tsx'
import TopBar from './top-bar.tsx'

function AppLayout() {
  return (
    <AppSidebarProvider>
      <AppSidebar />
      {/* Not SidebarInset: it renders a <main> of its own, and the page's <main> lives in here. */}
      <div className="flex min-w-0 flex-1 flex-col bg-background">
        <TopBar />
        <main id="content" className="flex-1 p-4">
          <Outlet />
        </main>
      </div>
    </AppSidebarProvider>
  )
}

export default AppLayout
