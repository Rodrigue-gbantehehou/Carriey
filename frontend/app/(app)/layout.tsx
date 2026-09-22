import AppSidebar from '@/components/app/layout/AppSidebar';
import BottomNav from '@/components/app/layout/BottomNav';
import CreateDocumentModal from '@/components/app/shared/CreateDocumentModal';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <AppSidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 pb-16 lg:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />
      
      {/* Global Modals */}
      <CreateDocumentModal />
    </div>
  );
}
