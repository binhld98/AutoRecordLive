import AppSidebarTrigger from '../sidebar/app-sidebar-trigger.tsx'
import NotificationsMenu from './notifications-menu.tsx'
import UserMenu from './user-menu.tsx'

// Controls are 40px tall, on phones and from 768px up.
function TopBar() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-1 border-b px-2 md:gap-2">
      <AppSidebarTrigger className="size-10" />
      <div className="ml-auto flex items-center gap-1 md:gap-2">
        <NotificationsMenu />
        <UserMenu />
      </div>
    </header>
  )
}

export default TopBar
