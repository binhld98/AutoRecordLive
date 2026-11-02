import { Navigate, Route, Routes, useLocation } from 'react-router'
import AppLayout from './layouts/app-layout.tsx'
import AccountPage from '@/features/account/account-page.tsx'
import PlanPage from '@/features/account/plan-page.tsx'
import ChannelsPage from '@/features/channels/channels-page.tsx'
import ExportsPage from '@/features/exports/exports-page.tsx'
import NotificationsPage from '@/features/notifications/notifications-page.tsx'
import OverviewPage from '@/features/overview/overview-page.tsx'
import RecordingsPage from '@/features/recordings/recordings-page.tsx'

function AppRoutes() {
  const { pathname, search, hash } = useLocation()

  // Every URL has one canonical form without a trailing slash, e.g. /recordings/ → /recordings.
  if (pathname.length > 1 && pathname.endsWith('/')) {
    const canonical = pathname.replace(/\/+$/, '') || '/'
    return <Navigate replace to={{ pathname: canonical, search, hash }} />
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<OverviewPage />} />
        <Route path="channels" element={<ChannelsPage />} />
        <Route path="recordings" element={<RecordingsPage />} />
        <Route path="exports" element={<ExportsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="account/plan" element={<PlanPage />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes
