"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Settings, Bell } from 'lucide-react';
import { useProfileStore } from '@/store/profile';

export default function MobileHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const setToken = useProfileStore((state) => state.setToken);

  useEffect(() => {
    if (session?.user?.accessToken) {
      setToken(session.user.accessToken);
    }
  }, [session, setToken]);

  let title = "Carriey";
  if (pathname.includes('/profil')) title = "Profil";
  else if (pathname.includes('/mes-documents')) title = "Documents";
  else if (pathname.includes('/candidatures')) title = "Candidatures";
  else if (pathname.includes('/themes')) title = "Thèmes";

  return (
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-gray-100 px-4 py-3 flex items-center justify-between safe-area-top">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm shadow-indigo-600/30">
          {session?.user?.name?.charAt(0).toUpperCase() || 'C'}
        </div>
        <h1 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h1>
      </div>
      
      <div className="flex items-center gap-3">
        <button className="text-gray-500 hover:text-indigo-600 transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <Link href="/parametres" className="text-gray-500 hover:text-indigo-600 transition-colors">
          <Settings className="w-5 h-5" />
        </Link>
      </div>
    </header>
  );
}
