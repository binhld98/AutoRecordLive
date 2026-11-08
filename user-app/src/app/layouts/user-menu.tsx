import { Popover as PopoverPrimitive } from '@base-ui/react/popover'
import { ChevronDownIcon } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { Popover, PopoverTrigger } from '@/components/ui/popover.tsx'
import { useIsMobile } from '@/hooks/use-mobile.ts'

// Placeholders until the app has user data.
const userName = 'User'
const userEmail = 'user@example.com'

// The trigger is 40px on desktop and 44px on phones, so these offsets both put the panel 4px under the 56px top bar.
const desktopOffset = 12
const phoneOffset = 10

// A Popover, not a Menu: the Theme and Language button groups don't fit a Menu's arrow-key rows.
// The panel uses Base UI's parts directly because shadcn's PopoverContent can't pass collisionPadding,
// which keeps it 8px from the screen edge. Its look copies PopoverContent's classes.
function UserMenu() {
  const isMobile = useIsMobile()

  return (
    <Popover>
      {/* While open: muted background, then a darker border on desktop or a ring round the avatar on phones. */}
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            aria-label="User menu"
            className="h-11 min-w-11 rounded-full p-0 md:h-10 md:gap-2 md:border-border md:pr-2 md:pl-1 md:aria-expanded:border-foreground"
          />
        }
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-muted font-semibold max-md:group-aria-expanded/button:ring-2 max-md:group-aria-expanded/button:ring-foreground">
          {userName.charAt(0)}
        </span>
        <span className="hidden md:inline">{userName}</span>
        <ChevronDownIcon className="hidden transition-transform group-aria-expanded/button:rotate-180 md:block" />
      </PopoverTrigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner
          side="bottom"
          align="end"
          sideOffset={isMobile ? phoneOffset : desktopOffset}
          collisionPadding={8}
          className="isolate z-50"
        >
          {/* 300px wide, or narrower when the screen has less room (320px phones, 200% zoom). */}
          <PopoverPrimitive.Popup
            aria-label="User menu"
            className="flex w-75 max-w-(--available-width) origin-(--transform-origin) flex-col rounded-xl bg-popover p-1 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-100 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2"
          >
            <div className="flex flex-col gap-0.5 px-3 py-2.5">
              <span className="font-semibold">{userName}</span>
              <span className="text-[13px] text-muted-foreground">{userEmail}</span>
            </div>
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </Popover>
  )
}

export default UserMenu
