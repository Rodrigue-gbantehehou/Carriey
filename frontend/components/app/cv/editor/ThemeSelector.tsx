import React from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { ThemeThumbnail } from '../shared/ThemeThumbnail';
import { THEMES } from '@/config/themes';

interface ThemeSelectorProps {
  currentTemplateId: string;
  resolvedTemplateName: string;
  onSelectTheme: (themeId: string) => void;
  onClose: () => void;
}

export function ThemeSelector({
  currentTemplateId,
  resolvedTemplateName,
  onSelectTheme,
  onClose
}: ThemeSelectorProps) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h3 className="text-sm font-bold text-gray-900">Choisir un modèle</h3>
      </div>
      <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar p-1">
        {THEMES.map(t => (
          <button
            key={t.id}
            onClick={() => onSelectTheme(t.id)}
            className={`relative aspect-[1/1.4] rounded-xl border-2 overflow-hidden flex flex-col transition-all bg-white group ${resolvedTemplateName === t.id.toLowerCase() ? 'border-indigo-600 shadow-md shadow-indigo-100' : 'border-gray-100 hover:border-indigo-300'}`}
          >
            <div className="flex-1 p-2 flex items-center justify-center border-b border-gray-50 bg-gray-50/50">
              <ThemeThumbnail templateId={t.id} />
            </div>
            {currentTemplateId === t.id && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-sm z-10">
                <Check className="w-3 h-3" />
              </div>
            )}
            <div className="p-2 text-center bg-white">
              <span className="text-xs font-semibold text-gray-900">{t.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
