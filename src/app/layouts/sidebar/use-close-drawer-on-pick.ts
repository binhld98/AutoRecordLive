import { useSidebar } from '@/components/ui/sidebar.tsx'

// Picking a link in the phone drawer closes it; shadcn leaves it open.
function useCloseDrawerOnPick() {
  const { isMobile, setOpenMobile } = useSidebar()
  return isMobile ? () => setOpenMobile(false) : undefined
}

export default useCloseDrawerOnPick
