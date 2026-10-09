'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { PageEditor } from '@/components/app/public-page/editor/PageEditor';
import { publicPagesApi } from '@/lib/public-pages-api';
import { PublicPage } from '@/types/public-page';

export default function EditPublicPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data: session, status } = useSession();
  const [page, setPage] = useState<PublicPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      if (status === 'unauthenticated') {
        router.push('/auth/login');
        return;
      }
      if (session?.user?.accessToken) {
        try {
          const pages = await publicPagesApi.list(session.user.accessToken);
          const found = pages.find(p => p.id === resolvedParams.id);
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
  }, [session, status, resolvedParams.id, router]);

  if (loading || status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-text-primary">Éditer ma Page Publique</h1>
          <p className="text-sm text-text-secondary mt-1">Modifiez les informations et le design de votre profil.</p>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-panel shadow-sm border border-border">
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
