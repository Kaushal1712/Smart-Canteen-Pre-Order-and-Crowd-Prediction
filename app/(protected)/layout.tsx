import { MobileBottomNav, MobileTopBar } from '@/components/layout/mobile-nav'
import { Sidebar } from '@/components/layout/sidebar'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream-100 lg:flex">
      <Sidebar />
      <div className="flex-1">
        <MobileTopBar />
        <main className="p-0 lg:p-4 lg:pl-0">
          <div className="min-h-[calc(100vh-120px)] rounded-none bg-white px-4 pb-24 pt-5 lg:min-h-[calc(100vh-32px)] lg:rounded-[24px] lg:px-10 lg:pb-10 lg:pt-10">
            {children}
          </div>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  )
}
