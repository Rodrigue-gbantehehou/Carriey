"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Briefcase, GraduationCap, Wrench, Globe, Award,
  MapPin, Mail, ExternalLink, ArrowLeft,
} from 'lucide-react';

// ── Types light ───────────────────────────────────────────────────────────────
interface PublicProfile {
  username: string;
  full_name?: string;
  title?: string;
  bio?: string;
  contact_email?: string;
  location?: string;
  skills?: { id: string; name: string; level?: string }[];
  experiences?: { id: string; title: string; company: string; start_date?: string; end_date?: string; current?: boolean; description?: string }[];
  educations?: { id: string; degree: string; school: string; start_date?: string; end_date?: string }[];
  projects?: { id: string; name: string; description?: string; url?: string }[];
  certifications?: { id: string; name: string; issuer: string; date?: string; url?: string }[];
  languages?: { id: string; name: string; level: string }[];
}

function formatDate(d?: string) {
  if (!d) return '';
  return d.substring(0, 7).replace('-', '/');
}

// ── Public profile page ───────────────────────────────────────────────────────
export default function PublicProfilePage() {
  const params = useParams();
  const username = params?.username as string;
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('cariey_draft_profile');
    const draft = raw ? JSON.parse(raw) : null;

    setTimeout(() => {
      // 'apercu' is a special preview slug — always shows local draft
      const isPreview = username === 'apercu';
      const matchesUsername = draft?.username && draft.username === username;

      if (draft && (isPreview || matchesUsername)) {
        setProfile({ ...draft, username: draft.username || username });
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }, 300);
  }, [username]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-center px-4">
        <p className="text-4xl mb-4">👤</p>
        <h1 className="text-xl font-bold text-gray-900">Profil introuvable</h1>
        <p className="text-sm text-gray-500 mt-2">L'adresse <strong>cariey.com/{username}</strong> n'existe pas encore.</p>
        <Link href="/start" className="mt-6 inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors">
          Créer mon profil
        </Link>
      </div>
    );
  }

  const name = profile?.full_name || profile?.username || '';
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Minimal header */}
      <header className="bg-white border-b border-gray-100 px-5 h-12 flex items-center justify-between">
        <Link href="/" className="text-base font-black tracking-tight text-indigo-600">CARIEY</Link>
        <Link href="/profil" className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Modifier mon profil
        </Link>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* ── Hero card ── */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-5">
          {/* Banner */}
          <div className="h-24 bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600" />

          {/* Avatar + identity */}
          <div className="px-6 pb-6">
            <div className="-mt-8 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-white border-2 border-white shadow-md flex items-center justify-center text-2xl font-bold text-indigo-600">
                {initial}
              </div>
            </div>

            <h1 className="text-xl font-bold text-gray-900">{name}</h1>
            {profile?.title && <p className="text-sm text-gray-500 mt-0.5">{profile.title}</p>}

            <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-400">
              {profile?.location && (
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{profile.location}</span>
              )}
              {profile?.contact_email && (
                <a href={`mailto:${profile.contact_email}`} className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
                  <Mail className="w-3.5 h-3.5" />{profile.contact_email}
                </a>
              )}
            </div>

            {profile?.bio && (
              <p className="mt-4 text-sm text-gray-600 leading-relaxed">{profile.bio}</p>
            )}

            {/* Skills */}
            {profile?.skills && profile.skills.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {profile.skills.map(s => (
                  <span key={s.id} className="text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-full">
                    {s.name}
                    {s.level && <span className="ml-1 text-indigo-400">· {s.level}</span>}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Experiences ── */}
        {profile?.experiences && profile.experiences.length > 0 && (
          <Section title="Expériences" icon={<Briefcase className="w-4 h-4" />}>
            {profile.experiences.map(exp => (
              <Item
                key={exp.id}
                icon={<Briefcase className="w-4 h-4 text-gray-400" />}
                title={exp.title}
                sub={exp.company}
                meta={[formatDate(exp.start_date), exp.current ? "Aujourd'hui" : formatDate(exp.end_date)].filter(Boolean).join(' — ')}
                body={exp.description}
              />
            ))}
          </Section>
        )}

        {/* ── Education ── */}
        {profile?.educations && profile.educations.length > 0 && (
          <Section title="Formations" icon={<GraduationCap className="w-4 h-4" />}>
            {profile.educations.map(edu => (
              <Item
                key={edu.id}
                icon={<GraduationCap className="w-4 h-4 text-gray-400" />}
                title={edu.degree}
                sub={edu.school}
                meta={[formatDate(edu.start_date), formatDate(edu.end_date)].filter(Boolean).join(' — ')}
              />
            ))}
          </Section>
        )}

        {/* ── Projects ── */}
        {profile?.projects && profile.projects.length > 0 && (
          <Section title="Projets" icon={<ExternalLink className="w-4 h-4" />}>
            {profile.projects.map(p => (
              <Item
                key={p.id}
                icon={<ExternalLink className="w-4 h-4 text-gray-400" />}
                title={p.name}
                body={p.description}
                link={p.url}
              />
            ))}
          </Section>
        )}

        {/* ── Languages ── */}
        {profile?.languages && profile.languages.length > 0 && (
          <Section title="Langues" icon={<Globe className="w-4 h-4" />}>
            <div className="flex flex-wrap gap-2">
              {profile.languages.map((l: any) => (
                <span key={l.id} className="inline-flex items-center gap-1.5 text-sm bg-white border border-gray-200 rounded-full px-4 py-1.5">
                  <Globe className="w-3.5 h-3.5 text-gray-300" />
                  <span className="font-medium text-gray-800">{l.name}</span>
                  <span className="text-gray-400 text-xs">· {l.level}</span>
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* ── Certifications ── */}
        {profile?.certifications && profile.certifications.length > 0 && (
          <Section title="Certifications" icon={<Award className="w-4 h-4" />}>
            {profile.certifications.map(cert => (
              <Item
                key={cert.id}
                icon={<Award className="w-4 h-4 text-gray-400" />}
                title={cert.name}
                sub={cert.issuer}
                meta={cert.date}
                link={cert.url}
              />
            ))}
          </Section>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-300 mt-10">
          Profil créé avec <span className="font-bold text-indigo-400">CARIEY</span>
        </p>

      </div>
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-4">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
        <span className="text-indigo-600">{icon}</span>
        <h2 className="text-sm font-bold text-gray-900">{title}</h2>
      </div>
      <div className="px-6 py-5 space-y-4">{children}</div>
    </div>
  );
}

function Item({ icon, title, sub, meta, body, link }: {
  icon: React.ReactNode;
  title: string;
  sub?: string;
  meta?: string;
  body?: string;
  link?: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          {link && (
            <a href={link} target="_blank" rel="noreferrer" className="text-indigo-500 hover:text-indigo-700 transition-colors flex-shrink-0">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
        {sub && <p className="text-sm text-indigo-600 font-medium mt-0.5">{sub}</p>}
        {meta && <p className="text-xs text-gray-400 mt-0.5">{meta}</p>}
        {body && <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{body}</p>}
      </div>
    </div>
  );
}
