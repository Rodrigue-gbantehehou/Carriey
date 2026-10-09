import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { ThemeThumbnail } from '../shared/ThemeThumbnail';
import config from '@/lib/config';

interface TemplateMetadata {
  id: string;
  slug: string;
  name: string;
  price: number;
  preview_image?: string;
}

interface ThemeSelectorProps {
  currentTemplateId: string;
  resolvedTemplateName: string;
  onSelectTheme: (themeId: string) => void;
  onClose: () => void;
  templateType?: string; // cv, cover_letter, public_page
}

export function ThemeSelector({
  currentTemplateId,
  resolvedTemplateName,
  onSelectTheme,
  onClose,
  templateType = 'cv'
}: ThemeSelectorProps) {
  const [themes, setThemes] = useState<TemplateMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        // En attendant que l'API soit configurée pour filtrer par type (si ce n'est pas déjà le cas), 
        // on récupère tout et on filtre côté client, ou on passe le paramètre.
        const response = await fetch(`${config.apiBaseUrl}/templates`);
        if (!response.ok) throw new Error('Failed to fetch templates');
        const allTemplates = await response.json();
        // On filtre par type de template
        const filtered = allTemplates.filter((t: any) => t.template_type === templateType || !t.template_type);
        setThemes(filtered);
      } catch (error) {
        console.error("Erreur lors du chargement des templates:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, [templateType]);

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-border rounded-lg text-text-secondary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h3 className="text-sm font-bold text-text-primary">Choisir un modèle</h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar p-1">
          {themes.map(t => (
            <button
              key={t.id}
              onClick={() => onSelectTheme(t.slug)}
              className={`relative aspect-[1/1.4] rounded-panel border-2 overflow-hidden flex flex-col transition-all bg-white group ${resolvedTemplateName === t.slug.toLowerCase() ? 'border-indigo-600 shadow-md shadow-indigo-100' : 'border-border hover:border-indigo-300'}`}
            >
              <div className="flex-1 p-2 flex items-center justify-center border-b border-gray-50 bg-background-subtle/50">
                {t.preview_image ? (
                  <img
                    src={t.preview_image.startsWith('http') ? t.preview_image : `${config.staticBaseUrl}/previews/${t.preview_image.split('/').pop()}`}
                    alt={t.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <ThemeThumbnail templateId={t.slug} />
                )}
              </div>
              {currentTemplateId === t.slug && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white shadow-sm z-10">
                  <Check className="w-3 h-3" />
                </div>
              )}
              <div className="p-2 text-center bg-white flex flex-col">
                <span className="text-xs font-semibold text-text-primary truncate">{t.name}</span>
                {t.price > 0 ? (
                  <span className="text-[10px] text-amber-600 font-bold mt-0.5">{t.price} XOF</span>
                ) : (
                  <span className="text-[10px] text-success-text font-bold mt-0.5">Gratuit</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
