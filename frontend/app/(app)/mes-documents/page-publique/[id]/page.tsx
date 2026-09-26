'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { PageEditor } from '@/components/app/public-page/editor/PageEditor';
import { publicPagesApi } from '@/lib/public-pages-api';
import { PublicPage } from '@/types/public-page';

export default function EditPublicPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [page, setPage] = useState<PublicPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      if (session?.user?.accessToken) {
        try {
          const pages = await publicPagesApi.list(session.user.accessToken);
          const found = pages.find(p => p.id === params.id);
          if (found) {
            setPage(found);
          } else {
            router.push('/mes-documents?tab=pages');
          }
        } catch (err) {
          console.error("Erreur de chargement", err);
          router.push('/mes-documents?tab=pages');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchPage();
  }, [session, params.id, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Éditer ma Page Publique</h1>
          <p className="text-sm text-gray-500 mt-1">Modifiez les informations et le design de votre profil.</p>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
        {page && (
          <PageEditor
            initialPage={page}
            token={session?.user?.accessToken || ''}
            onSave={() => router.push('/mes-documents?tab=pages')}
            onClose={() => router.back()}
          />
        )}
      </div>
    </div>
  );
}
