import type { ReactNode } from 'react'
import { useState } from 'react'
import { SidebarProvider } from '@/components/ui/sidebar.tsx'

const storageKey = 'livecatch:sidebar-open'

// Only a stored "false" means collapsed, so an empty or unreadable value loads expanded.
function readOpen() {
  try {
    return localStorage.getItem(storageKey) !== 'false'
  } catch {
    return true
  }
}

function writeOpen(open: boolean) {
  try {
    localStorage.setItem(storageKey, String(open))
  } catch {
    // Storage is blocked or full, so the state just isn't remembered.
  }
}

type AppSidebarProviderProps = {
  children: ReactNode
}

// Remembers whether the desktop sidebar is expanded or collapsed to the rail, across reloads.
// shadcn's own sidebar_state cookie still gets written, but nothing reads it.
// The phone drawer's open state isn't stored, so it always starts closed.
function AppSidebarProvider({ children }: AppSidebarProviderProps) {
  const [open, setOpen] = useState(readOpen)

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    writeOpen(nextOpen)
  }

  return (
    <SidebarProvider open={open} onOpenChange={handleOpenChange}>
      {children}
    </SidebarProvider>
  )
}

export default AppSidebarProvider
