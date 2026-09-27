import { useState } from 'react';
import { Eye, Trash2, ToggleLeft, ToggleRight, Copy, Check, Globe, Settings2, Share2 } from 'lucide-react';
import { PublicPage } from '@/types/public-page';
import { THEMES, daysLeft } from './constants';

export function PageCard({ page, previewImage, onEdit, onDelete, onToggle }: {
  page: PublicPage;
  previewImage?: string;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? `${window.location.origin}/p/${page.slug}` : '';
  const days = daysLeft(page.expires_at);
  const theme = THEMES.find(t => t.id === page.theme) || THEMES[0];
  const expiredOrSoon = days !== null && days <= 3;

  const copy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const shareLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: page.title,
          text: `Découvrez mon profil public sur Cariey : ${page.title}`,
          url,
        });
      } catch (err) {
        console.error('Partage annulé ou échoué', err);
      }
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`Découvrez mon profil professionnel : ${url}`)}`, '_blank');
    }
  };

  return (
    <div
      className={`group bg-white rounded-2xl border ${page.is_active ? 'border-gray-200' : 'border-gray-200 opacity-70'} overflow-hidden hover:shadow-xl hover:shadow-black/5 hover:border-indigo-200 transition-all cursor-pointer flex flex-col`}
      onClick={onEdit}
    >
      {/* Miniature area */}
      <div className="aspect-[1/1.4] bg-gray-100 border-b border-gray-100 relative overflow-hidden flex items-center justify-center p-4">
        <div className={`w-full h-full shadow-sm rounded-lg relative border border-gray-100 transition-transform group-hover:scale-[1.02] flex flex-col overflow-hidden ${!previewImage ? theme.preview : 'bg-white p-0'}`}>
          {previewImage ? (
            <img 
              src={previewImage.startsWith('http') ? previewImage : `${(process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1').replace('/api/v1', '')}/static/previews/${previewImage.split('/').pop()}`}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              <div className="bg-white/90 backdrop-blur-sm mx-2 mt-2 p-2 rounded-md flex items-center justify-between shadow-sm">
                <div className="w-6 h-6 rounded-full bg-gray-200" />
                <div className="w-10 h-1.5 rounded-full bg-gray-200" />
              </div>
              <div className="flex-1 mx-2 mt-2 bg-white/70 backdrop-blur-sm rounded-md p-2 space-y-2.5 mb-2 shadow-sm">
                <div className="w-3/4 h-2 rounded-full bg-gray-300" />
                <div className="w-1/2 h-2 rounded-full bg-gray-300" />
                <div className="w-full h-1.5 rounded-full bg-gray-200 mt-4" />
                <div className="w-5/6 h-1.5 rounded-full bg-gray-200" />
                <div className="w-4/6 h-1.5 rounded-full bg-gray-200" />
              </div>
            </>
          )}
        </div>
        
        {/* Overlay with config button */}
        <div className="absolute inset-0 bg-gray-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
          <span className="px-4 py-2 bg-white text-gray-900 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all">
            <Settings2 className="w-4 h-4" />
            Configurer
          </span>
        </div>
      </div>
      
      {/* Bottom info section */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 truncate" title={page.title}>
                {page.title}
              </h3>
              {!page.is_active && <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full shrink-0">INACTIF</span>}
            </div>
            <p className="text-xs text-indigo-600 font-mono mt-0.5 truncate">/p/{page.slug}</p>
          </div>
          <div className="flex gap-0.5 -mr-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); onToggle(); }}
              className={`p-1.5 rounded-lg transition-colors ${page.is_active ? 'text-emerald-500 hover:bg-emerald-50' : 'text-gray-300 hover:bg-gray-100'}`}
              title={page.is_active ? 'Désactiver' : 'Activer'}
            >
              {page.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Actions row */}
        <div className="flex items-center gap-2 mt-auto pt-2 border-t border-gray-50" onClick={(e) => e.stopPropagation()}>
          <span className="flex items-center gap-1 text-xs text-gray-400 mr-auto" title="Nombre de vues">
            <Eye className="w-3.5 h-3.5" /> {page.views}
          </span>
          <button onClick={shareLink} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Partager">
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={copy} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Copier le lien">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <a href={`/p/${page.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1.5 rounded-md hover:bg-indigo-100 transition-all uppercase tracking-wider">
            <Globe className="w-3 h-3" /> 
          </a>
        </div>
      </div>
    </div>
  );
}
