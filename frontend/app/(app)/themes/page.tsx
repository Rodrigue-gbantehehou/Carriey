'use client';
import config from '@/lib/config';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Palette, Search, Star, ExternalLink, CheckCircle2 } from 'lucide-react';

type ThemeCategory = 'all' | 'cv' | 'cover_letter' | 'page';

interface DbTheme {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  preview_image: string | null;
  price: number;
  currency: string;
  template_type: string;
}

export default function ThemesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  
  const isUserPro = session?.user?.subscription_status === 'active';
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';
  const hasProAccess = isUserPro || isAdmin;

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<ThemeCategory>('all');
  const [activeTheme, setActiveTheme] = useState<string>('classique');
  
  const [dbThemes, setDbThemes] = useState<DbTheme[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchThemes = async () => {
      try {
        const res = await fetch(`${config.apiBaseUrl}/templates`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setDbThemes(data);
        }
      } catch (err) {
        console.error("Erreur de chargement des thèmes:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    
    fetchThemes();
    return () => { isMounted = false; };
  }, []);

  const filteredThemes = dbThemes.filter(theme => {
    const matchesSearch = theme.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filter === 'all' || 
      theme.template_type === filter || 
      (filter === 'page' && ['public_page', 'page_publique', 'public', 'profil'].includes(theme.template_type));
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 animate-fade-in pb-24">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Thèmes et designs</h1>
          <p className="text-base text-gray-500 mt-1">
            Personnalisez l'apparence de vos CV et de votre profil public.
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        
        {/* Category tabs */}
        <div className="flex items-center gap-1 bg-white/60 backdrop-blur-md border border-gray-200/60 p-1.5 rounded-2xl overflow-x-auto hide-scrollbar shadow-sm w-full md:w-auto">
          <button 
            onClick={() => setFilter('all')} 
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${filter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
          >
            Tous
          </button>
          <button 
            onClick={() => setFilter('cv')} 
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${filter === 'cv' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
          >
            CV
          </button>
          <button 
            onClick={() => setFilter('cover_letter')} 
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${filter === 'cover_letter' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
          >
            Lettres
          </button>
          <button 
            onClick={() => setFilter('page')} 
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${filter === 'page' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
          >
            Pages
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher un thème..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/60 backdrop-blur-md border border-gray-200/60 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Grid of Themes */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          {filteredThemes.map((theme) => {
            const isActive = activeTheme === (theme.slug || theme.id);
            const isThemePro = theme.price > 0;
            const requiresPayment = isThemePro && !hasProAccess;
            const category = 'Moderne'; // Default mock category for now
            
            return (
              <div 
                key={theme.id}
                className="bg-white/60 backdrop-blur-md rounded-3xl overflow-hidden shadow-sm transition-all duration-300 group flex flex-col cursor-pointer border border-gray-200/60 hover:shadow-xl hover:shadow-indigo-600/5 hover:-translate-y-1 hover:border-indigo-200"
              >
                {/* Preview Box - Padded like documents */}
                <div className="aspect-[1/1.4] bg-gray-100 border-b border-gray-100 relative overflow-hidden flex items-center justify-center p-4">
                  <div className="w-full h-full bg-white shadow-sm rounded-sm p-0 relative border border-gray-100 transition-transform group-hover:scale-[1.02] overflow-hidden">
                    {theme.preview_image ? (
                      <img 
                        src={theme.preview_image.startsWith('http') ? theme.preview_image : `${config.staticBaseUrl}/previews/${theme.preview_image.split('/').pop()}`} 
                        alt={theme.name} 
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full p-4 flex flex-col bg-white opacity-50">
                        <div className="w-1/3 h-2 bg-gray-300 rounded-full mb-4" />
                        <div className="w-1/4 h-2 bg-gray-200 rounded-full mb-8" />
                        <div className="w-full h-1.5 bg-gray-200 rounded-full mb-2" />
                        <div className="w-5/6 h-1.5 bg-gray-200 rounded-full mb-2" />
                        <div className="w-full h-1.5 bg-gray-200 rounded-full" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Details (Text & Button) */}
                <div className="p-4 flex flex-row items-center justify-between gap-3">
                  {/* Price replaces Name */}
                  <div className="flex-1">
                    {isThemePro ? (
                      <span className="text-gray-900 text-xs font-bold flex items-center gap-1.5">
                       {hasProAccess ? (
                         <span className="text-indigo-600 flex items-center gap-1"><Star className="w-4 h-4 fill-current" /> Inclus (Pro)</span>
                       ) : (
                         <>{theme.price} {theme.currency}</>
                       )}
                      </span>
                    ) : (
                      <span className="text-gray-900 text-xs font-bold">
                        Gratuit
                      </span>
                    )}
                  </div>
                  
                  {/* Button replaces Price badge */}
                  <div>
                    <button 
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all flex items-center justify-center ${
                        requiresPayment 
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 hover:-translate-y-0.5' 
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (requiresPayment) {
                          router.push(`/checkout?type=single&templateId=${theme.id}`);
                        } else {
                          const id = theme.id;
                          if (theme.template_type === 'cover_letter') {
                            router.push(`/mes-documents/create/lettre?theme=${id}`);
                          } else if (['public_page', 'page_publique', 'public', 'profil'].includes(theme.template_type)) {
                            router.push(`/mes-documents/create/page-publique?theme=${id}`);
                          } else {
                            router.push(`/mes-documents/create/cv?theme=${id}`);
                          }
                        }
                      }}
                    >
                      {requiresPayment ? 'Acheter' : 'Utiliser'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredThemes.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-4">
                <Palette className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Aucun thème trouvé</h3>
              <p className="text-sm text-gray-500">Essayez de modifier votre recherche ou vos filtres.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
