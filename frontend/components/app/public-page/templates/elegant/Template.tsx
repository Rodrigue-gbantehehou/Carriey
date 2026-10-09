import React from 'react';
import { PublicPageData } from '@/types/public-page';
import { getPhotoUrl } from '@/lib/photo-url';
import { TextList } from '@/components/ui/TextList';

function fmtDate(d?: string) {
  if (!d) return '';
  const [y, m] = d.split('-');
  const months = ['jan.','fév.','mars','avr.','mai','juin','juil.','août','sep.','oct.','nov.','déc.'];
  return m ? `${months[parseInt(m)-1]} ${y}` : y;
}

export default function ElegantTheme({ data, accent }: { data: PublicPageData; accent: string }) {
  const { page, profile } = data;
  const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.username || '';
  const photo = page.show_photo ? getPhotoUrl(profile.photo_url) : null;

  return (
    <div className="min-h-screen bg-amber-50" style={{ fontFamily: "'Palatino Linotype', Georgia, serif" }}>
      <div className="max-w-form mx-auto px-8 py-16 space-y-10">
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

        {profile.bio && <p className="text-center italic text-gray-600 text-lg leading-relaxed whitespace-pre-line">&ldquo;{profile.bio}&rdquo;</p>}

        {profile.experiences?.length > 0 && (
          <section>
            <h2 className="text-center text-xs uppercase tracking-[0.3em] text-gray-400 mb-6">— Expériences Professionnelles —</h2>
            <div className="space-y-6">
              {profile.experiences.map((e: any) => (
                <div key={e.id} className="flex gap-6">
                  <div className="text-right w-28 flex-shrink-0">
                    <p className="text-xs text-gray-400 leading-relaxed">{fmtDate(e.start_date)}<br />{e.current ? 'Présent' : fmtDate(e.end_date)}</p>
                  </div>
                  <div className="border-l-2 border-gray-300 pl-6">
                    <p className="font-bold text-gray-800">{e.title}</p>
                    <p className="italic" style={{ color: accent }}>{e.company}</p>
                    {e.description && <TextList text={e.description} className="text-sm text-gray-600 mt-2 leading-relaxed" />}
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
              {profile.educations.map((e: any) => (
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
            <p className="text-gray-700">{profile.skills.map((s: any) => s.name).join('  ·  ')}</p>
          </section>
        )}

        {profile.languages && profile.languages.length > 0 && (
          <section className="text-center">
            <h2 className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-3">— Langues —</h2>
            <p className="text-gray-700">{profile.languages.map((l: any) => l.level ? `${l.name} (${l.level})` : l.name).join('  ·  ')}</p>
          </section>
        )}
      </div>
    </div>
  );
}
