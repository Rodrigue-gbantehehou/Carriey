import React from 'react';
import { PublicPageData } from '@/types/public-page';
import { getPhotoUrl } from '@/lib/photo-url';
import { TextList } from '@/components/ui/TextList';
import { MapPin, Mail, Phone, Globe, Github, Linkedin, ExternalLink } from 'lucide-react';

function fmtDate(d?: string) {
  if (!d) return '';
  const [y, m] = d.split('-');
  const months = ['jan.','fév.','mars','avr.','mai','juin','juil.','août','sep.','oct.','nov.','déc.'];
  return m ? `${months[parseInt(m)-1]} ${y}` : y;
}

export default function MinimalTheme({ data, accent }: { data: PublicPageData; accent: string }) {
  const { page, profile } = data;
  const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.username || '';
  const photo = page.show_photo ? getPhotoUrl(profile.photo_url) : null;

  return (
    <div className="min-h-screen bg-white text-gray-900 font-[Georgia,serif]">
      <div className="max-w-form mx-auto px-6 py-14 space-y-10">
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

        {profile.bio && <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">{profile.bio}</p>}

        {profile.experiences?.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Expériences</h2>
            <div className="space-y-5">
              {profile.experiences.map(e => (
                <div key={e.id} className="border-l-2 pl-4" style={{ borderColor: accent }}>
                  <p className="font-bold">{e.title}</p>
                  <p className="text-sm" style={{ color: accent }}>{e.company}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{fmtDate(e.start_date)} — {e.current ? 'Présent' : fmtDate(e.end_date)}{e.location ? ` · ${e.location}` : ''}</p>
                  {e.description && <TextList text={e.description} className="text-sm text-gray-600 mt-2 leading-relaxed" />}
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
                  {p.description && <TextList text={p.description} className="text-sm text-gray-600 mt-0.5" />}
                </div>
              ))}
            </div>
          </section>
        )}

        {profile.languages && profile.languages.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Langues</h2>
            <p className="text-sm text-gray-700">{profile.languages.map(l => l.level ? `${l.name} (${l.level})` : l.name).join(' · ')}</p>
          </section>
        )}
      
        {profile.certifications && profile.certifications.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Certifications</h2>
            <div className="space-y-4">
              {profile.certifications.map(c => (
                <div key={c.id} className="border-l-2 pl-4 border-gray-200">
                  <p className="font-bold">{c.name}</p>
                  <p className="text-sm text-gray-600">{c.issuer}</p>
                  <p className="text-xs text-gray-400">{fmtDate(c.date)}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {profile.references && profile.references.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Références</h2>
            <div className="space-y-4">
              {profile.references.map((r: any) => (
                <div key={r.id || r.name} className="border-l-2 pl-4 border-gray-200">
                  <p className="font-bold">{r.name}</p>
                  <p className="text-sm text-gray-600">{r.company || r.title}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {r.email && <span className="mr-3">{r.email}</span>}
                    {r.phone && <span>{r.phone}</span>}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {profile.custom_sections && profile.custom_sections.length > 0 && profile.custom_sections.map((cs: any) => (
          <section key={cs.id}>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">{cs.title}</h2>
            {cs.type === 'list' || cs.type === 'simple_list' ? (
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {(cs.content || '').split('\n').filter((l: string) => l.trim()).map((l: string, i: number) => <li key={i}>{l}</li>)}
              </ul>
            ) : cs.type === 'detailed_list' ? (
              <div className="space-y-4">
                {cs.items?.map((item: any, i: number) => (
                  <div key={i} className="border-l-2 pl-4 border-gray-200">
                    <p className="font-bold">{item.title}</p>
                    {item.subtitle && <p className="text-sm text-gray-600">{item.subtitle}</p>}
                    {item.date && <p className="text-xs text-gray-400">{item.date}</p>}
                    {item.description && <TextList text={item.description} className="text-sm text-gray-600 mt-2" />}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-700 leading-relaxed">
                {(cs.content || '').split('\n').map((line: string, idx: number) => (
                  <React.Fragment key={idx}>
                    {line}
                    {idx < (cs.content || '').split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
