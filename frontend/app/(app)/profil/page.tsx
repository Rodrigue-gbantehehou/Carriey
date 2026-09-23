"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useProfileStore } from '@/store/profile';
import ExperienceList from '@/components/app/profile/ExperienceList';
import EducationList from '@/components/app/profile/EducationList';
import SkillsList from '@/components/app/profile/SkillsList';
import ProjectsList from '@/components/app/profile/ProjectsList';
import { LanguagesList, CertificationsList } from '@/components/app/profile/ExtrasLists';
import { CustomSectionsList } from '@/components/app/profile/CustomSectionsList';
import BottomSheet from '@/components/app/shared/BottomSheet';
import Link from 'next/link';
import { getPhotoUrl } from '@/lib/photo-url';

import {
  User, FileText, Briefcase, GraduationCap, Wrench,
  FolderOpen, Award, Globe, Eye, Pencil, Camera, MapPin, Mail, Phone, Link as LinkIcon, List
} from 'lucide-react';

const inputClass = "block w-full rounded-xl border border-gray-200 bg-white py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all";

export default function ProfilPage() {
  const { data: session } = useSession();
  const { profile, setProfile, updateProfile, setLoading } = useProfileStore();
  const [mounted, setMounted] = useState(false);
  
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  
  const [personalForm, setPersonalForm] = useState<any>({});
  const [aboutForm, setAboutForm] = useState<string>('');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [localPhotoPreview, setLocalPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const fetchProfile = async () => {
      if (session?.user?.accessToken) {
        setLoading(true);
        try {
          const { profileApi } = await import('@/lib/profile-api');
          const data = await profileApi.getProfile(session.user.accessToken);
          if (data) {
            setProfile(data);
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

  if (!mounted) return null;
  
  if (!profile) return (
    <div className="flex justify-center p-12">
      <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  );

  const handleSavePersonal = () => {
    updateProfile(personalForm);
    setIsEditingPersonal(false);
  };
  
  const handleSaveAbout = () => {
    updateProfile({ bio: aboutForm });
    setIsEditingAbout(false);
  };

  const openPersonalEdit = () => {
    setPersonalForm({
      first_name: profile.first_name,
      last_name: profile.last_name,
      title: profile.title,
      username: profile.username,
      contact_email: profile.contact_email,
      contact_phone: profile.contact_phone,
      location: profile.location,
      linkedin_url: profile.linkedin_url,
      website: profile.website,
      github_url: profile.github_url,
    });
    setIsEditingPersonal(true);
  };

  const openAboutEdit = () => {
    setAboutForm(profile.bio || '');
    setIsEditingAbout(true);
  };

  const SectionTitle = ({ icon, title }: { icon: React.ReactNode, title: string }) => (
    <div className="flex items-center gap-2 mb-4 px-1">
      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
        {icon}
      </div>
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
    </div>
  );
  
  const displayName = profile.first_name || profile.last_name 
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() 
    : session?.user?.name || profile.username || 'Utilisateur';

  const photoSrc = localPhotoPreview || getPhotoUrl(profile.photo_url) || null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session?.user?.accessToken) return;

    // Immediate local preview
    const localUrl = URL.createObjectURL(file);
    setLocalPhotoPreview(localUrl);
    setPhotoUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api/v1'}/profile/me/photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.user.accessToken}` },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.detail || 'Erreur lors de l\'upload');
        setLocalPhotoPreview(null); // only clear on error
        return;
      }
      const updated = await res.json();
      // Update store with server response — keeps photo on next reload
      // We do NOT clear localPhotoPreview here: blob URL stays visible for this session
      setProfile({ ...profile!, ...updated });
    } catch (err) {
      console.error('Photo upload error:', err);
      alert('Erreur lors de l\'upload de la photo');
      setLocalPhotoPreview(null);
    } finally {
      setPhotoUploading(false);
    }
  };

  return (
    <div className="px-4 py-5 space-y-6 pb-24">
      
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Mon Profil</h1>
        <Link href={profile.username ? `/${profile.username}` : '/apercu'} target="_blank"
          className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-indigo-100 transition-colors">
          <Eye className="w-4 h-4" />
          Aperçu
        </Link>
      </div>

      {/* 1. Personal Info Card */}
      <section>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 relative group overflow-hidden">
          <button 
            onClick={openPersonalEdit}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors z-10"
          >
            <Pencil className="w-4 h-4" />
          </button>
          
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-5 relative z-0">
            {/* Square photo frame with upload */}
            <label className="relative group/avatar cursor-pointer flex-shrink-0" title="Changer la photo">
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handlePhotoUpload} />
              <div className="w-24 h-24 rounded-2xl bg-gray-100 border-2 border-gray-200 flex items-center justify-center overflow-hidden transition-all group-hover/avatar:border-indigo-400">
                {photoSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoSrc} alt="Profil" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-gray-300" />
                )}
              </div>
              <div className="absolute inset-0 bg-black/50 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                {photoUploading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Camera className="w-5 h-5 text-white" />
                    <span className="text-white text-[10px] font-semibold mt-1">Modifier</span>
                  </>
                )}
              </div>
              {photoUploading && (
                <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </label>
            
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-xl font-bold text-gray-900">{displayName}</h2>
              <p className="text-indigo-600 font-medium text-sm mt-0.5">{profile.title || 'Complétez votre titre'}</p>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 mt-3 text-xs text-gray-500 font-medium">
                {profile.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{profile.location}</span>}
                {profile.contact_email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{profile.contact_email}</span>}
                {profile.contact_phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{profile.contact_phone}</span>}
              </div>
              
              {(profile.linkedin_url || profile.website || profile.github_url) && (
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-4">
                  {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 text-[11px] font-semibold hover:bg-gray-100 transition-colors"><LinkIcon className="w-3 h-3" /> LinkedIn</a>}
                  {profile.github_url && <a href={profile.github_url} target="_blank" className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 text-[11px] font-semibold hover:bg-gray-100 transition-colors"><LinkIcon className="w-3 h-3" /> GitHub</a>}
                  {profile.website && <a href={profile.website} target="_blank" className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 text-[11px] font-semibold hover:bg-gray-100 transition-colors"><LinkIcon className="w-3 h-3" /> Site</a>}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. About Card */}
      <section>
        <SectionTitle icon={<FileText className="w-4 h-4" />} title="À propos" />
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 relative group cursor-pointer hover:border-gray-200 transition-colors" onClick={openAboutEdit}>
          <button className="absolute top-4 right-4 p-2 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
            <Pencil className="w-4 h-4" />
          </button>
          {profile.bio ? (
            <p className="text-sm text-gray-600 leading-relaxed pr-8 whitespace-pre-wrap">{profile.bio}</p>
          ) : (
            <p className="text-sm text-gray-400 italic">Ajoutez une brève description de votre parcours, vos objectifs ou ce qui vous passionne.</p>
          )}
        </div>
      </section>

      {/* 3. Experiences */}
      <section>
        <SectionTitle icon={<Briefcase className="w-4 h-4" />} title="Expériences" />
        <ExperienceList />
      </section>

      {/* 4. Educations */}
      <section>
        <SectionTitle icon={<GraduationCap className="w-4 h-4" />} title="Formations" />
        <EducationList />
      </section>

      {/* 5. Skills */}
      <section>
        <SectionTitle icon={<Wrench className="w-4 h-4" />} title="Compétences" />
        <SkillsList />
      </section>
      
      {/* 6. Projects */}
      <section>
        <SectionTitle icon={<FolderOpen className="w-4 h-4" />} title="Projets" />
        <ProjectsList />
      </section>
      
      {/* 7. Certifications */}
      <section>
        <SectionTitle icon={<Award className="w-4 h-4" />} title="Certifications" />
        <CertificationsList />
      </section>
      
      {/* 8. Languages */}
      <section>
        <SectionTitle icon={<Globe className="w-4 h-4" />} title="Langues" />
        <LanguagesList />
      </section>

      {/* 9. Custom Sections */}
      <section>
        <SectionTitle icon={<List className="w-4 h-4" />} title="Sections Personnalisées" />
        <CustomSectionsList />
      </section>


      {/* --- Editors (BottomSheets) --- */}
      
      <BottomSheet isOpen={isEditingPersonal} onClose={() => setIsEditingPersonal(false)} title="Modifier mes informations">
        <div className="space-y-5 pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom</label><input type="text" value={personalForm.first_name || ''} onChange={e => setPersonalForm({...personalForm, first_name: e.target.value})} placeholder="Jean" className={inputClass} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label><input type="text" value={personalForm.last_name || ''} onChange={e => setPersonalForm({...personalForm, last_name: e.target.value})} placeholder="Dupont" className={inputClass} /></div>
          </div>
          
          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Métier ou titre</label><input type="text" value={personalForm.title || ''} onChange={e => setPersonalForm({...personalForm, title: e.target.value})} placeholder="Ex : Infirmière, Développeur…" className={inputClass} /></div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Email de contact</label><input type="email" value={personalForm.contact_email || ''} onChange={e => setPersonalForm({...personalForm, contact_email: e.target.value})} className={inputClass} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label><input type="tel" value={personalForm.contact_phone || ''} onChange={e => setPersonalForm({...personalForm, contact_phone: e.target.value})} className={inputClass} /></div>
            <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1.5">Ville / Pays</label><input type="text" value={personalForm.location || ''} onChange={e => setPersonalForm({...personalForm, location: e.target.value})} placeholder="Paris, France" className={inputClass} /></div>
          </div>
          
          <div className="border-t border-gray-100 pt-5 mt-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Liens professionnels</p>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">LinkedIn</label><input type="url" value={personalForm.linkedin_url || ''} onChange={e => setPersonalForm({...personalForm, linkedin_url: e.target.value})} placeholder="https://linkedin.com/in/..." className={inputClass} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Portfolio / Site web</label><input type="url" value={personalForm.website || ''} onChange={e => setPersonalForm({...personalForm, website: e.target.value})} placeholder="https://..." className={inputClass} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">GitHub</label><input type="url" value={personalForm.github_url || ''} onChange={e => setPersonalForm({...personalForm, github_url: e.target.value})} placeholder="https://github.com/..." className={inputClass} /></div>
            </div>
          </div>
          
          <div className="pt-4">
            <button onClick={handleSavePersonal} className="w-full bg-indigo-600 text-white font-semibold py-3.5 px-4 rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all">
              Enregistrer
            </button>
          </div>
        </div>
      </BottomSheet>

      <BottomSheet isOpen={isEditingAbout} onClose={() => setIsEditingAbout(false)} title="À propos de moi">
        <div className="space-y-5 pb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Présentez-vous en quelques mots</label>
            <textarea 
              rows={8} 
              autoFocus
              value={aboutForm} 
              onChange={e => setAboutForm(e.target.value)}
              placeholder="Votre parcours, ce que vous aimez faire, vos soft-skills, vos objectifs…"
              className={`${inputClass} resize-y text-base`} 
            />
            <p className="mt-2 text-xs text-gray-400 flex justify-between">
              <span>{aboutForm.length} caractères</span>
              <span>Recommandé : 150 - 300</span>
            </p>
          </div>
          
          <div className="pt-4">
            <button onClick={handleSaveAbout} className="w-full bg-indigo-600 text-white font-semibold py-3.5 px-4 rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all">
              Enregistrer
            </button>
          </div>
        </div>
      </BottomSheet>

    </div>
  );
}
