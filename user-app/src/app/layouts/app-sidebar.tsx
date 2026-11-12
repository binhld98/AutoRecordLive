import type { LucideIcon } from 'lucide-react'
import {
  BellIcon,
  DownloadIcon,
  LayoutDashboardIcon,
  RadioIcon,
  VideoIcon,
  XIcon,
} from 'lucide-react'
import { Link, NavLink, useMatch } from 'react-router'
import { Button } from '@/components/ui/button.tsx'
import { SheetClose } from '@/components/ui/sheet.tsx'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar.tsx'
import { TooltipProvider } from '@/components/ui/tooltip.tsx'

type NavItem = {
  label: string
  to: string
  icon: LucideIcon
  end?: boolean
}

// Overview matches only `/`. The rest also match their child URLs, once areas have them.
// Account and Billing live in the user menu, so no link here is active on their pages.
const navItems: NavItem[] = [
  { label: 'Overview', to: '/', icon: LayoutDashboardIcon, end: true },
  { label: 'Channels', to: '/channels', icon: RadioIcon },
  { label: 'Recordings', to: '/recordings', icon: VideoIcon },
  { label: 'Exports', to: '/exports', icon: DownloadIcon },
  { label: 'Notifications', to: '/notifications', icon: BellIcon },
]

// Picking a link in the phone drawer closes it; shadcn leaves it open.
function useCloseDrawerOnPick() {
  const { isMobile, setOpenMobile } = useSidebar()
  return isMobile ? () => setOpenMobile(false) : undefined
}

// NavLink sets aria-current; useMatch, with the same rule, drives shadcn's active style.
// Icons are 20px and text 16px everywhere. Links are 40px tall with 6px padding all around, in the drawer,
// the sidebar and the rail, where shadcn's 32px width fits the icon. So icons don't move when the sidebar collapses.
// shadcn shows the tooltip only in the rail, where the label is hidden. The drawer gets none:
// there a focused link's hidden tooltip would still open and swallow the Esc that closes the drawer.
function NavMenuItem({ label, to, icon: Icon, end = false }: NavItem) {
  const { isMobile } = useSidebar()
  const isActive = useMatch({ path: to, end }) !== null
  const closeDrawer = useCloseDrawerOnPick()

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        className="h-10 p-1.5 text-base data-active:font-semibold group-data-[collapsible=icon]:h-10! group-data-[collapsible=icon]:p-1.5! [&_svg]:size-5"
        tooltip={isMobile ? undefined : label}
        render={<NavLink to={to} end={end} />}
        onClick={closeDrawer}
      >
        <Icon aria-hidden="true" />
        <span>{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

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
      </Sidebar>
    </TooltipProvider>
  )
}

export default AppSidebar
