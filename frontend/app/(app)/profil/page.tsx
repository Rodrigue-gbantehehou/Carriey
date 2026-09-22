"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useProfileStore } from '@/store/profile';
import ExperienceList from '@/components/app/profile/ExperienceList';
import EducationList from '@/components/app/profile/EducationList';
import SkillsList from '@/components/app/profile/SkillsList';
import ProjectsList from '@/components/app/profile/ProjectsList';
import { LanguagesList, CertificationsList } from '@/components/app/profile/ExtrasLists';
import Link from 'next/link';

import {
  User, FileText, Briefcase, GraduationCap, Wrench,
  FolderOpen, Award, Globe, Eye, Save, ChevronDown, Plus, Trash2, X
} from 'lucide-react';

type SectionId = 'personal' | 'about' | 'experiences' | 'education' | 'skills' | 'projects' | 'certifications' | 'languages' | string;
interface Section { id: SectionId; label: string; icon: React.ReactNode; description: string; isCustom?: boolean; }

const BASE_SECTIONS: Section[] = [
  { id: 'personal',       label: 'Informations',  icon: <User className="w-4 h-4" />,          description: 'Nom, métier, email, liens…' },
  { id: 'about',          label: 'À propos',       icon: <FileText className="w-4 h-4" />,      description: 'Quelques mots sur vous' },
  { id: 'experiences',    label: 'Expériences',    icon: <Briefcase className="w-4 h-4" />,     description: 'Vos emplois et missions' },
  { id: 'education',      label: 'Formations',     icon: <GraduationCap className="w-4 h-4" />, description: 'Diplômes et études' },
  { id: 'skills',         label: 'Compétences',    icon: <Wrench className="w-4 h-4" />,        description: 'Ce que vous savez faire' },
  { id: 'projects',       label: 'Projets',        icon: <FolderOpen className="w-4 h-4" />,    description: 'Vos réalisations' },
  { id: 'certifications', label: 'Certifications', icon: <Award className="w-4 h-4" />,         description: 'Permis, licences, diplômes' },
  { id: 'languages',      label: 'Langues',        icon: <Globe className="w-4 h-4" />,         description: 'Les langues que vous parlez' },
];

const input = "block w-full rounded-lg border border-gray-200 bg-white py-2.5 px-3 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all";

function SectionContent({ id, profile, about, setAbout, updateProfile }: {
  id: SectionId; profile: any; about: string; setAbout: (v: string) => void; updateProfile: (data: any) => void;
}) {
  if (id.startsWith('custom_')) {
    const customId = id.replace('custom_', '');
    const cs = profile?.custom_sections?.find((s: any) => s.id === customId);
    if (!cs) return null;

    const renderContentEditor = () => {
      if (cs.type === 'simple_list' || cs.type === 'detailed_list') {
        const items = cs.items || [];
        return (
          <div className="space-y-4">
            {items.map((item: any) => (
              <div key={item.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 relative group">
                <button 
                  onClick={() => {
                    const newSections = profile.custom_sections.map((s: any) => 
                      s.id === customId ? { ...s, items: s.items.filter((i: any) => i.id !== item.id) } : s
                    );
                    updateProfile({ custom_sections: newSections });
                  }}
                  title="Supprimer l'élément"
                  className="absolute top-3 right-3 text-red-400 hover:text-red-600 p-1.5 bg-white rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity border border-red-100 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className={cs.type === 'simple_list' ? 'sm:col-span-2 pr-8' : 'pr-8 sm:pr-0'}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Titre</label>
                    <input type="text" value={item.title} onChange={e => {
                      const newSections = profile.custom_sections.map((s: any) => 
                        s.id === customId ? { ...s, items: s.items.map((i: any) => i.id === item.id ? { ...i, title: e.target.value } : i) } : s
                      );
                      updateProfile({ custom_sections: newSections });
                    }} className={input} placeholder="Ex: Gestion de projet, 2021..." />
                  </div>
                  
                  {cs.type === 'detailed_list' && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Sous-titre / Organisation</label>
                        <input type="text" value={item.subtitle || ''} onChange={e => {
                          const newSections = profile.custom_sections.map((s: any) => 
                            s.id === customId ? { ...s, items: s.items.map((i: any) => i.id === item.id ? { ...i, subtitle: e.target.value } : i) } : s
                          );
                          updateProfile({ custom_sections: newSections });
                        }} className={input} placeholder="Lieu, Entreprise..." />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Période</label>
                        <input type="text" value={item.date || ''} onChange={e => {
                          const newSections = profile.custom_sections.map((s: any) => 
                            s.id === customId ? { ...s, items: s.items.map((i: any) => i.id === item.id ? { ...i, date: e.target.value } : i) } : s
                          );
                          updateProfile({ custom_sections: newSections });
                        }} className={input} placeholder="ex: 2020 - 2023" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Description</label>
                        <textarea rows={2} value={item.description || ''} onChange={e => {
                          const newSections = profile.custom_sections.map((s: any) => 
                            s.id === customId ? { ...s, items: s.items.map((i: any) => i.id === item.id ? { ...i, description: e.target.value } : i) } : s
                          );
                          updateProfile({ custom_sections: newSections });
                        }} className={`${input} resize-y`} placeholder="Détails supplémentaires..." />
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
            
            <button
              onClick={() => {
                const newItem = { id: Date.now().toString(), title: '' };
                const newSections = profile.custom_sections.map((s: any) => 
                  s.id === customId ? { ...s, items: [...(s.items || []), newItem] } : s
                );
                updateProfile({ custom_sections: newSections });
              }}
              className="w-full py-3 flex items-center justify-center gap-2 border-2 border-dashed border-indigo-200 rounded-xl bg-indigo-50/30 text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50/80 transition-all font-semibold text-sm"
            >
              <Plus className="w-4 h-4" />
              Ajouter un élément
            </button>
          </div>
        );
      }

      // Fallback for 'text' or undefined
      return (
        <textarea 
          rows={8} 
          value={cs.content || ''} 
          onChange={e => {
            const newSections = profile.custom_sections.map((s: any) => s.id === customId ? { ...s, content: e.target.value } : s);
            updateProfile({ custom_sections: newSections });
          }} 
          className={`${input} resize-y min-h-[100px]`} 
          placeholder="Écrivez librement ici..." 
        />
      );
    };

    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Titre de la section</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={cs.title} 
              onChange={e => {
                const newSections = profile.custom_sections.map((s: any) => s.id === customId ? { ...s, title: e.target.value } : s);
                updateProfile({ custom_sections: newSections });
              }} 
              className={input} 
            />
            <button 
              onClick={() => {
                if (confirm("Supprimer complètement cette section ?")) {
                  updateProfile({ custom_sections: profile.custom_sections.filter((s: any) => s.id !== customId) });
                }
              }}
              title="Supprimer la section entière"
              className="px-3 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg border border-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="block text-sm font-medium text-gray-700">Contenu</label>
            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
              {cs.type === 'simple_list' ? 'Liste simple' : cs.type === 'detailed_list' ? 'Liste détaillée' : 'Texte libre'}
            </span>
          </div>
          {renderContentEditor()}
        </div>
      </div>
    );
  }

  switch (id) {
    case 'personal': return (
      <div className="space-y-5">
        <div className="flex items-center gap-5 pb-2">
          <div className="w-20 h-20 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
            {profile?.photo_url ? (
              <img src={profile.photo_url} alt="Profil" className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Photo de profil</label>
            <p className="text-xs text-gray-500 mb-2">Recommandé : image carrée, max 2MB.</p>
            <button type="button" className="text-xs font-semibold px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Changer la photo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Métier ou titre</label><input type="text" value={profile?.title || ''} onChange={e => updateProfile({ title: e.target.value })} placeholder="Ex : Infirmière, Graphiste…" className={input} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse de profil <span className="text-xs font-normal text-gray-400">cariey.com/<strong>vous</strong></span></label><input type="text" value={profile?.username || ''} onChange={e => updateProfile({ username: e.target.value })} placeholder="jean-dupont" className={input} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Email de contact</label><input type="email" value={profile?.contact_email || ''} onChange={e => updateProfile({ contact_email: e.target.value })} placeholder="votre@email.com" className={input} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label><input type="tel" value={profile?.contact_phone || ''} onChange={e => updateProfile({ contact_phone: e.target.value })} placeholder="+229 00 00 00 00" className={input} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Ville / Pays</label><input type="text" value={profile?.location || ''} onChange={e => updateProfile({ location: e.target.value })} placeholder="Cotonou, Bénin" className={input} /></div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Visibilité</label>
            <select value={profile?.visibility || 'public'} onChange={e => updateProfile({ visibility: e.target.value })} className={input}>
              <option value="public">Tout le monde</option>
              <option value="link_only">Avec mon lien seulement</option>
              <option value="private">Moi uniquement</option>
            </select>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Liens en ligne <span className="font-normal normal-case">(optionnels)</span></p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">LinkedIn</label><input type="url" value={profile?.linkedin_url || ''} onChange={e => updateProfile({ linkedin_url: e.target.value })} placeholder="linkedin.com/in/votre-nom" className={input} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Site web</label><input type="url" value={profile?.website || ''} onChange={e => updateProfile({ website: e.target.value })} placeholder="www.votre-site.com" className={input} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">GitHub</label><input type="url" value={profile?.github_url || ''} onChange={e => updateProfile({ github_url: e.target.value })} placeholder="github.com/vous" className={input} /></div>
          </div>
        </div>
      </div>
    );
    case 'about': return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">En quelques mots</label>
        <textarea rows={5} value={about} onChange={e => { setAbout(e.target.value); updateProfile({ bio: e.target.value }); }}
          placeholder="Votre parcours, ce que vous aimez faire, ce qui vous distingue…"
          className={`${input} resize-none`} />
        <p className="mt-1.5 text-xs text-gray-400">{about.length} caractères · Recommandé : 100–300</p>
      </div>
    );
    case 'experiences':    return <ExperienceList />;
    case 'education':      return <EducationList />;
    case 'skills':         return <SkillsList />;
    case 'projects':       return <ProjectsList />;
    case 'certifications': return <CertificationsList />;
    case 'languages':      return <LanguagesList />;
    default:               return null;
  }
}

function AccordionBlock({ section, profile, about, setAbout, updateProfile, defaultOpen = false }: {
  section: Section; profile: any; about: string; setAbout: (v: string) => void; updateProfile: (data: any) => void; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const { data: session } = useSession();

  const handleSave = async () => {
    if (!session?.user?.accessToken) return;
    try {
      const { profileApi } = await import('@/lib/profile-api');
      await profileApi.updateProfile(session.user.accessToken, profile);
      alert("Vos modifications ont été sauvegardées avec succès !");
    } catch (err) {
      console.error("Error saving profile", err);
      alert("Erreur lors de la sauvegarde.");
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left">
        <div className="flex items-center gap-3">
          <span className={`flex items-center justify-center w-8 h-8 rounded-lg ${section.isCustom ? 'bg-amber-100 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
            {section.icon}
          </span>
          <div>
            <p className="text-sm font-semibold text-gray-900">{section.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{section.description}</p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="border-t border-gray-100">
          <div className="px-5 py-5">
            <SectionContent id={section.id} profile={profile} about={about} setAbout={setAbout} updateProfile={updateProfile} />
          </div>
          <div className="bg-gray-50 border-t border-gray-100 px-5 py-3 flex justify-end">
            <button 
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              Sauvegarder {section.label.toLowerCase()}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilPage() {
  const { data: session } = useSession();
  const { profile, setProfile, updateProfile, setLoading, isLoading } = useProfileStore();
  const [about, setAbout] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionType, setNewSectionType] = useState<'text' | 'simple_list' | 'detailed_list'>('text');

  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.user?.accessToken) {
        setLoading(true);
        try {
          const { profileApi } = await import('@/lib/profile-api');
          const data = await profileApi.getProfile(session.user.accessToken);
          if (data) {
            setProfile(data);
            setAbout(data.bio || '');
          }
        } catch (err) {
          console.error("Error fetching profile", err);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchProfile();
  }, [session, setProfile, setLoading]);

  const handleAddCustomSection = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newSectionTitle.trim()) return;
    
    const newSection = {
      id: Date.now().toString(),
      title: newSectionTitle.trim(),
      type: newSectionType,
      content: newSectionType === 'text' ? '' : undefined,
      items: newSectionType !== 'text' ? [] : undefined
    };
    
    updateProfile({
      custom_sections: [...(profile?.custom_sections || []), newSection]
    });
    
    setNewSectionTitle('');
    setNewSectionType('text');
    setIsModalOpen(false);
  };

  if (isLoading) return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
    </div>
  );

  const customSections: Section[] = (profile?.custom_sections || []).map((cs: any) => ({
    id: `custom_${cs.id}`,
    label: cs.title,
    icon: <FileText className="w-4 h-4" />,
    description: cs.type === 'simple_list' ? 'Liste simple' : cs.type === 'detailed_list' ? 'Liste détaillée' : 'Texte libre',
    isCustom: true
  }));

  const ALL_SECTIONS = [...BASE_SECTIONS, ...customSections];

  return (
    <div className="h-full bg-gray-50/50">
      <div className="max-w-7xl mx-auto w-full px-4">
        {/* Header */}
        <div className="pt-8 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
            <p className="text-sm text-gray-400 mt-1">Ajoutez ce qui vous concerne. Rien n'est obligatoire.</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button 
              onClick={() => {
                localStorage.setItem('cariey_draft_profile', JSON.stringify(profile));
                alert("Votre profil a été sauvegardé avec succès ! (V1: Sauvegarde locale)");
              }}
              className="inline-flex items-center gap-1.5 border border-gray-200 bg-white text-sm font-medium text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Save className="w-4 h-4 text-indigo-500" />
              Sauvegarder tout
            </button>
            <Link href={profile?.username ? `/${profile.username}` : '/apercu'} target="_blank"
              className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
              <Eye className="w-4 h-4" />
              Voir
            </Link>
          </div>
        </div>

        {/* Accordion List */}
        <div className="pb-12 space-y-4">
          {ALL_SECTIONS.map((section, idx) => (
            <AccordionBlock 
              key={section.id} 
              section={section} 
              profile={profile} 
              about={about} 
              setAbout={setAbout} 
              updateProfile={updateProfile}
              defaultOpen={idx === 0} 
            />
          ))}
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full mt-6 py-4 flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-2xl bg-transparent text-gray-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all font-semibold text-sm group"
          >
            <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Ajouter une section personnalisée
          </button>
        </div>
      </div>

      {/* Custom Section Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Nouvelle section</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddCustomSection}>
              <div className="p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la section
                </label>
                <input
                  type="text"
                  autoFocus
                  value={newSectionTitle}
                  onChange={e => setNewSectionTitle(e.target.value)}
                  placeholder="Ex: Hobbies, Bénévolat, Langues étrangères..."
                  className="block w-full rounded-xl border border-gray-200 bg-white py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all"
                />
                
                <label className="block text-sm font-medium text-gray-700 mb-2 mt-5">
                  Type de contenu
                </label>
                <select
                  value={newSectionType}
                  onChange={e => setNewSectionType(e.target.value as any)}
                  className="block w-full rounded-xl border border-gray-200 bg-white py-3 px-4 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all cursor-pointer"
                >
                  <option value="text">Texte libre (paragraphe, description...)</option>
                  <option value="simple_list">Liste simple (compétences, atouts...)</option>
                  <option value="detailed_list">Liste détaillée (avec dates, lieux...)</option>
                </select>
                
                <p className="text-xs text-gray-500 mt-2">
                  {newSectionType === 'text' && "Idéal pour écrire un long paragraphe ou des notes libres."}
                  {newSectionType === 'simple_list' && "Idéal pour énumérer des éléments simples (ex: intérêts)."}
                  {newSectionType === 'detailed_list' && "Idéal pour structurer des expériences avec dates et lieux."}
                </p>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!newSectionTitle.trim()}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
