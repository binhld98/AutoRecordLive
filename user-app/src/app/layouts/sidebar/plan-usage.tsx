import { Meter } from '@base-ui/react/meter'
import { GaugeIcon } from 'lucide-react'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge.tsx'
import { buttonVariants } from '@/components/ui/button.tsx'
import { SidebarMenu } from '@/components/ui/sidebar.tsx'
import NavMenuItem from './nav-menu-item.tsx'
import useCloseDrawerOnPick from './use-close-drawer-on-pick.ts'

// Placeholders until the app has plan data. The card, the rail gauge and its tooltip all read from here.
const planUsage = {
  planName: 'Free trial',
  hoursUsed: 7.5,
  hoursTotal: 10,
  listenersUsed: 2,
  listenersTotal: 3,
}

const hoursSummary = `${planUsage.hoursUsed} of ${planUsage.hoursTotal} hours used`
const listenersSummary = `${planUsage.listenersUsed} of ${planUsage.listenersTotal} listeners used`

type UsageMeterProps = {
  label: string
  // The meter's accessible name, when it should say more than the visible label.
  name: string
  used: number
  total: number
}

// A Base UI Meter, not shadcn's progress: this is an amount out of a limit, not a task in progress.
// Screen readers get the name and "7.5 of 10" from the meter, so the visible row is hidden from them.
function UsageMeter({ label, name, used, total }: UsageMeterProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div aria-hidden="true" className="flex items-baseline justify-between gap-2">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {used} <span className="font-normal text-muted-foreground">/ {total}</span>
        </span>
      </div>
      <Meter.Root
        value={used}
        max={total}
        aria-label={name}
        getAriaValueText={() => `${used} of ${total}`}
      >
        <Meter.Track className="h-1.5 overflow-hidden rounded-full bg-muted">
          <Meter.Indicator className="h-full rounded-full bg-primary" />
        </Meter.Track>
      </Meter.Root>
    </div>
  )
}

// The card shows in the expanded sidebar and the phone drawer. The rail shows a gauge link instead.
function PlanUsage() {
  const closeDrawer = useCloseDrawerOnPick()

  return (
    <>
      <section
        aria-label="Plan usage"
        className="flex flex-col gap-3 rounded-lg border bg-background p-3 text-sm group-data-[collapsible=icon]:hidden"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Current plan</span>
          <Badge variant="outline">{planUsage.planName}</Badge>
        </div>
        <UsageMeter
          label="Hours used"
          name="Recording hours used"
          used={planUsage.hoursUsed}
          total={planUsage.hoursTotal}
        />
        <UsageMeter
          label="Listeners used"
          name="Listeners used"
          used={planUsage.listenersUsed}
          total={planUsage.listenersTotal}
        />
        {/* No active state on /billing: only the rail gauge has one. */}
        <Link
          to="/billing"
          onClick={closeDrawer}
          className={buttonVariants({ className: 'h-10 w-full' })}
        >
          Upgrade plan
        </Link>
      </section>
      <SidebarMenu className="hidden group-data-[collapsible=icon]:flex">
        <NavMenuItem
          label="Plan usage"
          to="/billing"
          icon={GaugeIcon}
          aria-label={`Plan usage: ${hoursSummary}, ${listenersSummary}`}
          tooltip={
            <span className="flex flex-col">
              <span>{hoursSummary}</span>
              <span>{listenersSummary}</span>
            </span>
          }
        />
      </SidebarMenu>
    </>
  )
}

export default PlanUsage
