import React from 'react';
import { PublicPageData } from '@/types/public-page';
import { getPhotoUrl } from '@/lib/photo-url';
import { User, MapPin, Github, Linkedin, ExternalLink } from 'lucide-react';

function fmtDate(d?: string) {
  if (!d) return '';
  const [y, m] = d.split('-');
  const months = ['jan.','fév.','mars','avr.','mai','juin','juil.','août','sep.','oct.','nov.','déc.'];
  return m ? `${months[parseInt(m)-1]} ${y}` : y;
}

export default function BoldTheme({ data, accent }: { data: PublicPageData; accent: string }) {
  const { page, profile } = data;
  const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.username || '';
  const photo = page.show_photo ? getPhotoUrl(profile.photo_url) : null;

  return (
    <div className="min-h-screen bg-gray-950 text-white" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-6">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt={name} className="w-24 h-24 object-cover rounded-2xl flex-shrink-0 border-2" style={{ borderColor: accent }} />
          ) : (
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${accent}20` }}>
              <User className="w-12 h-12" style={{ color: accent }} />
            </div>
          )}
          <div>
            <h1 className="text-4xl font-black tracking-tight">{name}</h1>
            {profile.title && <p className="text-lg font-semibold mt-1" style={{ color: accent }}>{profile.title}</p>}
            {page.show_contact && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-gray-400 text-sm">
                {profile.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.location}</span>}
                {profile.contact_email && <span>{profile.contact_email}</span>}
              </div>
            )}
            <div className="flex gap-2 mt-3">
              {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold px-3 py-1.5 rounded-full border transition-colors hover:opacity-80" style={{ borderColor: accent, color: accent }}><Linkedin className="w-3 h-3 inline mr-1" />LinkedIn</a>}
              {profile.github_url && <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold px-3 py-1.5 rounded-full border border-gray-600 text-gray-300 hover:border-gray-400 transition-colors"><Github className="w-3 h-3 inline mr-1" />GitHub</a>}
            </div>
          </div>
        </div>

        {profile.bio && <p className="text-gray-300 leading-relaxed text-lg border-l-4 pl-4" style={{ borderColor: accent }}>{profile.bio}</p>}

        {profile.skills?.length > 0 && (
          <section>
            <h2 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: accent }}>// Compétences</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map(s => (
                <span key={s.id} className="text-sm font-bold px-3 py-1.5 rounded-lg bg-gray-800 text-white border border-gray-700">{s.name}</span>
              ))}
            </div>
          </section>
        )}

        {profile.experiences?.length > 0 && (
          <section>
            <h2 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: accent }}>// Expériences</h2>
            <div className="space-y-4">
              {profile.experiences.map((e: any) => (
                <div key={e.id} className="p-5 rounded-xl bg-gray-900 border border-gray-800">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <p className="font-black text-lg">{e.title}</p>
                      <p className="font-semibold" style={{ color: accent }}>{e.company}</p>
                    </div>
                    <span className="text-xs text-gray-500 font-mono">{fmtDate(e.start_date)} — {e.current ? 'now' : fmtDate(e.end_date)}</span>
                  </div>
                  {e.description && <p className="text-gray-400 text-sm mt-3 leading-relaxed">{e.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {profile.projects?.length > 0 && (
          <section>
            <h2 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: accent }}>// Projets</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profile.projects.map((p: any) => (
                <div key={p.id} className="p-4 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-600 transition-colors">
                  <div className="flex justify-between items-start">
                    <p className="font-black">{p.name}</p>
                    {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ color: accent }}><ExternalLink className="w-4 h-4" /></a>}
                  </div>
                  {p.description && <p className="text-gray-400 text-sm mt-1.5">{p.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {(profile.educations?.length > 0 || profile.certifications?.length > 0 || profile.languages?.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {profile.educations?.length > 0 && (
              <section className="sm:col-span-2">
                <h2 className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: accent }}>// Formation</h2>
                {profile.educations.map((e: any) => (
                  <div key={e.id} className="mb-2">
                    <p className="font-bold">{e.degree}</p>
                    <p className="text-sm text-gray-400">{e.school} · {fmtDate(e.start_date)}{e.end_date ? `–${fmtDate(e.end_date)}` : ''}</p>
                  </div>
                ))}
              </section>
            )}
            {profile.languages && profile.languages.length > 0 && (
              <section>
                <h2 className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: accent }}>// Langues</h2>
                {profile.languages.map((l: any) => (
                  <p key={l.id} className="text-sm text-gray-300">{l.name}{l.level ? ` — ${l.level}` : ''}</p>
                ))}
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
