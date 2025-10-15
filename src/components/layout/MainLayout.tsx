import { Outlet, useLocation } from '@tanstack/react-router'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/Header'
import { ModelSettingsPanel } from './ModelSettingsPanel'

export function MainLayout() {
  const location = useLocation()
  
  // Show right sidebar for main dashboard/studio page
  const showRightSidebar = location.pathname === '/' || location.pathname === '/chat' || location.pathname === '/stream'

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto scrollbar-dark">
            <Outlet />
          </div>
        </main>
        {showRightSidebar && (
          <div className="hidden xl:block h-full">
            <ModelSettingsPanel />
          </div>
        )}
      </div>
    </div>
  )
}
