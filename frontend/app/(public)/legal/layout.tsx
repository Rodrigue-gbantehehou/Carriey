import { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/accueil" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
        </Link>
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-8 sm:p-12 text-gray-700 prose prose-indigo max-w-none">
          {children}
        </div>
      </div>
    </div>
  );
}
