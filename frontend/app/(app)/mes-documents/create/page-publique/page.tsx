'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft } from 'lucide-react';
import { PageEditor } from '@/components/app/public-page/editor/PageEditor';

export default function CreatePublicPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const templateSlug = searchParams.get('template') || 'modern';

  return (
    <div className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto font-sans">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Créer une Page Publique</h1>
          <p className="text-sm text-gray-500 mt-1">Configurez les informations et le design de votre profil public.</p>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
        <PageEditor
          token={session?.user?.accessToken || ''}
          initialTheme={templateSlug}
          onSave={(page) => {
            router.push('/mes-documents?tab=pages');
          }}
          onClose={() => router.back()}
        />
      </div>
    </div>
  );
}
