import type { LucideIcon } from 'lucide-react'
import {
  BellIcon,
  DownloadIcon,
  LayoutDashboardIcon,
  RadioIcon,
  UserIcon,
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
import { cn } from '@/lib/utils.ts'

type NavItem = {
  label: string
  to: string
  icon: LucideIcon
  end?: boolean
}

// Overview matches only `/`. The rest also match their child URLs, e.g. Account on /account/plan.
const navItems: NavItem[] = [
  { label: 'Overview', to: '/', icon: LayoutDashboardIcon, end: true },
  { label: 'Channels', to: '/channels', icon: RadioIcon },
  { label: 'Recordings', to: '/recordings', icon: VideoIcon },
  { label: 'Exports', to: '/exports', icon: DownloadIcon },
  { label: 'Notifications', to: '/notifications', icon: BellIcon },
  { label: 'Account', to: '/account', icon: UserIcon },
]

// NavLink sets aria-current; useMatch, with the same rule, drives shadcn's active style.
// In the phone drawer, links are 48px tall with 20px icons for touch.
function NavMenuItem({ label, to, icon: Icon, end = false }: NavItem) {
  const { isMobile } = useSidebar()
  const isActive = useMatch({ path: to, end }) !== null

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        size={isMobile ? 'lg' : 'default'}
        className={cn('data-active:font-semibold', isMobile && 'text-base [&_svg]:size-5')}
        render={<NavLink to={to} end={end} />}
      >
        <Icon aria-hidden="true" />
        <span>{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function AppSidebar() {
  const { isMobile } = useSidebar()

  return (
    <Sidebar>
      {/* Same 56px height as the top bar, so the two line up. */}
      <SidebarHeader className="h-14 flex-row items-center py-0">
        <SidebarMenu className="min-w-0 flex-1">
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link to="/" />}>
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
                className="size-11 shrink-0"
              />
            }
          >
            <XIcon className="size-6" />
          </SheetClose>
        )}
      </SidebarHeader>
      <SidebarContent>
        <nav aria-label="Main">
          <SidebarGroup>
            <SidebarMenu>
              {navItems.map((item) => (
                <NavMenuItem key={item.to} {...item} />
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </nav>
      </SidebarContent>
    </Sidebar>
  )
}

export default AppSidebar
