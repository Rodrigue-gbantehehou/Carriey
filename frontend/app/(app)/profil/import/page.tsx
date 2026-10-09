"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, Loader2, ArrowLeft } from 'lucide-react';
import config from '@/lib/config';
import { useSession } from 'next-auth/react';
import { useProfileStore } from '@/store/profile';
import Link from 'next/link';

export default function ImportCvPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { profile, setProfile, updateProfile, addExperience, addEducation, addSkill, addProject, addCertification } = useProfileStore();

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.user?.accessToken && !profile) {
        try {
          const { profileApi } = await import('@/lib/profile-api');
          const p = await profileApi.getProfile(session.user.accessToken);
          if (p) setProfile(p);
        } catch(e) {}
      }
    };
    fetchProfile();
  }, [session, profile, setProfile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
      setError('');
    } else {
      setError('Veuillez sélectionner un fichier PDF.');
    }
  };

  const handleUploadAndSave = async () => {
    if (!file || !session?.user?.accessToken || !profile) return;
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${config.apiBaseUrl}/import-cv/extract`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`
        },
        body: formData,
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.detail || "Erreur lors de l'extraction.");
      }

      const data = await res.json();
      
      // Enregistrement direct en BDD
      const mergedProfile = { ...profile };
      if (data.title) mergedProfile.title = data.title;
      if (data.bio) mergedProfile.bio = data.bio;
      if (data.first_name) mergedProfile.first_name = data.first_name;
      if (data.last_name) mergedProfile.last_name = data.last_name;
      if (data.contact_email) mergedProfile.contact_email = data.contact_email;
      if (data.contact_phone) mergedProfile.contact_phone = data.contact_phone;
      if (data.location) mergedProfile.location = data.location;

      await updateProfile(mergedProfile);

      const parseDateForApi = (d?: string) => {
        if (!d) return undefined;
        const clean = d.trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;
        if (/^\d{4}-\d{2}$/.test(clean)) return `${clean}-01`;
        if (/^\d{2}\/\d{4}$/.test(clean)) {
          const [m, y] = clean.split('/');
          return `${y}-${m}-01`;
        }
        if (/^\d{4}$/.test(clean)) return `${clean}-01-01`;
        return undefined;
      };

      if (data.experiences?.length > 0) {
        for (const exp of data.experiences) {
          await addExperience({
            ...exp,
            company: exp.company || 'Entreprise inconnue',
            start_date: parseDateForApi(exp.start_date),
            end_date: parseDateForApi(exp.end_date),
          });
        }
      }
      if (data.educations?.length > 0) {
        for (const edu of data.educations) {
          await addEducation({
            ...edu,
            degree: edu.degree || 'Diplôme inconnu',
            school: edu.school || 'École inconnue',
            start_date: parseDateForApi(edu.start_date),
            end_date: parseDateForApi(edu.end_date),
          });
        }
      }
      if (data.skills?.length > 0) {
        const formattedSkills = data.skills.map((s: any) => typeof s === 'string' ? { name: s } : s);
        const existingSkillNames = (profile.skills || []).map((s: any) => s.name);
        const newSkills = formattedSkills.filter((s: any) => !existingSkillNames.includes(s.name));
        for (const skill of newSkills) {
          if (skill.name) await addSkill(skill);
        }
      }
      if (data.projects?.length > 0) {
        for (const proj of data.projects) {
          await addProject({
            ...proj,
            name: proj.title || proj.name || 'Projet sans nom',
            start_date: parseDateForApi(proj.start_date),
            end_date: parseDateForApi(proj.end_date),
          });
        }
      }
      if (data.certifications?.length > 0) {
        for (const cert of data.certifications) {
          await addCertification({
            ...cert,
            name: cert.name || 'Certification sans nom',
            issuer: cert.issuer || 'Organisme inconnu',
          });
        }
      }
      
      router.push('/profil');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8 animate-fade-in pb-24">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/profil" className="p-2 bg-white border border-gray-200 rounded-full text-gray-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-colors shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Importer depuis un CV</h1>
          <p className="text-gray-500 text-sm mt-1">L'IA extraira vos informations et mettra automatiquement à jour votre profil.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 max-w-2xl mx-auto mt-10">
        <div 
          className={`border-2 border-dashed rounded-3xl p-12 text-center transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[300px] ${file ? 'border-indigo-400 bg-indigo-50/50' : 'border-gray-300 hover:border-indigo-300 bg-gray-50'}`}
          onClick={() => !file && fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            accept=".pdf,application/pdf" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange} 
          />
          
          {file ? (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
                <FileText className="w-8 h-8" />
              </div>
              <p className="text-lg font-bold text-gray-900">{file.name}</p>
              <button 
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="text-sm font-semibold text-red-500 mt-4 hover:underline px-4 py-2 hover:bg-red-50 rounded-full transition-colors"
              >
                Choisir un autre fichier
              </button>
            </div>
          ) : (
            <div>
              <div className="w-20 h-20 bg-white border border-gray-200 text-gray-400 rounded-full flex items-center justify-center mb-6 shadow-sm mx-auto group-hover:scale-105 transition-transform">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sélectionnez votre CV</h3>
              <p className="text-sm text-gray-500">Formats acceptés : PDF (Max 5 Mo)</p>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-600 font-medium text-center mt-4 bg-red-50 py-2 rounded-lg">{error}</p>}

        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleUploadAndSave}
            disabled={!file || loading || !profile}
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-md shadow-indigo-600/20"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            {loading ? 'Extraction et enregistrement...' : 'Importer mon CV'}
          </button>
        </div>
      </div>
    </div>
  );
}
