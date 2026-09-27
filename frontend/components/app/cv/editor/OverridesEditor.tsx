import React, { useState } from 'react';
import { useCvStore } from '@/store/cv';
import { useProfileStore } from '@/store/profile';
import { useSession } from 'next-auth/react';
import { cvApi } from '@/lib/cv-api';
import { Save, Loader2, Sparkles, AlertTriangle, EyeOff, X } from 'lucide-react';

interface OverridesEditorProps {
  cvId: string;
}

export function OverridesEditor({ cvId }: OverridesEditorProps) {
  const { data: session } = useSession();
  const cvs = useCvStore(state => state.cvs);
  const updateCv = useCvStore(state => state.updateCv);
  const profile = useProfileStore(state => state.profile);

  const cv = cvs.find(c => c.id === cvId);
  const overrides = cv?.content?.overrides || {};

  const [summary, setSummary] = useState(overrides.summary || '');
  const [experiences, setExperiences] = useState<Record<string, { description: string }>>(
    overrides.experiences || {}
  );
  
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const disabledSections = cv?.content?.disabledSections || [];
  const disabledItems = cv?.content?.disabledItems || {};
  
  const hasDisabledContent = disabledSections.length > 0 || Object.values(disabledItems).some((arr: any) => arr.length > 0);

  if (!cv || !profile) return null;

  const handleExpChange = (id: string, val: string) => {
    setExperiences(prev => ({
      ...prev,
      [id]: { description: val }
    }));
  };

  const handleSave = async () => {
    if (!session?.user?.accessToken) return;
    setIsSaving(true);
    try {
      const newContent = {
        ...cv.content,
        overrides: {
          summary,
          experiences
        }
      };
      
      const updated = await cvApi.updateResume(session.user.accessToken, cv.id, {
        content: newContent
      });
      
      updateCv(cv.id, updated);
      alert("Contenu ciblé sauvegardé !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la sauvegarde.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="pt-6 border-t border-gray-100 mt-6">
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between p-4 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-xl transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-indigo-900">Adaptation IA active</p>
            <p className="text-xs text-indigo-600 font-medium group-hover:underline">Voir et retoucher le contenu</p>
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                Éditeur de contenu ciblé
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Sauvegarder
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto bg-gray-50/50">
              <p className="text-sm text-indigo-900 mb-6 bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex gap-3 items-start shadow-sm">
                <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0 text-indigo-600" />
                <span>Ce CV utilise un contenu adapté par IA. Vous pouvez retoucher librement l'accroche et les expériences modifiées ici, <strong>sans impacter votre Master Profile !</strong></span>
              </p>

              {hasDisabledContent && (
                <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl shadow-sm">
                  <h4 className="text-sm font-bold text-orange-900 flex items-center gap-2 mb-3">
                    <EyeOff className="w-4 h-4 text-orange-600" />
                    Éléments masqués par l'IA
                  </h4>
                  <ul className="text-xs text-orange-800 list-disc list-inside space-y-1.5 ml-1">
                    {disabledSections.map((s: string) => (
                      <li key={s}>Section entière : <span className="font-bold">{s}</span></li>
                    ))}
                    {Object.entries(disabledItems).map(([type, ids]: [string, any]) => 
                      ids.map((id: string) => (
                        <li key={`${type}-${id}`}>Élément masqué dans : <span className="font-bold">{type}</span></li>
                      ))
                    )}
                  </ul>
                </div>
              )}

              <div className="space-y-6">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <label className="block text-sm font-bold text-gray-900 mb-2">Accroche (Résumé)</label>
                  <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="w-full text-sm p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent min-h-[120px] transition-all bg-gray-50 focus:bg-white"
                  />
                </div>

                {profile.experiences?.filter(exp => experiences[exp.id]).map((exp) => (
                  <div key={exp.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      {exp.title} chez <span className="text-indigo-600">{exp.company}</span>
                    </label>
                    <textarea
                      value={experiences[exp.id]?.description || ''}
                      onChange={(e) => handleExpChange(exp.id, e.target.value)}
                      className="w-full text-sm p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent min-h-[160px] transition-all bg-gray-50 focus:bg-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
