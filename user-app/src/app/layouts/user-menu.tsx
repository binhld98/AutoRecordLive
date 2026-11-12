import { Popover as PopoverPrimitive } from '@base-ui/react/popover'
import type { LucideIcon } from 'lucide-react'
import {
  ChevronDownIcon,
  CreditCardIcon,
  LanguagesIcon,
  LogOutIcon,
  MonitorIcon,
  MoonIcon,
  SunIcon,
  SunMoonIcon,
  UserIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useId, useState } from 'react'
import { NavLink } from 'react-router'
import { Button, buttonVariants } from '@/components/ui/button.tsx'
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from '@/components/ui/popover.tsx'
import { Separator } from '@/components/ui/separator.tsx'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group.tsx'

// Placeholders until the app has user data.
const userName = 'User'
const userEmail = 'user@example.com'

const menuLinks: { label: string; to: string; icon: LucideIcon }[] = [
  { label: 'Account', to: '/account', icon: UserIcon },
  { label: 'Billing', to: '/billing', icon: CreditCardIcon },
]

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
// Each row is 40px tall, and its buttons shrink to fit.
function ToggleRow({ label, icon: Icon, value, onValueChange, children }: ToggleRowProps) {
  const labelId = useId()

  return (
    <div className="flex h-10 items-center justify-between gap-2 px-2">
      <span id={labelId} className="flex items-center gap-2">
        <Icon aria-hidden="true" className="size-4" />
        {label}
      </span>
      {/* Base UI lets a click unpress the pressed button, which would leave none, so that change is ignored. */}
      <ToggleGroup
        aria-labelledby={labelId}
        value={[value]}
        onValueChange={(next) => next.length > 0 && onValueChange(next[0])}
        spacing={0.5}
        className="h-full rounded-lg border p-0.5"
      >
        {children}
      </ToggleGroup>
    </div>
  )
}

const toggleItemClassName =
  'h-full w-11 rounded-md px-0 text-muted-foreground aria-pressed:text-foreground'

// Account, Billing and Log out share one 40px row style.
const rowClassName = 'h-10 justify-start gap-2 px-2 text-sm font-normal'

// A Popover, not a Menu: the Theme and Language button groups don't fit a Menu's arrow-key rows.
function UserMenu() {
  // Placeholders: theming and translation are out of scope, so a choice changes nothing and lasts until reload.
  // The state lives here rather than in the panel, so it survives closing the panel.
  const [theme, setTheme] = useState('system')
  const [language, setLanguage] = useState('en')
  // Controlled, so the links can close the panel. Base UI's Close would give them a button role.
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* While open: muted background, then a darker border on desktop or a ring round the avatar on phones. */}
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            aria-label="User menu"
            className="h-10 min-w-10 rounded-full p-0 md:gap-2 md:border-border md:pr-2 md:pl-1 md:aria-expanded:border-foreground"
          />
        }
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-muted font-semibold max-md:group-aria-expanded/button:ring-2 max-md:group-aria-expanded/button:ring-foreground">
          {userName.charAt(0)}
        </span>
        <span className="hidden md:inline">{userName}</span>
        <ChevronDownIcon className="hidden transition-transform group-aria-expanded/button:rotate-180 md:block" />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        aria-label="User menu"
        className="w-70 max-w-(--available-width) gap-2 p-2"
      >
        <div className="flex flex-col p-2">
          <PopoverTitle className="text-base font-semibold">{userName}</PopoverTitle>
          <span className="text-xs text-muted-foreground">{userEmail}</span>
        </div>
        <Separator />
        {/* Picking a link closes the panel, even on its own page. NavLink sets aria-current, with no visible style. */}
        {menuLinks.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={buttonVariants({ variant: 'ghost', className: rowClassName })}
          >
            <Icon aria-hidden="true" />
            {label}
          </NavLink>
        ))}
        <Separator />
        <ToggleRow label="Theme" icon={SunMoonIcon} value={theme} onValueChange={setTheme}>
          {themeOptions.map(({ value, label, icon: Icon }) => (
            <ToggleGroupItem
              key={value}
              value={value}
              aria-label={label}
              className={toggleItemClassName}
            >
              <Icon aria-hidden="true" className="size-4" />
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
        <Separator />
        {/* Auth is out of scope, so Log out only closes the panel for now. */}
        <PopoverPrimitive.Close render={<Button variant="ghost" className={rowClassName} />}>
          <LogOutIcon aria-hidden="true" />
          Log out
        </PopoverPrimitive.Close>
      </PopoverContent>
    </Popover>
  )
}

export default UserMenu
