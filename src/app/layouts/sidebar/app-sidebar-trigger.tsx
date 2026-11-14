import { MenuIcon, PanelLeftIcon } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { useSidebar } from '@/components/ui/sidebar.tsx'

type AppSidebarTriggerProps = {
  className?: string
}

// Our own trigger, since shadcn's SidebarTrigger always draws the panel icon.
// Phones get a hamburger that opens the drawer; from 768px up it collapses and expands the rail.
// Ctrl/Cmd+B does the same, through shadcn's SidebarProvider.
function AppSidebarTrigger({ className }: AppSidebarTriggerProps) {
  const { isMobile, open, openMobile, toggleSidebar } = useSidebar()

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      aria-label={isMobile ? 'Open navigation' : open ? 'Collapse sidebar' : 'Expand sidebar'}
      aria-expanded={isMobile ? openMobile : open}
      onClick={toggleSidebar}
    >
      {isMobile ? <MenuIcon className="size-5" /> : <PanelLeftIcon className="size-5" />}
    </Button>
  )
}

export default AppSidebarTrigger
