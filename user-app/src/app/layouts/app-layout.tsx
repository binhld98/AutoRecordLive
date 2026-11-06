import { Outlet } from 'react-router'
import { SidebarProvider } from '@/components/ui/sidebar.tsx'
import AppSidebar from './app-sidebar.tsx'

function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      {/* Not SidebarInset: it renders a <main> of its own, and the page's <main> lives in here. */}
      <div className="flex min-w-0 flex-1 flex-col bg-background">
        <main id="content" className="flex-1 px-4 py-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  )
}

export default AppLayout
