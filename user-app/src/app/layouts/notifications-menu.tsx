import { BellIcon } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { Button } from '@/components/ui/button.tsx'
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover.tsx'

type Notification = {
  id: number
  title: string
  detail: string
  time: string
  unread: boolean
}

// Placeholders until the app has notification data. The first three are unread.
const notifications: Notification[] = [
  { id: 1, title: 'A channel you follow went live and its recording has started automatically', detail: 'Recording started automatically', time: '2m ago', unread: true },
  { id: 2, title: 'Recording ready', detail: 'Your recording is ready to watch and download', time: '1h ago', unread: true },
  { id: 3, title: 'Recording failed', detail: 'The stream ended before the recording could start', time: '3h ago', unread: true },
  { id: 4, title: 'Channel went live', detail: 'Recording started automatically', time: '5h ago', unread: false },
  { id: 5, title: 'Recording ready', detail: 'Your recording is ready to watch and download', time: '8h ago', unread: false },
  { id: 6, title: 'Channel went live', detail: 'Recording started automatically', time: 'Yesterday', unread: false },
  { id: 7, title: 'Recording ready', detail: 'Your recording is ready to watch and download', time: 'Yesterday', unread: false },
  { id: 8, title: 'Export finished', detail: 'Your export is ready to download', time: '2 days ago', unread: false },
  { id: 9, title: 'Channel went live', detail: 'Recording started automatically', time: '2 days ago', unread: false },
  { id: 10, title: 'Recording ready', detail: 'Your recording is ready to watch and download', time: '3 days ago', unread: false },
  { id: 11, title: 'Channel went live', detail: 'Recording started automatically', time: '4 days ago', unread: false },
  { id: 12, title: 'Recording ready', detail: 'Your recording is ready to watch and download', time: '5 days ago', unread: false },
]

const unreadCount = notifications.filter((notification) => notification.unread).length

// Rows do nothing yet, so they are buttons rather than links.
function NotificationRow({ title, detail, time, unread }: Notification) {
  return (
    <button
      type="button"
      className="flex w-full items-start gap-3 rounded-lg border p-3 text-left outline-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:hover:bg-muted/50"
    >
      {/* Read rows keep an empty slot so their text lines up with the unread rows. */}
      <span
        aria-hidden="true"
        className={unread ? 'mt-1.5 size-2 shrink-0 rounded-full bg-foreground' : 'size-2 shrink-0'}
      />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-baseline justify-between gap-3">
          <span className={unread ? 'min-w-0 truncate font-semibold' : 'min-w-0 truncate'}>
            {unread && <span className="sr-only">Unread: </span>}
            {title}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">{time}</span>
        </span>
        <span className="truncate text-xs text-muted-foreground">{detail}</span>
      </span>
    </button>
  )
}

// A Popover at every width. Width and height follow the space Base UI reports, up to 360px and 720px.
function NotificationsMenu() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [openedAt, setOpenedAt] = useState(pathname)

  // Navigating by any route, back button included, closes the panel.
  if (openedAt !== pathname) {
    setOpenedAt(pathname)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* While open: muted background, then a darker border on desktop. */}
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Notifications, ${unreadCount} unread`}
            className="relative size-10 rounded-full md:border-border md:aria-expanded:border-foreground"
          />
        }
      >
        <BellIcon className="size-5" />
        <span
          aria-hidden="true"
          className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-0.5 text-[10px] leading-none font-semibold text-primary-foreground md:-top-1 md:-right-1 md:h-4.5 md:min-w-4.5 md:px-1 md:text-[11px]"
        >
          {unreadCount}
        </span>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="max-h-[min(720px,var(--available-height))] w-90 max-w-(--available-width) gap-0 overflow-hidden p-0"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b p-4">
          <div className="flex flex-col">
            <PopoverTitle className="text-base font-semibold">Notifications</PopoverTitle>
            <span className="text-xs text-muted-foreground">{unreadCount} unread</span>
          </div>
          {/* Does nothing until the app has notification data. */}
          <Button variant="ghost" className="h-10 px-3 text-xs font-normal">
            Mark all read
          </Button>
        </div>
        <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2">
          {notifications.map((notification) => (
            <li key={notification.id}>
              <NotificationRow {...notification} />
            </li>
          ))}
        </ul>
        {/* A plain link, closed through state: Base UI's Close would give it a button role. */}
        <Link
          to="/notifications"
          onClick={() => setOpen(false)}
          className="flex h-12 shrink-0 items-center justify-center border-t font-semibold outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset dark:hover:bg-muted/50"
        >
          View all notifications
        </Link>
      </PopoverContent>
    </Popover>
  )
}

export default NotificationsMenu
