import { MobileBottomNav, MobileTopBar } from '@/components/layout/mobile-nav'
import { Sidebar } from '@/components/layout/sidebar'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-cream-100 lg:flex lg:h-screen lg:overflow-hidden">
      <Sidebar />
      <div className="lg:flex lg:flex-1 lg:flex-col lg:overflow-hidden lg:shadow-[-2px_0_6px_0_rgba(0,0,0,0.08)] lg:z-10 bg-white">
        <MobileTopBar />
        <main className="lg:flex-1 lg:overflow-y-auto">
          <div className="min-h-[calc(100vh-120px)] bg-white px-4 pb-24 pt-5 lg:min-h-full lg:px-10 lg:pb-10 lg:pt-10">
            {children}
          </div>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  )
}
