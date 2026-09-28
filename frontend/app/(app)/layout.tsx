import AppSidebar from '@/components/app/layout/AppSidebar';
import BottomNav from '@/components/app/layout/BottomNav';
import MobileHeader from '@/components/app/layout/MobileHeader';
import CreateDocumentModal from '@/components/app/shared/CreateDocumentModal';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#FDFDFD] overflow-hidden">
      {/* Desktop sidebar */}
      <AppSidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* Mobile Header (hidden on desktop) */}
        <div className="lg:hidden relative z-10">
          <MobileHeader />
        </div>

        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0 scroll-smooth relative z-10">
          <div className="w-full max-w-4xl mx-auto">
            {children}
          </div>
        </main>

        {/* Mobile bottom nav */}
        <div className="relative z-10">
          <BottomNav />
        </div>
      </div>
      
      {/* Global Modals */}
      <CreateDocumentModal />
    </div>
  );
}
