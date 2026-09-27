import React from 'react';
import { PublicPageData } from '@/types/public-page';
import { getPhotoUrl } from '@/lib/photo-url';
import { User, MapPin, Mail, Phone, Globe, Briefcase, GraduationCap, Wrench, FolderOpen, Award, Github, Linkedin, ExternalLink } from 'lucide-react';

function fmtDate(d?: string) {
  if (!d) return '';
  const [y, m] = d.split('-');
  const months = ['jan.','fév.','mars','avr.','mai','juin','juil.','août','sep.','oct.','nov.','déc.'];
  return m ? `${months[parseInt(m)-1]} ${y}` : y;
}

export default function ModernTheme({ data, accent }: { data: PublicPageData; accent: string }) {
  const { page, profile } = data;
  const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.username || '';
  const photo = page.show_photo ? getPhotoUrl(profile.photo_url) : null;

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${accent}ee, ${accent}99)` }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="max-w-3xl mx-auto px-6 py-12 relative">
          <div className="flex items-center gap-6">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt={name} className="w-24 h-24 object-cover rounded-2xl border-4 border-white/30 shadow-xl flex-shrink-0" />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <User className="w-12 h-12 text-white/60" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-black text-white">{name}</h1>
              {profile.title && <p className="text-white/80 font-semibold mt-1">{profile.title}</p>}
              {page.show_contact && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-white/70 text-sm">
                  {profile.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.location}</span>}
                  {profile.contact_email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{profile.contact_email}</span>}
                  {profile.contact_phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{profile.contact_phone}</span>}
                </div>
              )}
              <div className="flex gap-2 mt-3">
                {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-semibold bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full transition-colors"><Linkedin className="w-3 h-3" />LinkedIn</a>}
                {profile.github_url && <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-semibold bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full transition-colors"><Github className="w-3 h-3" />GitHub</a>}
                {profile.website && <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-semibold bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full transition-colors"><Globe className="w-3 h-3" />Site web</a>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {profile.bio && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {profile.experiences?.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2"><Briefcase className="w-4 h-4" />Expériences</h2>
            <div className="space-y-5">
              {profile.experiences.map((e: any, i: number) => (
                <div key={e.id} className={`relative pl-4 ${i < profile.experiences.length-1 ? 'pb-5 border-b border-gray-50' : ''}`}>
                  <div className="absolute left-0 top-2 w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
                  <p className="font-bold text-gray-900">{e.title}</p>
                  <p className="text-sm font-semibold" style={{ color: accent }}>{e.company}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{fmtDate(e.start_date)} — {e.current ? 'Présent' : fmtDate(e.end_date)}</p>
                  {e.description && <p className="text-sm text-gray-600 mt-2 leading-relaxed">{e.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {profile.skills?.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Wrench className="w-4 h-4" />Compétences</h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((s: any) => (
                  <span key={s.id} className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ backgroundColor: `${accent}15`, color: accent }}>{s.name}</span>
                ))}
              </div>
            </div>
          )}
          {profile.languages && profile.languages.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Globe className="w-4 h-4" />Langues</h2>
              <div className="space-y-2">
                {profile.languages.map((l: any) => (
                  <div key={l.id} className="flex justify-between text-sm">
                    <span className="font-medium text-gray-800">{l.name}</span>
                    {l.level && <span className="text-gray-400">{l.level}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {profile.educations?.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2"><GraduationCap className="w-4 h-4" />Formation</h2>
            <div className="space-y-4">
              {profile.educations.map((e: any) => (
                <div key={e.id} className="relative pl-4">
                  <div className="absolute left-0 top-2 w-2 h-2 rounded-full bg-purple-400" />
                  <p className="font-bold text-gray-900">{e.degree}</p>
                  <p className="text-sm text-purple-600 font-semibold">{e.school}</p>
                  <p className="text-xs text-gray-400">{fmtDate(e.start_date)}{e.end_date ? ` — ${fmtDate(e.end_date)}` : ''}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {profile.projects?.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2"><FolderOpen className="w-4 h-4" />Projets</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profile.projects.map((p: any) => (
                <div key={p.id} className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-sm text-gray-900">{p.name}</p>
                    {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ color: accent }}><ExternalLink className="w-3.5 h-3.5" /></a>}
                  </div>
                  {p.description && <p className="text-xs text-gray-500 mt-1.5">{p.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {profile.certifications && profile.certifications.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Award className="w-4 h-4" />Certifications</h2>
            <div className="space-y-3">
              {profile.certifications.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.issuer}</p>
                  </div>
                  {c.date && <span className="text-xs text-gray-400">{fmtDate(c.date)}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
