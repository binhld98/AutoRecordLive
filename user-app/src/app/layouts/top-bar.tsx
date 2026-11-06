import { BellIcon, ChevronDownIcon } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button.tsx'
import { SidebarTrigger } from '@/components/ui/sidebar.tsx'

// Placeholders until the app has notification and user data.
const unreadCount = 3
const userName = 'User'

// Controls are 44px on phones for touch, 40px from 768px up.
function TopBar() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-1 border-b px-1.5 md:gap-2 md:pr-6 md:pl-4">
      <SidebarTrigger className="size-11 md:size-10" />
      <Link to="/" className="text-lg font-bold md:hidden">
        LiveCatch
      </Link>
      <div className="ml-auto flex items-center gap-1 md:gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Notifications, ${unreadCount} unread`}
          className="relative size-11 rounded-full md:size-10 md:border-border"
        >
          <BellIcon className="size-5" />
          <span
            aria-hidden="true"
            className="absolute top-1 right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground md:-top-1 md:-right-1"
          >
            {unreadCount}
          </span>
        </Button>
        <Button
          variant="ghost"
          aria-label="Open user menu"
          className="h-11 min-w-11 rounded-full p-0 md:h-10 md:gap-2 md:border-border md:pr-2 md:pl-1"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-muted font-semibold">
            {userName.charAt(0)}
          </span>
          <span className="hidden md:inline">{userName}</span>
          <ChevronDownIcon className="hidden md:block" />
        </Button>
      </div>
    </header>
  )
}

export default TopBar
