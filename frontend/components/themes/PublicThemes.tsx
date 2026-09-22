import { PublicPageData } from '@/types/public-page';
import { getPhotoUrl } from '@/lib/photo-url';
import {
  User, MapPin, Mail, Phone, Globe, Briefcase, GraduationCap,
  Wrench, FolderOpen, Award, Calendar, Github, Linkedin, ExternalLink, Star,
} from 'lucide-react';

// ─── Shared helpers ───────────────────────────────────────────────────────────
function fmtDate(d?: string) {
  if (!d) return '';
  const [y, m] = d.split('-');
  const months = ['jan.','fév.','mars','avr.','mai','juin','juil.','août','sep.','oct.','nov.','déc.'];
  return m ? `${months[parseInt(m)-1]} ${y}` : y;
}

// ─── MINIMAL THEME ────────────────────────────────────────────────────────────
export function MinimalTheme({ data, accent }: { data: PublicPageData; accent: string }) {
  const { page, profile } = data;
  const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.username || '';
  const photo = page.show_photo ? getPhotoUrl(profile.photo_url) : null;

  return (
    <div className="min-h-screen bg-white text-gray-900 font-[Georgia,serif]">
      <div className="max-w-2xl mx-auto px-6 py-14 space-y-10">
        {/* Header */}
        <div className="border-b border-gray-200 pb-8 flex items-start gap-6">
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt={name} className="w-20 h-20 object-cover rounded-sm flex-shrink-0" />
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
            {profile.title && <p className="text-base mt-1" style={{ color: accent }}>{profile.title}</p>}
            {page.show_contact && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-gray-500">
                {profile.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.location}</span>}
                {profile.contact_email && <a href={`mailto:${profile.contact_email}`} className="flex items-center gap-1 hover:underline"><Mail className="w-3 h-3" />{profile.contact_email}</a>}
                {profile.contact_phone && <a href={`tel:${profile.contact_phone}`} className="hover:underline">{profile.contact_phone}</a>}
              </div>
            )}
            <div className="flex gap-3 mt-2">
              {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: accent }} className="text-sm hover:underline flex items-center gap-1"><Linkedin className="w-3.5 h-3.5" />LinkedIn</a>}
              {profile.github_url && <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:underline flex items-center gap-1"><Github className="w-3.5 h-3.5" />GitHub</a>}
              {profile.website && <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:underline flex items-center gap-1"><Globe className="w-3.5 h-3.5" />Site web</a>}
            </div>
          </div>
        </div>

        {profile.bio && <p className="text-base text-gray-700 leading-relaxed">{profile.bio}</p>}

        {profile.experiences?.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Expériences</h2>
            <div className="space-y-5">
              {profile.experiences.map(e => (
                <div key={e.id} className="border-l-2 pl-4" style={{ borderColor: accent }}>
                  <p className="font-bold">{e.title}</p>
                  <p className="text-sm" style={{ color: accent }}>{e.company}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{fmtDate(e.start_date)} — {e.current ? 'Présent' : fmtDate(e.end_date)}{e.location ? ` · ${e.location}` : ''}</p>
                  {e.description && <p className="text-sm text-gray-600 mt-2 leading-relaxed">{e.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {profile.educations?.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Formation</h2>
            <div className="space-y-4">
              {profile.educations.map(e => (
                <div key={e.id} className="border-l-2 pl-4 border-gray-200">
                  <p className="font-bold">{e.degree}</p>
                  <p className="text-sm text-gray-600">{e.school}</p>
                  <p className="text-xs text-gray-400">{fmtDate(e.start_date)}{e.end_date ? ` — ${fmtDate(e.end_date)}` : ''}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {profile.skills?.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Compétences</h2>
            <p className="text-sm text-gray-700 leading-relaxed">{profile.skills.map(s => s.name).join(' · ')}</p>
          </section>
        )}

        {profile.projects?.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Projets</h2>
            <div className="space-y-3">
              {profile.projects.map(p => (
                <div key={p.id}>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm">{p.name}</p>
                    {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ color: accent }}><ExternalLink className="w-3.5 h-3.5" /></a>}
                  </div>
                  {p.description && <p className="text-sm text-gray-600 mt-0.5">{p.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {profile.languages?.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Langues</h2>
            <p className="text-sm text-gray-700">{profile.languages.map(l => l.level ? `${l.name} (${l.level})` : l.name).join(' · ')}</p>
          </section>
        )}
      </div>
    </div>
  );
}

// ─── MODERN THEME ─────────────────────────────────────────────────────────────
export function ModernTheme({ data, accent }: { data: PublicPageData; accent: string }) {
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
              {profile.experiences.map((e, i) => (
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
                {profile.skills.map(s => (
                  <span key={s.id} className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ backgroundColor: `${accent}15`, color: accent }}>{s.name}</span>
                ))}
              </div>
            </div>
          )}
          {profile.languages?.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Globe className="w-4 h-4" />Langues</h2>
              <div className="space-y-2">
                {profile.languages.map(l => (
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
              {profile.educations.map(e => (
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
              {profile.projects.map(p => (
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

        {profile.certifications?.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Award className="w-4 h-4" />Certifications</h2>
            <div className="space-y-3">
              {profile.certifications.map(c => (
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

// ─── BOLD THEME ───────────────────────────────────────────────────────────────
export function BoldTheme({ data, accent }: { data: PublicPageData; accent: string }) {
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
              {profile.experiences.map(e => (
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
              {profile.projects.map(p => (
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
                {profile.educations.map(e => (
                  <div key={e.id} className="mb-2">
                    <p className="font-bold">{e.degree}</p>
                    <p className="text-sm text-gray-400">{e.school} · {fmtDate(e.start_date)}{e.end_date ? `–${fmtDate(e.end_date)}` : ''}</p>
                  </div>
                ))}
              </section>
            )}
            {profile.languages?.length > 0 && (
              <section>
                <h2 className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: accent }}>// Langues</h2>
                {profile.languages.map(l => (
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

// ─── ELEGANT THEME ────────────────────────────────────────────────────────────
export function ElegantTheme({ data, accent }: { data: PublicPageData; accent: string }) {
  const { page, profile } = data;
  const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.username || '';
  const photo = page.show_photo ? getPhotoUrl(profile.photo_url) : null;

  return (
    <div className="min-h-screen bg-amber-50" style={{ fontFamily: "'Palatino Linotype', Georgia, serif" }}>
      <div className="max-w-2xl mx-auto px-8 py-16 space-y-10">
        {/* Header */}
        <div className="text-center border-b-2 border-gray-200 pb-10">
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt={name} className="w-28 h-28 object-cover rounded-full mx-auto mb-6 border-4 border-amber-100 shadow-lg" />
          )}
          <h1 className="text-4xl font-bold text-gray-800 tracking-wide">{name}</h1>
          {profile.title && <p className="text-lg mt-2 italic" style={{ color: accent }}>{profile.title}</p>}
          {page.show_contact && (
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-4 text-sm text-gray-500">
              {profile.location && <span>{profile.location}</span>}
              {profile.contact_email && <a href={`mailto:${profile.contact_email}`} className="hover:underline">{profile.contact_email}</a>}
              {profile.contact_phone && <span>{profile.contact_phone}</span>}
            </div>
          )}
          <div className="flex justify-center gap-4 mt-3">
            {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: accent }} className="text-sm hover:underline">LinkedIn</a>}
            {profile.github_url && <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:underline">GitHub</a>}
            {profile.website && <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:underline">Site web</a>}
          </div>
        </div>

        {profile.bio && <p className="text-center italic text-gray-600 text-lg leading-relaxed">&ldquo;{profile.bio}&rdquo;</p>}

        {profile.experiences?.length > 0 && (
          <section>
            <h2 className="text-center text-xs uppercase tracking-[0.3em] text-gray-400 mb-6">— Expériences Professionnelles —</h2>
            <div className="space-y-6">
              {profile.experiences.map(e => (
                <div key={e.id} className="flex gap-6">
                  <div className="text-right w-28 flex-shrink-0">
                    <p className="text-xs text-gray-400 leading-relaxed">{fmtDate(e.start_date)}<br />{e.current ? 'Présent' : fmtDate(e.end_date)}</p>
                  </div>
                  <div className="border-l-2 border-gray-300 pl-6">
                    <p className="font-bold text-gray-800">{e.title}</p>
                    <p className="italic" style={{ color: accent }}>{e.company}</p>
                    {e.description && <p className="text-sm text-gray-600 mt-2 leading-relaxed">{e.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {profile.educations?.length > 0 && (
          <section>
            <h2 className="text-center text-xs uppercase tracking-[0.3em] text-gray-400 mb-6">— Formation —</h2>
            <div className="space-y-4">
              {profile.educations.map(e => (
                <div key={e.id} className="flex gap-6">
                  <div className="text-right w-28 flex-shrink-0 text-xs text-gray-400">{fmtDate(e.start_date)}{e.end_date ? <><br />{fmtDate(e.end_date)}</> : ''}</div>
                  <div className="border-l-2 border-gray-300 pl-6">
                    <p className="font-bold text-gray-800">{e.degree}</p>
                    <p className="italic text-gray-600">{e.school}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {profile.skills?.length > 0 && (
          <section className="text-center">
            <h2 className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-4">— Compétences —</h2>
            <p className="text-gray-700">{profile.skills.map(s => s.name).join('  ·  ')}</p>
          </section>
        )}

        {profile.languages?.length > 0 && (
          <section className="text-center">
            <h2 className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-3">— Langues —</h2>
            <p className="text-gray-700">{profile.languages.map(l => l.level ? `${l.name} (${l.level})` : l.name).join('  ·  ')}</p>
          </section>
        )}
      </div>
    </div>
  );
}
