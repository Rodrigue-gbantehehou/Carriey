'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCvStore } from '@/store/cv';
import { useProfileStore } from '@/store/profile';
import { ChevronRight, ChevronLeft, Briefcase, FileText, CheckCircle2, Lock, Loader2 } from 'lucide-react';
import { useTemplates } from '@/hooks/useTemplates';
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

function CreateCvWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { profile } = useProfileStore();
  const { addCv, cvs } = useCvStore();

  // Logic pour le template par défaut : URL -> Dernier CV modifié -> 'classique'
  const recentCvs = cvs.filter(c => c.doc_type === 'cv')
    .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime());
  const defaultTemplate = recentCvs.length > 0 ? recentCvs[0].template_id : 'classique';
  const templateSlug = searchParams.get('template') || defaultTemplate;

  const { data: session } = useSession();
  const { templates, loading: templatesLoading } = useTemplates('cv');

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

  // Fetch profile if not loaded, then sync includedItems
  useEffect(() => {
    if (!profile && session?.user?.accessToken) {
      const loadProfile = async () => {
        try {
          const { profileApi } = await import('@/lib/profile-api');
          const { setProfile } = useProfileStore.getState();
          const data = await profileApi.getProfile(session.user.accessToken);
          if (data) setProfile(data);
        } catch (err) {
          console.error('Failed to load profile in wizard', err);
        }
      };
      loadProfile();
    }
  }, [session]);

  // When profile loads, include all items by default
  useEffect(() => {
    if (profile) {
      setIncludedItems({
        experiences: profile.experiences?.map(e => e.id) || [],
        educations: profile.educations?.map(e => e.id) || [],
        projects: profile.projects?.map(p => p.id) || [],
      });
    }
  }, [profile]);

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
      router.push(`/mes-documents/cv/${newCv.id}`);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la création du CV");
      setIsSubmitting(false);
    }
  };
  const STEP_LABELS = ['Usage', 'Sections', 'Contenu', 'Thème'];

  return (
    <div className="animate-fade-in pb-12">

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Créer un nouveau CV</h1>
        <p className="text-sm text-text-secondary mt-1">Suivez les étapes pour personnaliser votre document.</p>
      </div>

      {/* Step 4 (themes): full-width layout */}
      {step === 4 && (
        <div>
          {/* Progress */}
          <div className="flex items-center gap-3 mb-8">
            {STEP_LABELS.map((label, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i + 1 <= step ? 'bg-primary text-white' : 'bg-border text-text-muted'}`}>
                  {i + 1 <= step - 1 ? '✓' : i + 1}
                </div>
                <div className={`h-1 rounded-full flex-1 ${i + 1 < step ? 'bg-primary' : 'bg-border'}`} />
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-border p-8">
            <h2 className="text-2xl font-bold text-text-primary mb-1">Choisissez un thème</h2>
            <p className="text-sm text-text-secondary mb-8">Sélectionnez l&apos;apparence de votre CV. Vous pourrez la modifier plus tard.</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Chargement */}
              {templatesLoading && (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-panel border-2 border-border overflow-hidden animate-pulse">
                    <div className="aspect-[1/1.4] bg-border" />
                    <div className="p-3 flex items-center justify-between border-t border-border">
                      <div className="h-4 w-20 bg-border rounded" />
                      <div className="h-5 w-14 bg-border rounded-md" />
                    </div>
                  </div>
                ))
              )}

              {/* Templates depuis l'API */}
              {!templatesLoading && templates.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleFinish(t.slug)}
                  disabled={isSubmitting}
                  className="group flex flex-col text-left rounded-panel border-2 border-border hover:border-indigo-600 transition-all overflow-hidden bg-white hover:shadow-xl hover:shadow-indigo-600/10 cursor-pointer disabled:opacity-50"
                >
                  <div className="aspect-[1/1.4] bg-background-subtle relative flex items-center justify-center p-4 overflow-hidden border-b border-border">
                    <ThemeThumbnail templateId={t.slug} />
                    <div className="absolute inset-0 bg-text-primary/0 group-hover:bg-text-primary/10 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 bg-white text-text-primary px-4 py-2 rounded-full font-bold text-sm shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all">
                        {isSubmitting ? '...' : 'Choisir'}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 flex items-center justify-between border-t border-border bg-white">
                    <span className="text-sm font-bold text-text-primary">{t.name}</span>
                    {Number(t.price) > 0 ? (
                      <span className="text-xs font-bold bg-warning-bg text-warning-text px-2 py-1 rounded-md">{t.price} {t.currency}</span>
                    ) : (
                      <span className="text-xs font-bold bg-success-bg text-success-text px-2 py-1 rounded-md">Gratuit</span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 flex">
              <button onClick={() => setStep(3)} className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-secondary font-semibold px-4 py-3">
                <ChevronLeft className="w-4 h-4" /> Retour
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Steps 1-3: two-column layout */}
      {step < 4 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Left — Wizard form (2/3) */}
          <div className="lg:col-span-2">
            {/* Progress */}
            <div className="flex items-center gap-3 mb-8">
              {STEP_LABELS.map((label, i) => (
                <div key={i} className="flex items-center gap-2 flex-1 last:flex-none">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${i + 1 <= step ? 'bg-primary text-white' : 'bg-border text-text-muted'}`}>
                    {i + 1 < step ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs font-semibold hidden sm:block ${i + 1 <= step ? 'text-text-primary' : 'text-text-muted'}`}>{label}</span>
                  {i < STEP_LABELS.length - 1 && <div className={`h-1 rounded-full flex-1 transition-colors ${i + 1 < step ? 'bg-primary' : 'bg-border'}`} />}
                </div>
              ))}
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-border overflow-hidden">
              {/* STEP 1: USAGE */}
              {step === 1 && (
                <div className="p-8">
                  <h2 className="text-xl font-bold text-text-primary mb-1">Pour quel usage ?</h2>
                  <p className="text-sm text-text-secondary mb-6">Nous adapterons les conseils en fonction de votre objectif.</p>

                  <div className="space-y-3">
                    {USAGES.map((u: any) => (
                      <button
                        key={u.id}
                        onClick={() => setUsage(u.label)}
                        className={`w-full flex items-center gap-4 p-4 rounded-panel border-2 transition-all text-left ${usage === u.label
                          ? 'border-indigo-600 bg-primary-subtle/50 shadow-sm'
                          : 'border-border hover:border-border hover:bg-background-subtle'
                          }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${usage === u.label ? 'bg-primary text-white' : 'bg-border text-text-secondary'}`}>
                          <u.icon className="w-5 h-5" />
                        </div>
                        <span className={`text-sm font-semibold ${usage === u.label ? 'text-indigo-900' : 'text-text-secondary'}`}>{u.label}</span>
                        {usage === u.label && <CheckCircle2 className="w-5 h-5 text-primary ml-auto" />}
                      </button>
                    ))}
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      disabled={!usage}
                      onClick={() => setStep(2)}
                      className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-button text-sm font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50"
                    >
                      Continuer <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: SECTIONS */}
              {step === 2 && (
                <div className="p-8">
                  <h2 className="text-xl font-bold text-text-primary mb-1">Que voulez-vous inclure ?</h2>
                  <p className="text-sm text-text-secondary mb-6">carriey a pré-sélectionné les sections recommandées. Décochez ce qui ne vous sert pas.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SECTIONS.map((s: any) => {
                      const isEnabled = enabledSections.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          onClick={() => toggleSection(s.id, s.locked)}
                          className={`flex items-center gap-3 p-4 rounded-panel border-2 transition-all text-left ${isEnabled ? 'border-indigo-600 bg-primary-subtle/50' : 'border-border bg-background-subtle opacity-60'
                            }`}
                        >
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors flex-shrink-0 ${isEnabled ? 'bg-primary border-indigo-600 text-white' : 'border-border bg-white'
                            }`}>
                            {isEnabled && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                          <span className="text-sm font-semibold text-text-primary flex-1">{s.label}</span>
                          {s.locked && <Lock className="w-4 h-4 text-text-muted" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-8 flex justify-between">
                    <button onClick={() => setStep(1)} className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-secondary font-semibold px-4 py-3">
                      <ChevronLeft className="w-4 h-4" /> Retour
                    </button>
                    <button onClick={() => setStep(3)} className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-button text-sm font-semibold hover:bg-primary-hover transition-colors">
                      Continuer <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: ITEMS */}
              {step === 3 && (
                <div className="p-8">
                  <h2 className="text-xl font-bold text-text-primary mb-1">Sélectionnez le contenu</h2>
                  <p className="text-sm text-text-secondary mb-6">Décochez les éléments non pertinents pour cette candidature.</p>

                  <div className="space-y-8">
                    {enabledSections.includes('experiences') && (profile?.experiences?.length || 0) > 0 && (
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">Expériences</h3>
                        <div className="space-y-2">
                          {profile?.experiences?.map((exp: any) => (
                            <button
                              key={exp.id}
                              onClick={() => toggleItem('experiences', exp.id)}
                              className={`w-full flex items-center gap-3 p-3 rounded-panel border-2 transition-all text-left ${includedItems.experiences?.includes(exp.id) ? 'border-indigo-600 bg-primary-subtle/50' : 'border-border bg-background-subtle opacity-60'
                                }`}
                            >
                              <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors flex-shrink-0 ${includedItems.experiences?.includes(exp.id) ? 'bg-primary border-indigo-600 text-white' : 'border-border bg-white'
                                }`}>
                                {includedItems.experiences?.includes(exp.id) && <CheckCircle2 className="w-3.5 h-3.5" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-text-primary truncate">{exp.title}</p>
                                <p className="text-xs text-text-secondary truncate">{exp.company}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {enabledSections.includes('projects') && (profile?.projects?.length || 0) > 0 && (
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">Projets</h3>
                        <div className="space-y-2">
                          {profile?.projects?.map((proj: any) => (
                            <button
                              key={proj.id}
                              onClick={() => toggleItem('projects', proj.id)}
                              className={`w-full flex items-center gap-3 p-3 rounded-panel border-2 transition-all text-left ${includedItems.projects?.includes(proj.id) ? 'border-indigo-600 bg-primary-subtle/50' : 'border-border bg-background-subtle opacity-60'
                                }`}
                            >
                              <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors flex-shrink-0 ${includedItems.projects?.includes(proj.id) ? 'bg-primary border-indigo-600 text-white' : 'border-border bg-white'
                                }`}>
                                {includedItems.projects?.includes(proj.id) && <CheckCircle2 className="w-3.5 h-3.5" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-text-primary truncate">{proj.name}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {enabledSections.includes('educations') && (profile?.educations?.length || 0) > 0 && (
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">Formation</h3>
                        <div className="space-y-2">
                          {profile?.educations?.map(edu => (
                            <button
                              key={edu.id}
                              onClick={() => toggleItem('educations', edu.id)}
                              className={`w-full flex items-center gap-3 p-3 rounded-panel border-2 transition-all text-left ${includedItems.educations?.includes(edu.id) ? 'border-indigo-600 bg-primary-subtle/50' : 'border-border bg-background-subtle opacity-60'
                                }`}
                            >
                              <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors flex-shrink-0 ${includedItems.educations?.includes(edu.id) ? 'bg-primary border-indigo-600 text-white' : 'border-border bg-white'
                                }`}>
                                {includedItems.educations?.includes(edu.id) && <CheckCircle2 className="w-3.5 h-3.5" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-text-primary truncate">{edu.degree}</p>
                                <p className="text-xs text-text-secondary truncate">{edu.school}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 flex justify-between">
                    <button onClick={() => setStep(2)} className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-secondary font-semibold px-4 py-3">
                      <ChevronLeft className="w-4 h-4" /> Retour
                    </button>
                    <button
                      onClick={() => {
                        if (templateSlug) {
                          handleFinish(templateSlug);
                        } else {
                          setStep(4);
                        }
                      }}
                      className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-button text-sm font-semibold hover:bg-primary-hover transition-colors"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Création...' : (templateSlug ? 'Créer le CV' : 'Continuer')} <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right — Summary panel (1/3) */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-3xl shadow-sm border border-border p-6 sticky top-6">
              <h3 className="text-sm font-bold text-text-primary mb-4">Récapitulatif</h3>

              <div className="space-y-4">
                {/* Usage */}
                <div>
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Usage</p>
                  {usage ? (
                    <p className="text-sm font-semibold text-text-primary">{usage}</p>
                  ) : (
                    <p className="text-sm text-text-muted italic">Non sélectionné</p>
                  )}
                </div>

                {step >= 2 && (
                  <div>
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Sections</p>
                    <div className="flex flex-wrap gap-1.5">
                      {SECTIONS.filter(s => enabledSections.includes(s.id)).map(s => (
                        <span key={s.id} className="text-xs bg-background-subtle border border-border text-text-primary font-semibold px-2 py-1 rounded-lg">{s.label}</span>
                      ))}
                    </div>
                  </div>
                )}

                {step >= 3 && (
                  <div>
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Contenu sélectionné</p>
                    <p className="text-sm text-text-secondary">
                      {(includedItems.experiences?.length || 0) + (includedItems.educations?.length || 0) + (includedItems.projects?.length || 0)} éléments inclus
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-xs text-text-muted">Étape {step} sur 4</p>
                <div className="mt-2 h-1.5 bg-border rounded-full">
                  <div className="h-1.5 bg-primary rounded-full transition-all" style={{ width: `${(step / 4) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreateCvWizard() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center text-text-secondary">Chargement...</div>}>
      <CreateCvWizardContent />
    </Suspense>
  );
}
