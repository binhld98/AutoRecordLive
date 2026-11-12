import {
  BellIcon,
  DownloadIcon,
  LayoutDashboardIcon,
  RadioIcon,
  VideoIcon,
  XIcon,
} from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button.tsx'
import { SheetClose } from '@/components/ui/sheet.tsx'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar.tsx'
import { TooltipProvider } from '@/components/ui/tooltip.tsx'
import type { NavItem } from './nav-menu-item.tsx'
import NavMenuItem from './nav-menu-item.tsx'
import PlanUsage from './plan-usage.tsx'
import useCloseDrawerOnPick from './use-close-drawer-on-pick.ts'

// Overview matches only `/`. The rest also match their child URLs, once areas have them.
// Account and Billing live in the user menu, so no link here is active on their pages.
const navItems: NavItem[] = [
  { label: 'Overview', to: '/', icon: LayoutDashboardIcon, end: true },
  { label: 'Channels', to: '/channels', icon: RadioIcon },
  { label: 'Recordings', to: '/recordings', icon: VideoIcon },
  { label: 'Exports', to: '/exports', icon: DownloadIcon },
  { label: 'Notifications', to: '/notifications', icon: BellIcon },
]

function AppSidebar() {
  const { isMobile } = useSidebar()
  const closeDrawer = useCloseDrawerOnPick()

  return (
    // One provider for the rail's tooltips, so moving between icons skips each one's open delay.
    <TooltipProvider>
      {/* From 768px up it collapses to a 48px icon rail, where the wordmark shows only its LC circle. */}
      <Sidebar collapsible="icon">
        {/* Same 56px height as the top bar, so the two line up. */}
        <SidebarHeader className="h-14 flex-row items-center py-0">
          <SidebarMenu className="min-w-0 flex-1">
            <SidebarMenuItem>
              {/* No left padding, so the LC circle sits 8px from the edge both expanded and in the rail. */}
              <SidebarMenuButton
                size="lg"
                className="pl-0"
                tooltip={isMobile ? undefined : 'LiveCatch'}
                render={<Link to="/" />}
                onClick={closeDrawer}
              >
                <span
                  aria-hidden="true"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
                >
                  LC
                </span>
                <span className="text-lg font-bold">LiveCatch</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          {/* Only the phone drawer is a Sheet, so its close button exists only there. */}
          {isMobile && (
            <SheetClose
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Close navigation"
                  className="size-10 shrink-0"
                />
              }
            >
              <XIcon className="size-5" />
            </SheetClose>
          )}
        </SidebarHeader>
        <SidebarContent>
          <nav aria-label="Main">
            <SidebarGroup>
              {/* 8px between links, in the drawer, the expanded sidebar and the rail. */}
              <SidebarMenu className="gap-2">
                {navItems.map((item) => (
                  <NavMenuItem key={item.to} {...item} />
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </nav>
        </SidebarContent>
        {/* Outside the scrolling content, so the usage card stays pinned to the bottom. */}
        <SidebarFooter>
          <PlanUsage />
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  )
}

export default AppSidebar
