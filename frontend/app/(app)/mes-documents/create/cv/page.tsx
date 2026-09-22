'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCvStore } from '@/store/cv';
import { useProfileStore } from '@/store/profile';
import { ChevronRight, ChevronLeft, Briefcase, FileText, CheckCircle2, Lock } from 'lucide-react';
import { THEMES } from '@/config/themes';
import { ThemeThumbnail } from '@/components/app/cv/shared/ThemeThumbnail';

const USAGES = [
  { id: 'emploi', label: 'Je cherche un emploi', icon: Briefcase },
  { id: 'stage', label: 'Je cherche un stage', icon: FileText },
  { id: 'spontanee', label: 'Je veux une candidature spontanée', icon: FileText },
  { id: 'general', label: 'Je veux un CV général', icon: FileText },
  { id: 'autre', label: 'Autre', icon: FileText },
];

const SECTIONS = [
  { id: 'personal', label: 'Informations personnelles', defaultEnabled: true, locked: true }, // Cannot be disabled entirely easily, or maybe yes, but let's lock it
  { id: 'about', label: 'À propos', defaultEnabled: true },
  { id: 'experiences', label: 'Expériences', defaultEnabled: true },
  { id: 'educations', label: 'Formation', defaultEnabled: true },
  { id: 'skills', label: 'Compétences', defaultEnabled: true },
  { id: 'projects', label: 'Projets', defaultEnabled: true },
  { id: 'certifications', label: 'Certifications', defaultEnabled: false },
];

export default function CreateCvWizard() {
  const router = useRouter();
  const { profile } = useProfileStore();
  const { addCv } = useCvStore();
  
  const { data: session } = useSession();
  
  const [step, setStep] = useState(1);
  const [usage, setUsage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Sections toggle
  const [enabledSections, setEnabledSections] = useState<string[]>(
    SECTIONS.filter(s => s.defaultEnabled).map(s => s.id)
  );

  // Items toggle: true means INCLUDED
  const [includedItems, setIncludedItems] = useState<Record<string, string[]>>({
    experiences: profile?.experiences?.map(e => e.id) || [],
    educations: profile?.educations?.map(e => e.id) || [],
    projects: profile?.projects?.map(p => p.id) || [],
  });

  const toggleSection = (id: string, locked?: boolean) => {
    if (locked) return;
    setEnabledSections(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleItem = (category: string, id: string) => {
    setIncludedItems(prev => {
      const cat = prev[category] || [];
      return {
        ...prev,
        [category]: cat.includes(id) ? cat.filter(x => x !== id) : [...cat, id]
      };
    });
  };

  const handleFinish = async (themeId: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      // Determine disabled sections
      const disabledSections = SECTIONS.map(s => s.id).filter(id => !enabledSections.includes(id));
      
      // Determine disabled items
      const disabledItems: Record<string, string[]> = {};
      if (profile?.experiences) {
        disabledItems.experiences = profile.experiences.filter(e => !includedItems.experiences?.includes(e.id)).map(e => e.id);
      }
      if (profile?.educations) {
        disabledItems.educations = profile.educations.filter(e => !includedItems.educations?.includes(e.id)).map(e => e.id);
      }
      if (profile?.projects) {
        disabledItems.projects = profile.projects.filter(e => !includedItems.projects?.includes(e.id)).map(e => e.id);
      }
      
      const { cvApi } = await import('@/lib/cv-api');
      
      if (!session?.user?.accessToken) {
        throw new Error("Non authentifié");
      }
      
      const payload = {
        title: `CV - ${usage || 'Général'}`,
        template_id: themeId,
        doc_type: 'cv',
        content: {
          usage,
          disabledSections,
          disabledItems,
        }
      };
      
      const newCv = await cvApi.createResume(session.user.accessToken, payload);
      
      addCv(newCv);
      router.push(`/mes-documents/${newCv.id}`);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la création du CV");
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-20">
      <div className="max-w-2xl mx-auto px-4">
        
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8 px-2">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div className={`h-1.5 rounded-full flex-1 transition-colors ${s <= step ? 'bg-indigo-600' : 'bg-gray-200'}`} />
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* STEP 1: USAGE */}
          {step === 1 && (
            <div className="p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Pour quel usage ?</h1>
              <p className="text-sm text-gray-500 mb-8">Nous adapterons les conseils en fonction de votre objectif.</p>
              
              <div className="space-y-3">
                {USAGES.map((u: any) => (
                  <button
                    key={u.id}
                    onClick={() => setUsage(u.label)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                      usage === u.label 
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' 
                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${usage === u.label ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <u.icon className="w-5 h-5" />
                    </div>
                    <span className={`text-sm font-semibold ${usage === u.label ? 'text-indigo-900' : 'text-gray-700'}`}>{u.label}</span>
                  </button>
                ))}
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  disabled={!usage}
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  Continuer <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SECTIONS */}
          {step === 2 && (
            <div className="p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Que voulez-vous inclure ?</h1>
              <p className="text-sm text-gray-500 mb-8">Cariey a pré-sélectionné les sections recommandées. Décochez ce qui ne vous sert pas.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SECTIONS.map((s: any) => {
                  const isEnabled = enabledSections.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleSection(s.id, s.locked)}
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                        isEnabled ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-100 bg-gray-50 opacity-60'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors flex-shrink-0 ${
                        isEnabled ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 bg-white'
                      }`}>
                        {isEnabled && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-sm font-semibold text-gray-900 flex-1">{s.label}</span>
                      {s.locked && <Lock className="w-4 h-4 text-gray-400" />}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex justify-between">
                <button onClick={() => setStep(1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-semibold px-4 py-3">
                  <ChevronLeft className="w-4 h-4" /> Retour
                </button>
                <button onClick={() => setStep(3)} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
                  Continuer <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ITEMS */}
          {step === 3 && (
            <div className="p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Sélectionnez le contenu</h1>
              <p className="text-sm text-gray-500 mb-8">Décochez les expériences ou projets qui ne sont pas pertinents pour cette candidature.</p>
              
              <div className="space-y-8">
                
                {enabledSections.includes('experiences') && (profile?.experiences?.length || 0) > 0 && (
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Expériences</h3>
                    <div className="space-y-2">
                      {profile?.experiences?.map((exp: any) => (
                        <button
                          key={exp.id}
                          onClick={() => toggleItem('experiences', exp.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                            includedItems.experiences?.includes(exp.id) ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-100 bg-gray-50 opacity-60'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors flex-shrink-0 ${
                            includedItems.experiences?.includes(exp.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 bg-white'
                          }`}>
                            {includedItems.experiences?.includes(exp.id) && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{exp.title}</p>
                            <p className="text-xs text-gray-500 truncate">{exp.company}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {enabledSections.includes('projects') && (profile?.projects?.length || 0) > 0 && (
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Projets</h3>
                    <div className="space-y-2">
                      {profile?.projects?.map((proj: any) => (
                        <button
                          key={proj.id}
                          onClick={() => toggleItem('projects', proj.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                            includedItems.projects?.includes(proj.id) ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-100 bg-gray-50 opacity-60'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors flex-shrink-0 ${
                            includedItems.projects?.includes(proj.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 bg-white'
                          }`}>
                            {includedItems.projects?.includes(proj.id) && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{proj.name}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Educations */}
                {enabledSections.includes('educations') && (profile?.educations?.length || 0) > 0 && (
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Formation</h3>
                    <div className="space-y-2">
                      {profile?.educations?.map(edu => (
                        <button
                          key={edu.id}
                          onClick={() => toggleItem('educations', edu.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                            includedItems.educations?.includes(edu.id) ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-100 bg-gray-50 opacity-60'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors flex-shrink-0 ${
                            includedItems.educations?.includes(edu.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 bg-white'
                          }`}>
                            {includedItems.educations?.includes(edu.id) && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{edu.degree}</p>
                            <p className="text-xs text-gray-500 truncate">{edu.school}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              <div className="mt-8 flex justify-between">
                <button onClick={() => setStep(2)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-semibold px-4 py-3">
                  <ChevronLeft className="w-4 h-4" /> Retour
                </button>
                <button onClick={() => setStep(4)} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
                  Continuer <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: THEMES */}
          {step === 4 && (
            <div className="p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Choisissez un thème</h1>
              <p className="text-sm text-gray-500 mb-8">Sélectionnez l'apparence de votre CV. Vous pourrez la modifier plus tard.</p>
              
              <div className="grid grid-cols-2 gap-4">
                {THEMES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleFinish(t.id)}
                    className="group flex flex-col text-left rounded-2xl border-2 border-gray-100 hover:border-indigo-600 transition-all overflow-hidden bg-white hover:shadow-xl hover:shadow-indigo-600/10 cursor-pointer"
                  >
                    <div className="aspect-[1/1.4] bg-gray-50 relative flex items-center justify-center p-4 overflow-hidden border-b border-gray-100">
                       <ThemeThumbnail templateId={t.id} />
                       
                       {/* Hover Overlay */}
                       <div className="absolute inset-0 bg-gray-900/0 group-hover:bg-gray-900/10 transition-colors flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 px-4 py-2 rounded-full font-bold text-sm shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all">
                            Choisir
                          </span>
                       </div>
                    </div>
                    <div className="p-4 flex items-center justify-between border-t border-gray-100 bg-white">
                      <span className="text-sm font-bold text-gray-900">{t.label}</span>
                      {t.price > 0 ? (
                        <span className="text-xs font-black bg-amber-100 text-amber-800 px-2 py-1 rounded-md">{t.price} F</span>
                      ) : (
                        <span className="text-xs font-black bg-green-100 text-green-800 px-2 py-1 rounded-md">Gratuit</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-8 flex justify-between">
                <button onClick={() => setStep(3)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-semibold px-4 py-3">
                  <ChevronLeft className="w-4 h-4" /> Retour
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
