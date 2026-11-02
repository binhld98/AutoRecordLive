import { Outlet } from 'react-router'

function AppLayout() {
  return (
    <main id="content">
      <Outlet />
    </main>
  )
}

export default AppLayout
