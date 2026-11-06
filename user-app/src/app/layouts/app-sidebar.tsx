import type { LucideIcon } from 'lucide-react'
import {
  BellIcon,
  DownloadIcon,
  LayoutDashboardIcon,
  RadioIcon,
  UserIcon,
  VideoIcon,
} from 'lucide-react'
import { Link, NavLink, useMatch } from 'react-router'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar.tsx'

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
function NavMenuItem({ label, to, icon: Icon, end = false }: NavItem) {
  const isActive = useMatch({ path: to, end }) !== null

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        className="data-active:font-semibold"
        render={<NavLink to={to} end={end} />}
      >
        <Icon aria-hidden="true" />
        <span>{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
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
