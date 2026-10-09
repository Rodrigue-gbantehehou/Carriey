"use client";
import config from '@/lib/config';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useProfileStore } from '@/store/profile';
import ExperienceList from '@/components/app/profile/ExperienceList';
import EducationList from '@/components/app/profile/EducationList';
import SkillsList from '@/components/app/profile/SkillsList';
import ProjectsList from '@/components/app/profile/ProjectsList';
import { LanguagesList, CertificationsList } from '@/components/app/profile/ExtrasLists';
import { CustomSectionsList } from '@/components/app/profile/CustomSectionsList';
import Link from 'next/link';
import PersonalInfoForm from '@/components/app/profile/PersonalInfoForm';
import AboutMeForm from '@/components/app/profile/AboutMeForm';
import { getPhotoUrl } from '@/lib/photo-url';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';

import {
  User, FileText, Briefcase, GraduationCap, Wrench,
  FolderOpen, Award, Globe, Eye, Pencil, Camera, MapPin, Mail, Phone, Link as LinkIcon, List
} from 'lucide-react';

export default function ProfilPage() {
  const { data: session } = useSession();
  const { profile, setProfile, updateProfile, setLoading } = useProfileStore();
  const [mounted, setMounted] = useState(false);
  
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  
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
        } catch (err: any) {
          console.error("Error fetching profile", err);
          if (err.message === 'Unauthorized') {
            signOut({ callbackUrl: '/login' });
          }
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
      <div className="w-8 h-8 border-4 border-background-subtle border-t-primary rounded-full animate-spin"></div>
    </div>
  );

  const openPersonalEdit = () => {
    setIsEditingPersonal(true);
  };

  const openAboutEdit = () => {
    setIsEditingAbout(true);
  };

  const SectionTitle = ({ icon, title }: { icon: React.ReactNode, title: string }) => (
    <div className="flex items-center gap-2 mb-4 px-1">
      <div className="w-8 h-8 rounded-panel bg-background-subtle border border-border text-primary flex items-center justify-center">
        {icon}
      </div>
      <h2 className="text-ui-lg font-bold text-text-primary">{title}</h2>
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
      const res = await fetch(`${config.apiBaseUrl}/profile/me/photo`, {
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
    <div className="space-y-10 pb-12 animate-fade-in">
      
      <PageHeader
        title="Mon Profil"
        actions={
          <>
            <Link href="/profil/import" passHref>
              <Button variant="secondary" leftIcon={<FileText className="w-4 h-4" />}>
                Importer un CV
              </Button>
            </Link>
            <Link href={profile.username ? `/${profile.username}` : '/apercu'} target="_blank" passHref>
              <Button variant="primary" leftIcon={<Eye className="w-4 h-4" />}>
                Aperçu
              </Button>
            </Link>
          </>
        }
      />

      {/* 1. Personal Info Card */}
      <section>
        <div className="bg-background rounded-panel border border-border shadow-sm p-6 relative group overflow-hidden">
          <button 
            onClick={openPersonalEdit}
            className="absolute top-4 right-4 p-2 text-text-muted hover:text-primary hover:bg-background-subtle rounded-panel transition-colors z-10"
          >
            <Pencil className="w-4 h-4" />
          </button>
          
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-5 relative z-0">
            {/* Square photo frame with upload */}
            <label className="relative group/avatar cursor-pointer flex-shrink-0" title="Changer la photo">
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handlePhotoUpload} />
              <div className="w-24 h-24 rounded-panel bg-background-subtle border border-border flex items-center justify-center overflow-hidden transition-colors group-hover/avatar:border-primary">
                {photoSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoSrc} alt="Profil" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-text-muted" />
                )}
              </div>
              <div className="absolute inset-0 bg-black/50 rounded-panel flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
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
                <div className="absolute inset-0 bg-black/40 rounded-panel flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </label>
            
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-ui-xl font-bold text-text-primary">{displayName}</h2>
              <p className="text-primary font-medium text-ui-sm mt-0.5">{profile.title || 'Complétez votre titre'}</p>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 mt-3 text-ui-xs text-text-secondary font-medium">
                {profile.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{profile.location}</span>}
                {profile.contact_email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{profile.contact_email}</span>}
                {profile.contact_phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{profile.contact_phone}</span>}
              </div>
              
              {(profile.linkedin_url || profile.website || profile.github_url) && (
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-4">
                  {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" className="flex items-center gap-1 px-2.5 py-1 rounded-panel bg-background-subtle border border-border text-text-secondary text-ui-xs font-semibold hover:bg-border transition-colors"><LinkIcon className="w-3 h-3" /> LinkedIn</a>}
                  {profile.github_url && <a href={profile.github_url} target="_blank" className="flex items-center gap-1 px-2.5 py-1 rounded-panel bg-background-subtle border border-border text-text-secondary text-ui-xs font-semibold hover:bg-border transition-colors"><LinkIcon className="w-3 h-3" /> GitHub</a>}
                  {profile.website && <a href={profile.website} target="_blank" className="flex items-center gap-1 px-2.5 py-1 rounded-panel bg-background-subtle border border-border text-text-secondary text-ui-xs font-semibold hover:bg-border transition-colors"><LinkIcon className="w-3 h-3" /> Site</a>}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. About Card */}
      <section>
        <SectionTitle icon={<FileText className="w-4 h-4" />} title="À propos" />
        <div className="bg-background rounded-panel border border-border shadow-sm p-6 relative group cursor-pointer hover:bg-background-subtle transition-colors" onClick={openAboutEdit}>
          <button className="absolute top-5 right-5 p-2 text-text-muted opacity-0 group-hover:opacity-100 hover:text-primary hover:bg-background rounded-panel border border-transparent hover:border-border transition-all">
            <Pencil className="w-4 h-4" />
          </button>
          {profile.bio ? (
            <p className="text-ui-sm text-text-secondary leading-relaxed pr-8 whitespace-pre-wrap">{profile.bio}</p>
          ) : (
            <p className="text-ui-sm text-text-muted italic">Ajoutez une brève description de votre parcours, vos objectifs ou ce qui vous passionne.</p>
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
      
      <PersonalInfoForm isOpen={isEditingPersonal} onClose={() => setIsEditingPersonal(false)} />
      
      <AboutMeForm isOpen={isEditingAbout} onClose={() => setIsEditingAbout(false)} />

    </div>
  );
}
