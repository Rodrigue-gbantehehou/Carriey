import AppSidebar from '@/components/app/layout/AppSidebar';
import MobileHeader from '@/components/app/layout/MobileHeader';
import CreateDocumentModal from '@/components/app/shared/CreateDocumentModal';
import { PageContainer } from '@/components/ui/PageContainer';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <AppSidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 relative">

        {/* Mobile Header (hidden on desktop) */}
        <div className="lg:hidden relative z-10">
          <MobileHeader />
        </div>

        <main className="flex-1 overflow-y-auto scroll-smooth relative z-10 py-6">
          <PageContainer variant="dashboard">
            {children}
          </PageContainer>
        </main>
      </div>

      {/* Global Modals */}
      <CreateDocumentModal />
    </div>
  );
}
