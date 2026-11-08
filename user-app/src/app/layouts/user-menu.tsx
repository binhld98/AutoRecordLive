import { Popover as PopoverPrimitive } from '@base-ui/react/popover'
import type { LucideIcon } from 'lucide-react'
import {
  ChevronDownIcon,
  LanguagesIcon,
  LogOutIcon,
  MonitorIcon,
  MoonIcon,
  SunIcon,
  SunMoonIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useId, useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { Popover, PopoverTrigger } from '@/components/ui/popover.tsx'
import { Separator } from '@/components/ui/separator.tsx'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group.tsx'
import { useIsMobile } from '@/hooks/use-mobile.ts'

// Placeholders until the app has user data.
const userName = 'User'
const userEmail = 'user@example.com'

// The trigger is 40px on desktop and 44px on phones, so these offsets both put the panel 4px under the 56px top bar.
const desktopOffset = 12
const phoneOffset = 10

const themeOptions: { value: string; label: string; icon: LucideIcon }[] = [
  { value: 'light', label: 'Light', icon: SunIcon },
  { value: 'dark', label: 'Dark', icon: MoonIcon },
  { value: 'system', label: 'System', icon: MonitorIcon },
]

// Each language is named in its own script, so screen readers say it the way its speakers would.
const languageOptions: { value: string; code: string; label: string }[] = [
  { value: 'vi', code: 'VN', label: 'Tiếng Việt' },
  { value: 'en', code: 'EN', label: 'English' },
  { value: 'zh', code: 'CN', label: '中文' },
]

type ToggleRowProps = {
  label: string
  icon: LucideIcon
  value: string
  onValueChange: (value: string) => void
  children: ReactNode
}

// A labelled row of toggle buttons, where exactly one is always pressed. Arrow keys move between them.
// Buttons are 44×40 on every screen, for touch.
function ToggleRow({ label, icon: Icon, value, onValueChange, children }: ToggleRowProps) {
  const labelId = useId()

  return (
    <div className="flex min-h-13 items-center justify-between gap-2 pr-1 pl-3">
      <span id={labelId} className="flex items-center gap-2.5">
        <Icon aria-hidden="true" className="size-4" />
        {label}
      </span>
      {/* Base UI lets a click unpress the pressed button, which would leave none, so that change is ignored. */}
      <ToggleGroup
        aria-labelledby={labelId}
        value={[value]}
        onValueChange={(next) => next.length > 0 && onValueChange(next[0])}
        spacing={0.5}
        className="rounded-lg border p-0.5"
      >
        {children}
      </ToggleGroup>
    </div>
  )
}

// Dividers run edge to edge, through the panel's 4px padding.
const dividerClassName = '-mx-1 my-1 data-horizontal:w-auto'

const toggleItemClassName =
  'h-10 w-11 rounded-md px-0 text-muted-foreground aria-pressed:text-foreground'

// A Popover, not a Menu: the Theme and Language button groups don't fit a Menu's arrow-key rows.
// The panel uses Base UI's parts directly because shadcn's PopoverContent can't pass collisionPadding,
// which keeps it 8px from the screen edge. Its look copies PopoverContent's classes.
function UserMenu() {
  const isMobile = useIsMobile()
  // Placeholders: theming and translation are out of scope, so a choice changes nothing and lasts until reload.
  // The state lives here rather than in the panel, so it survives closing the panel.
  const [theme, setTheme] = useState('system')
  const [language, setLanguage] = useState('en')

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
              <span className="text-[12px] text-muted-foreground">{userEmail}</span>
            </div>
            <Separator className={dividerClassName} />
            <ToggleRow label="Theme" icon={SunMoonIcon} value={theme} onValueChange={setTheme}>
              {themeOptions.map(({ value, label, icon: Icon }) => (
                <ToggleGroupItem
                  key={value}
                  value={value}
                  aria-label={label}
                  className={toggleItemClassName}
                >
                  <Icon aria-hidden="true" />
                </ToggleGroupItem>
              ))}
            </ToggleRow>
            <ToggleRow
              label="Language"
              icon={LanguagesIcon}
              value={language}
              onValueChange={setLanguage}
            >
              {languageOptions.map(({ value, code, label }) => (
                <ToggleGroupItem
                  key={value}
                  value={value}
                  lang={value}
                  aria-label={label}
                  className={`${toggleItemClassName} text-xs font-semibold`}
                >
                  {code}
                </ToggleGroupItem>
              ))}
            </ToggleRow>
            <Separator className={dividerClassName} />
            {/* Auth is out of scope, so Log out only closes the panel for now. */}
            <PopoverPrimitive.Close
              render={
                <Button
                  variant="ghost"
                  className="h-auto min-h-11 justify-start gap-2.5 px-3 text-sm font-normal"
                />
              }
            >
              <LogOutIcon aria-hidden="true" />
              Log out
            </PopoverPrimitive.Close>
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </Popover>
  )
}

export default UserMenu
