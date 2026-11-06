import { MenuIcon, PanelLeftIcon } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { useSidebar } from '@/components/ui/sidebar.tsx'

type AppSidebarTriggerProps = {
  className?: string
}

// Our own trigger, since shadcn's SidebarTrigger always draws the panel icon.
// Phones get a hamburger that opens the drawer; from 768px up it toggles the sidebar.
function AppSidebarTrigger({ className }: AppSidebarTriggerProps) {
  const { isMobile, openMobile, toggleSidebar } = useSidebar()

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      aria-label={isMobile ? 'Open navigation' : 'Toggle sidebar'}
      aria-expanded={isMobile ? openMobile : undefined}
      onClick={toggleSidebar}
    >
      {isMobile ? <MenuIcon className="size-6" /> : <PanelLeftIcon />}
    </Button>
  )
}

export default AppSidebarTrigger
