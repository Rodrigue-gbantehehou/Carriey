import type { Metadata } from 'next';
import { publicPagesApi } from '@/lib/public-pages-api';
import { PublicPageData } from '@/types/public-page';
import { MinimalTheme, ModernTheme, BoldTheme, ElegantTheme } from '@/components/themes/PublicThemes';
import Link from 'next/link';
import { AlertTriangle, Clock, Eye } from 'lucide-react';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const data = await publicPagesApi.getPublic(params.slug);
    const name = [data.profile.first_name, data.profile.last_name].filter(Boolean).join(' ') || data.profile.username || 'Profil';
    const title = `${name} — ${data.page.title}`;
    const description = data.profile.bio?.substring(0, 160) || `Découvrez le profil professionnel et les réalisations de ${name}.`;
    
    // Fallback to a default generic image if the user doesn't have a photo or hides it
    const imageUrl = (data.page.show_photo && data.profile.photo_url) 
      ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${data.profile.photo_url}`
      : `${process.env.NEXT_PUBLIC_APP_URL || 'https://cariey.com'}/og-default.jpg`; 

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'profile',
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://cariey.com'}/p/${data.page.slug}`,
        images: [
          {
            url: imageUrl,
            width: 800,
            height: 800,
            alt: `Photo de profil de ${name}`,
          }
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
      }
    };
  } catch {
    return { title: 'Page introuvable' };
  }
}

function ErrorPage({ status, message }: { status: number; message: string }) {
  const isExpired = status === 410;
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className={`w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center ${isExpired ? 'bg-amber-100' : 'bg-red-100'}`}>
          {isExpired ? <Clock className="w-8 h-8 text-amber-500" /> : <AlertTriangle className="w-8 h-8 text-red-500" />}
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">
          {isExpired ? 'Lien expiré' : 'Page introuvable'}
        </h1>
        <p className="text-gray-500 text-sm mb-6">{message}</p>
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:underline">
          ← Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}

export default async function PublicProfilePage({ params }: Props) {
  let data: PublicPageData;

  try {
    data = await publicPagesApi.getPublic(params.slug);
  } catch (err: any) {
    const status = err?.response?.status || 404;
    const detail = err?.response?.data?.detail || 'Cette page n\'existe pas ou a été supprimée.';
    return <ErrorPage status={status} message={detail} />;
  }

  const { page } = data;
  const accent = page.accent_color || '#6366f1';

  const ThemeComponent = {
    minimal: MinimalTheme,
    modern: ModernTheme,
    bold: BoldTheme,
    elegant: ElegantTheme,
  }[page.theme] ?? ModernTheme;

  return (
    <>
      <ThemeComponent data={data} accent={accent} />
      {/* Subtle branding footer */}
      <div className="fixed bottom-4 right-4 z-50">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-[10px] font-bold text-white/80 bg-black/30 backdrop-blur-sm px-2.5 py-1.5 rounded-full hover:bg-black/50 transition-colors"
        >
          <Eye className="w-2.5 h-2.5" />
          Créer votre profil
        </Link>
      </div>
    </>
  );
}
