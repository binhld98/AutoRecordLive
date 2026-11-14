import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { NavLink, useMatch } from 'react-router'
import { SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar.tsx'
import useCloseDrawerOnPick from './use-close-drawer-on-pick.ts'

export type NavItem = {
  label: string
  to: string
  icon: LucideIcon
  end?: boolean
}

type NavMenuItemProps = NavItem & {
  // The rail tooltip, when it should say more than the label.
  tooltip?: ReactNode
  // The accessible name, when it should say more than the label.
  'aria-label'?: string
}

// NavLink sets aria-current; useMatch, with the same rule, drives shadcn's active style.
// Icons are 20px and text 16px everywhere. Links are 40px tall with 6px padding all around, in the drawer,
// the sidebar and the rail, where shadcn's 32px width fits the icon. So icons don't move when the sidebar collapses.
// shadcn shows the tooltip only in the rail, where the label is hidden. The drawer gets none:
// there a focused link's hidden tooltip would still open and swallow the Esc that closes the drawer.
function NavMenuItem({
  label,
  to,
  icon: Icon,
  end = false,
  tooltip = label,
  'aria-label': ariaLabel,
}: NavMenuItemProps) {
  const { isMobile } = useSidebar()
  const isActive = useMatch({ path: to, end }) !== null
  const closeDrawer = useCloseDrawerOnPick()

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        className="h-10 p-1.5 text-base data-active:font-semibold group-data-[collapsible=icon]:h-10! group-data-[collapsible=icon]:p-1.5! [&_svg]:size-5"
        tooltip={isMobile ? undefined : { children: tooltip }}
        aria-label={ariaLabel}
        render={<NavLink to={to} end={end} />}
        onClick={closeDrawer}
      >
        <Icon aria-hidden="true" />
        <span>{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export default NavMenuItem
