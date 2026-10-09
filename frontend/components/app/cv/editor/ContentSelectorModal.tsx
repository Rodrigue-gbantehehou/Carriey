import React, { useState } from 'react';
import { useCvStore } from '@/store/cv';
import { useProfileStore } from '@/store/profile';
import { useSession } from 'next-auth/react';
import { cvApi } from '@/lib/cv-api';
import { Save, Loader2, Eye, EyeOff, X, Filter } from 'lucide-react';

interface ContentSelectorModalProps {
  cvId: string;
}

export function ContentSelectorModal({ cvId }: ContentSelectorModalProps) {
  const { data: session } = useSession();
  const cvs = useCvStore(state => state.cvs);
  const updateCv = useCvStore(state => state.updateCv);
  const profile = useProfileStore(state => state.profile);

  const cv = cvs.find(c => c.id === cvId);
  const overrides = cv?.content?.overrides || {};
  const [title, setTitle] = useState(overrides.title !== undefined ? overrides.title : '');
  const [summary, setSummary] = useState(overrides.summary !== undefined ? overrides.summary : '');
  const [experiences, setExperiences] = useState<Record<string, { description: string }>>(
    overrides.experiences || {}
  );

  const initialSections = cv?.content?.disabledSections || [];
  const initialItems = cv?.content?.disabledItems || {};

  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [disabledSections, setDisabledSections] = useState<string[]>(initialSections);
  const [disabledItems, setDisabledItems] = useState<Record<string, string[]>>(initialItems);

  if (!cv || !profile) return null;

  const handleExpChange = (id: string, val: string) => {
    setExperiences(prev => ({
      ...prev,
      [id]: { description: val }
    }));
  };

  const toggleSection = (section: string) => {
    setDisabledSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const toggleItem = (type: string, id: string) => {
    setDisabledItems(prev => {
      const typeItems = prev[type] || [];
      const newTypeItems = typeItems.includes(id)
        ? typeItems.filter(i => i !== id)
        : [...typeItems, id];
      return { ...prev, [type]: newTypeItems };
    });
  };

  const handleSave = async () => {
    if (!session?.user?.accessToken) return;
    setIsSaving(true);
    try {
      const newContent = {
        ...cv.content,
        disabledSections,
        disabledItems,
        overrides: {
          title,
          summary,
          experiences
        }
      };
      
      const updated = await cvApi.updateResume(session.user.accessToken, cv.id, {
        content: newContent
      });
      
      updateCv(cv.id, updated);
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la sauvegarde.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderSectionHeader = (title: string, sectionKey: string) => {
    const isHidden = disabledSections.includes(sectionKey);
    return (
      <div className="flex items-center justify-between py-2 border-b border-border mb-3">
        <h4 className="font-bold text-sm text-text-primary">{title}</h4>
        <button
          onClick={() => toggleSection(sectionKey)}
          className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors ${
            isHidden ? 'bg-border text-text-secondary hover:bg-border' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
          }`}
        >
          {isHidden ? <><EyeOff className="w-3 h-3" /> Masqué</> : <><Eye className="w-3 h-3" /> Visible</>}
        </button>
      </div>
    );
  };

  const renderItemToggle = (type: string, id: string, title: string, subtitle?: string) => {
    const isHidden = disabledSections.includes(type) || (disabledItems[type] || []).includes(id);
    const isSectionHidden = disabledSections.includes(type);
    
    return (
      <div key={id} className={`flex items-center justify-between p-3 border border-border rounded-panel mb-2 transition-opacity ${isHidden ? 'bg-background-subtle opacity-60' : 'bg-white hover:border-border'}`}>
        <div className="min-w-0 pr-4">
          <p className="text-sm font-semibold text-text-primary truncate">{title}</p>
          {subtitle && <p className="text-xs text-text-secondary truncate mt-0.5">{subtitle}</p>}
        </div>
        <button
          onClick={() => !isSectionHidden && toggleItem(type, id)}
          disabled={isSectionHidden}
          className={`p-2 rounded-lg flex-shrink-0 transition-colors ${
            isHidden ? 'text-text-muted bg-border' : 'text-success-text bg-emerald-50 hover:bg-emerald-100'
          }`}
        >
          {isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    );
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between p-4 bg-background-subtle hover:bg-border border border-border rounded-panel transition-colors group mt-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white text-text-secondary shadow-sm border border-border flex items-center justify-center">
            <Filter className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-text-primary">Sélection du contenu</p>
            <p className="text-xs text-text-secondary font-medium group-hover:underline">Afficher ou masquer des éléments</p>
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col sm:items-center sm:justify-center p-0 sm:p-4">
          <div className="hidden sm:block absolute inset-0 bg-text-primary/40 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)} />
          <div className="relative bg-white w-full h-[100dvh] sm:h-auto sm:max-w-form sm:max-h-[90vh] flex flex-col sm:rounded-panel shadow-2xl z-10 overflow-hidden animate-in fade-in sm:zoom-in duration-200">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-white flex-shrink-0">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary" />
                Sélection du contenu
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-panel hover:bg-primary-hover disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Valider
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 text-text-muted hover:text-text-secondary hover:bg-border rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto bg-background-subtle/50 space-y-6">
              
              <div className="bg-white p-5 rounded-panel border border-border shadow-sm">
                {renderSectionHeader("Profil / Accroche", "about")}
                {!disabledSections.includes('about') && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-text-secondary mb-1">Titre du profil (sur le CV)</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={profile.title || "Titre du poste ciblé..."}
                        className="w-full text-sm p-3 border border-border rounded-panel focus:ring-2 focus:ring-indigo-600 focus:border-transparent bg-background-subtle focus:bg-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-secondary mb-1">Accroche (Résumé)</label>
                      <textarea
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        placeholder={profile.bio || "Votre accroche..."}
                        className="w-full text-sm p-3 border border-border rounded-panel focus:ring-2 focus:ring-indigo-600 focus:border-transparent min-h-[100px] bg-background-subtle focus:bg-white transition-colors"
                      />
                    </div>
                  </div>
                )}
              </div>

              {(profile.experiences?.length || 0) > 0 && (
                <div className="bg-white p-5 rounded-panel border border-border shadow-sm">
                  {renderSectionHeader("Expériences", "experiences")}
                  <div className="mt-4 space-y-4">
                    {profile.experiences!.map(exp => (
                      <div key={exp.id}>
                        {renderItemToggle("experiences", exp.id, exp.title, exp.company)}
                        {!disabledSections.includes('experiences') && !(disabledItems['experiences'] || []).includes(exp.id) && (
                          <div className="mt-2 pl-4 border-l-2 border-indigo-100">
                            <label className="block text-xs font-bold text-text-secondary mb-1">Description personnalisée (optionnelle)</label>
                            <textarea
                              value={experiences[exp.id]?.description ?? exp.description}
                              onChange={(e) => handleExpChange(exp.id, e.target.value)}
                              className="w-full text-sm p-3 border border-border rounded-panel focus:ring-2 focus:ring-indigo-600 focus:border-transparent min-h-[100px] bg-background-subtle focus:bg-white transition-colors"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(profile.educations?.length || 0) > 0 && (
                <div className="bg-white p-5 rounded-panel border border-border shadow-sm">
                  {renderSectionHeader("Formations", "educations")}
                  <div className="mt-4">
                    {profile.educations!.map(edu => 
                      renderItemToggle("educations", edu.id, edu.degree, edu.school)
                    )}
                  </div>
                </div>
              )}

              {(profile.projects?.length || 0) > 0 && (
                <div className="bg-white p-5 rounded-panel border border-border shadow-sm">
                  {renderSectionHeader("Projets", "projects")}
                  <div className="mt-4">
                    {profile.projects!.map(proj => 
                      renderItemToggle("projects", proj.id, proj.name)
                    )}
                  </div>
                </div>
              )}

              {(profile.certifications?.length || 0) > 0 && (
                <div className="bg-white p-5 rounded-panel border border-border shadow-sm">
                  {renderSectionHeader("Certifications", "certifications")}
                  <div className="mt-4">
                    {profile.certifications!.map(cert => 
                      renderItemToggle("certifications", cert.id, cert.name, cert.issuer)
                    )}
                  </div>
                </div>
              )}

              {(profile.languages?.length || 0) > 0 && (
                <div className="bg-white p-5 rounded-panel border border-border shadow-sm">
                  {renderSectionHeader("Langues", "languages")}
                  <div className="mt-4">
                    {profile.languages!.map(lang => 
                      renderItemToggle("languages", lang.id, lang.name, lang.level)
                    )}
                  </div>
                </div>
              )}

              {(profile.skills?.length || 0) > 0 && (
                <div className="bg-white p-5 rounded-panel border border-border shadow-sm">
                  {renderSectionHeader("Compétences", "skills")}
                  <div className="mt-4">
                    {profile.skills!.map(skill => 
                      renderItemToggle("skills", skill.id, skill.name, skill.category)
                    )}
                  </div>
                </div>
              )}

              {profile.custom_sections?.map(cs => (
                <div key={cs.id} className="bg-white p-5 rounded-panel border border-border shadow-sm">
                  {renderSectionHeader(cs.title, `custom_${cs.id}`)}
                  {(cs.items?.length || 0) > 0 && (
                    <div className="mt-4">
                      {cs.items!.map(item => 
                        renderItemToggle(`custom_${cs.id}`, item.id, item.title, item.subtitle)
                      )}
                    </div>
                  )}
                </div>
              ))}
              
            </div>
          </div>
        </div>
      )}
    </>
  );
}
