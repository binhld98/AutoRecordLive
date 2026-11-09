import { BellIcon } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import AppSidebarTrigger from './app-sidebar-trigger.tsx'
import UserMenu from './user-menu.tsx'

// Placeholder until the app has notification data.
const unreadCount = 3

// Controls are 40px tall, on phones and from 768px up.
function TopBar() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-1 border-b px-2 md:gap-2">
      <AppSidebarTrigger className="size-10" />
      <div className="ml-auto flex items-center gap-1 md:gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Notifications, ${unreadCount} unread`}
          className="relative size-10 rounded-full md:border-border"
        >
          <BellIcon className="size-5" />
          <span
            aria-hidden="true"
            className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-0.5 text-[10px] leading-none font-semibold md:h-4.5 md:min-w-4.5 md:px-1 md:text-[11px] text-primary-foreground md:-top-1 md:-right-1"
          >
            {unreadCount}
          </span>
        </Button>
        <UserMenu />
      </div>
    </header>
  )
}

export default TopBar
