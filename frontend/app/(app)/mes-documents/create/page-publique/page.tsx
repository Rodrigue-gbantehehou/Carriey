'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft } from 'lucide-react';
import { PageEditor } from '@/components/app/public-page/editor/PageEditor';
import { Suspense } from 'react';

function CreatePublicPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const templateSlug = searchParams.get('template') || 'modern';

  return (
    <div className="font-sans animate-fade-in pb-12">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-border rounded-full text-text-secondary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Créer une Page Publique</h1>
          <p className="text-sm text-text-secondary mt-1">Configurez les informations et le design de votre profil public.</p>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-panel shadow-sm border border-border">
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

export default function CreatePublicPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-text-secondary">Chargement...</div>}>
      <CreatePublicPageContent />
    </Suspense>
  );
}
