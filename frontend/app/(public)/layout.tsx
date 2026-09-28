// Layout for public pages — includes Navbar + Footer
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 w-full max-w-[1400px] mx-auto bg-white shadow-sm border-x border-gray-100">{children}</main>
      <Footer />
    </div>
  );
}
