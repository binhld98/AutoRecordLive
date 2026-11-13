import * as React from "react"

const MOBILE_BREAKPOINT = 768
const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(MOBILE_QUERY)
  mql.addEventListener("change", onChange)
  return () => mql.removeEventListener("change", onChange)
}

function getSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches
}

// Differs from shadcn's generated hook, which starts as desktop and corrects itself in an effect.
// This app never renders on a server, so the media query is read on the first render instead.
export function useIsMobile() {
  return React.useSyncExternalStore(subscribe, getSnapshot)
}
