'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useProfileStore } from '@/store/profile';
import { MasterProfile } from '@/types/profile';
import {
  User, MapPin, Mail, Phone, Globe, Briefcase, GraduationCap,
  Wrench, FolderOpen, Award, Link as LinkIcon, Calendar,
  Github, Linkedin, ExternalLink, Star, Eye, Lock
} from 'lucide-react';
import Link from 'next/link';
import { getPhotoUrl } from '@/lib/photo-url';

// ─── Helper ──────────────────────────────────────────────────────────────────
function formatDate(d?: string) {
  if (!d) return '';
  const [y, m] = d.split('-');
  const months = ['jan.', 'fév.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sep.', 'oct.', 'nov.', 'déc.'];
  return `${months[parseInt(m) - 1]} ${y}`;
}

// ─── Components ──────────────────────────────────────────────────────────────
function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest">{title}</h2>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
      {children}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ApercuPage() {
  const { data: session } = useSession();
  const { profile, setProfile, setLoading } = useProfileStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetch = async () => {
      if (session?.user?.accessToken && !profile) {
        setLoading(true);
        try {
          const { profileApi } = await import('@/lib/profile-api');
          const data = await profileApi.getProfile(session.user.accessToken);
          if (data) setProfile(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
      }
    };
    fetch();
  }, [session, profile, setProfile, setLoading]);

  if (!mounted) return null;

  if (!profile) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );

  const displayName = profile.first_name || profile.last_name
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
    : profile.username || 'Votre Nom';

  const hasContact = profile.contact_email || profile.contact_phone || profile.location;
  const hasLinks = profile.linkedin_url || profile.github_url || profile.website;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24 space-y-1">

      {/* Banner: aperçu public indicator */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
          <Eye className="w-3.5 h-3.5" />
          Aperçu de votre profil public
        </div>
        <Link href="/profil"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1">
          Modifier le profil →
        </Link>
      </div>

      {/* ── Hero Card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Top gradient banner */}
        <div className="h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-400" />

        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="-mt-12 mb-4 flex items-end justify-between">
            <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
              {getPhotoUrl(profile.photo_url) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={getPhotoUrl(profile.photo_url)!} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-9 h-9 text-gray-300" />
              )}
            </div>
            {/* Visibility badge */}
            <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${profile.visibility === 'public'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-gray-100 text-gray-500 border border-gray-200'
              }`}>
              {profile.visibility === 'public' ? <><Eye className="w-3 h-3" /> Public</> : <><Lock className="w-3 h-3" /> Privé</>}
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 leading-tight">{displayName}</h1>
          {profile.title && <p className="text-indigo-600 font-semibold text-sm mt-1">{profile.title}</p>}

          {/* Contact chips */}
          {(hasContact || hasLinks) && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              {profile.location && (
                <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                  <MapPin className="w-3 h-3 text-gray-400" /> {profile.location}
                </span>
              )}
              {profile.contact_email && (
                <a href={`mailto:${profile.contact_email}`}
                  className="flex items-center gap-1.5 text-xs text-gray-600 font-medium bg-gray-50 hover:bg-indigo-50 hover:text-indigo-700 px-2.5 py-1 rounded-full border border-gray-100 transition-colors">
                  <Mail className="w-3 h-3" /> {profile.contact_email}
                </a>
              )}
              {profile.contact_phone && (
                <a href={`tel:${profile.contact_phone}`}
                  className="flex items-center gap-1.5 text-xs text-gray-600 font-medium bg-gray-50 hover:bg-indigo-50 hover:text-indigo-700 px-2.5 py-1 rounded-full border border-gray-100 transition-colors">
                  <Phone className="w-3 h-3" /> {profile.contact_phone}
                </a>
              )}
              {profile.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold bg-[#0077B5]/10 text-[#0077B5] px-2.5 py-1 rounded-full border border-[#0077B5]/20 hover:bg-[#0077B5]/20 transition-colors">
                  <Linkedin className="w-3 h-3" /> LinkedIn
                </a>
              )}
              {profile.github_url && (
                <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold bg-gray-900/10 text-gray-800 px-2.5 py-1 rounded-full border border-gray-900/10 hover:bg-gray-900/20 transition-colors">
                  <Github className="w-3 h-3" /> GitHub
                </a>
              )}
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-100 hover:bg-indigo-100 transition-colors">
                  <Globe className="w-3 h-3" /> Site web
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── About ── */}
      {profile.bio && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <SectionHeader icon={<Star className="w-3.5 h-3.5" />} title="À propos" />
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
        </div>
      )}

      {/* ── Experiences ── */}
      {profile.experiences?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <SectionHeader icon={<Briefcase className="w-3.5 h-3.5" />} title="Expériences" />
          <div className="space-y-5">
            {profile.experiences.map((exp, i) => (
              <div key={exp.id} className={`relative pl-4 ${i < profile.experiences.length - 1 ? 'pb-5 border-b border-gray-50' : ''}`}>
                <div className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-bold text-sm text-gray-900">{exp.title}</p>
                    <p className="text-sm text-indigo-600 font-semibold">{exp.company}</p>
                    {exp.location && <p className="text-xs text-gray-400 font-medium mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{exp.location}</p>}
                  </div>
                  <span className="text-xs text-gray-400 font-medium whitespace-nowrap flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(exp.start_date)} — {exp.current ? 'Présent' : formatDate(exp.end_date)}
                  </span>
                </div>
                {exp.description && <p className="text-xs text-gray-500 mt-2 leading-relaxed">{exp.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Education ── */}
      {profile.educations?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <SectionHeader icon={<GraduationCap className="w-3.5 h-3.5" />} title="Formation" />
          <div className="space-y-4">
            {profile.educations.map((edu, i) => (
              <div key={edu.id} className={`relative pl-4 ${i < profile.educations.length - 1 ? 'pb-4 border-b border-gray-50' : ''}`}>
                <div className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-purple-400" />
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-bold text-sm text-gray-900">{edu.degree}</p>
                    <p className="text-sm text-purple-600 font-semibold">{edu.school}</p>
                    {edu.location && <p className="text-xs text-gray-400 mt-0.5">{edu.location}</p>}
                  </div>
                  {(edu.start_date || edu.end_date) && (
                    <span className="text-xs text-gray-400 font-medium whitespace-nowrap flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(edu.start_date)}{edu.end_date ? ` — ${formatDate(edu.end_date)}` : ''}
                    </span>
                  )}
                </div>
                {edu.description && <p className="text-xs text-gray-500 mt-2 leading-relaxed">{edu.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Skills ── */}
      {profile.skills?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <SectionHeader icon={<Wrench className="w-3.5 h-3.5" />} title="Compétences" />
          <div className="flex flex-wrap gap-2">
            {profile.skills.map(skill => (
              <Badge key={skill.id}>{skill.name}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* ── Projects ── */}
      {profile.projects?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <SectionHeader icon={<FolderOpen className="w-3.5 h-3.5" />} title="Projets" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile.projects.map(proj => (
              <div key={proj.id} className="group p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-sm transition-all bg-gray-50/50">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold text-sm text-gray-900">{proj.name}</p>
                  {proj.url && (
                    <a href={proj.url} target="_blank" rel="noopener noreferrer"
                      className="text-gray-400 hover:text-indigo-600 transition-colors flex-shrink-0">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
                {proj.description && <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{proj.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Certifications ── */}
      {profile.certifications?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <SectionHeader icon={<Award className="w-3.5 h-3.5" />} title="Certifications" />
          <div className="space-y-3">
            {profile.certifications.map(cert => (
              <div key={cert.id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{cert.name}</p>
                  {cert.issuer && <p className="text-xs text-gray-400 font-medium">{cert.issuer}</p>}
                </div>
                {cert.date && <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(cert.date)}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Languages ── */}
      {profile.languages?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <SectionHeader icon={<Globe className="w-3.5 h-3.5" />} title="Langues" />
          <div className="flex flex-wrap gap-2">
            {profile.languages.map(lang => (
              <div key={lang.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-xs font-medium text-gray-700">
                <span>{lang.name}</span>
                {lang.level && <span className="text-gray-400">· {lang.level}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!profile.bio && !profile.experiences?.length && !profile.skills?.length && !profile.educations?.length && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
          <User className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-400">Votre profil est vide</p>
          <p className="text-xs text-gray-300 mt-1">Ajoutez des informations dans la page Profil</p>
          <Link href="/profil" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline">
            Compléter mon profil →
          </Link>
        </div>
      )}

    </div>
  );
}
