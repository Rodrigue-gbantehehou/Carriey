import React from 'react';
import { TemplateProps } from '@/types/cv';
import { TemplateStyles, CVSection, RemoteStyles, CustomSectionContent } from '../BaseComponents';
import { getSafeData, isSectionEnabled, getSectionLabel } from '../utils';

const AbidjanTemplate: React.FC<TemplateProps> = ({ data: rawData, config, apiBaseUrl }) => {
  const data = getSafeData(rawData);
  const { profile, summary, experience, education, certifications, skills, languages, projects, custom_sections } = data;

  const leftSections = config.sections.filter((s: any) => s.enabled && s.column === 'left');
  const rightSections = config.sections.filter((s: any) => s.enabled && s.column !== 'left');

  return (
    <div className="cv-rendering-root cv-container abidjan-template">
      <RemoteStyles templateName={config.templateName} apiBaseUrl={apiBaseUrl} />
      <TemplateStyles config={config} />

      {/* Header */}
      <header className="abidjan-header">
        {isSectionEnabled(config, 'photo') && (
          <div className="abidjan-photo-wrap">
            {profile.photo ? (
              <div className="abidjan-photo" style={{ borderRadius: 'var(--photo-shape, 50%)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={profile.photo} alt={profile.name} />
              </div>
            ) : (
              <div className="abidjan-photo-placeholder"><i className="fas fa-user" /></div>
            )}
          </div>
        )}
        <div className="abidjan-header-info">
          <h1 className="abidjan-name">{profile.name}</h1>
          {profile.title && <div className="abidjan-title">{profile.title}</div>}
          {isSectionEnabled(config, 'contact') && (
            <div className="abidjan-contact">
              {profile.phone    && <span className="abidjan-contact-item"><i className="fas fa-phone" />{profile.phone}</span>}
              {profile.email    && <span className="abidjan-contact-item"><i className="fas fa-envelope" />{profile.email}</span>}
              {profile.location && <span className="abidjan-contact-item"><i className="fas fa-map-marker-alt" />{profile.location}</span>}
              {profile.linkedin_url && <span className="abidjan-contact-item"><i className="fab fa-linkedin" />{profile.linkedin_url.replace(/^https?:\/+(www\.)?/, '')}</span>}
              {profile.github_url   && <span className="abidjan-contact-item"><i className="fab fa-github" />{profile.github_url.replace(/^https?:\/+(www\.)?/, '')}</span>}
              {profile.website      && <span className="abidjan-contact-item"><i className="fas fa-globe" />{profile.website}</span>}
            </div>
          )}
        </div>
      </header>

      {/* Body — 2 colonnes, Pageflow parallel */}
      <div className="abidjan-body" data-pf-parallel="true">

        {/* Sidebar gauche */}
        <aside className="abidjan-sidebar" data-pf-splittable="true">
          {leftSections.map((section: any) => {
            switch (section.type) {
              case 'identity':
                return (profile.age || profile.nationality || profile.marital_status) && (
                  <div key="identity" data-pf-splittable="true">
                    <CVSection title={getSectionLabel(config, 'identity', 'Identité')} icon="fas fa-id-card">
                      <div className="abidjan-identity">
                        {profile.age         && <div className="abidjan-id-row"><span className="abidjan-id-label">Âge</span><span>{profile.age}</span></div>}
                        {profile.nationality && <div className="abidjan-id-row"><span className="abidjan-id-label">Nationalité</span><span>{profile.nationality}</span></div>}
                        {profile.marital_status && <div className="abidjan-id-row"><span className="abidjan-id-label">Situation</span><span>{profile.marital_status}</span></div>}
                      </div>
                    </CVSection>
                  </div>
                );

              case 'skills':
                return skills?.groups && skills.groups.length > 0 && (
                  <div key="skills" data-pf-splittable="true">
                    <CVSection title={getSectionLabel(config, 'skills', 'Compétences')} icon="fas fa-star">
                      <ul className="abidjan-skill-list">
                        {skills.groups.flatMap((g: any) => g.items || []).map((skill: any, i: number) => (
                          <li key={i}>{typeof skill === 'object' ? skill.name : skill}</li>
                        ))}
                      </ul>
                    </CVSection>
                  </div>
                );

              case 'languages':
                return languages && languages.length > 0 && (
                  <div key="languages" data-pf-splittable="true">
                    <CVSection title={getSectionLabel(config, 'languages', 'Langues')} icon="fas fa-language">
                      <ul className="abidjan-lang-list">
                        {languages.map((lang: any, i: number) => (
                          <li key={i}>
                            <strong>{lang.name}</strong>
                            {lang.level && <span className="abidjan-lang-level"> — {lang.level}</span>}
                          </li>
                        ))}
                      </ul>
                    </CVSection>
                  </div>
                );

              case 'interests':
                return data.interests && data.interests.length > 0 && (
                  <div key="interests" data-pf-splittable="true">
                    <CVSection title={getSectionLabel(config, 'interests', "Centres d'intérêt")} icon="fas fa-heart">
                      <div className="abidjan-tags">
                        {data.interests.map((interest: string, i: number) => (
                          <span key={i} className="abidjan-tag">{interest}</span>
                        ))}
                      </div>
                    </CVSection>
                  </div>
                );

              default:
                if (section.type.startsWith('custom_')) {
                  const customId = section.type.replace('custom_', '');
                  const custom = custom_sections?.find((c: any) => c.id === customId);
                  if (custom) return (
                    <div key={section.type} data-pf-splittable="true">
                      <CVSection title={custom.title} icon={custom.icon || 'fas fa-star'}>
                        <CustomSectionContent custom={custom} />
                      </CVSection>
                    </div>
                  );
                }
                return null;
            }
          })}
        </aside>

        {/* Colonne principale */}
        <main className="abidjan-main" data-pf-splittable="true">
          {rightSections.map((section: any) => {
            switch (section.type) {
              case 'summary':
                return summary && (
                  <CVSection key="summary" title={getSectionLabel(config, 'summary', 'Profil Professionnel')} icon="fas fa-user-tie">
                    <p className="abidjan-summary">{summary}</p>
                  </CVSection>
                );

              case 'experience':
                return experience && experience.length > 0 && (
                  <CVSection key="experience" title={getSectionLabel(config, 'experience', 'Expériences Professionnelles')} icon="fas fa-briefcase">
                    {experience.map((exp: any, i: number) => (
                      <div key={i} className="abidjan-item" data-pf-splittable="true">
                        <div className="abidjan-item-header">
                          <span className="abidjan-item-title">{exp.title}</span>
                          {exp.dates && <span className="abidjan-item-date">{exp.dates}</span>}
                        </div>
                        {exp.company && <div className="abidjan-item-sub">{exp.company}{exp.location ? ` · ${exp.location}` : ''}</div>}
                        {exp.description && <p className="abidjan-item-desc">{exp.description}</p>}
                        {exp.tasks && exp.tasks.length > 0 && (
                          <ul className="abidjan-tasks">
                            {exp.tasks.map((t: string, j: number) => <li key={j}>{t}</li>)}
                          </ul>
                        )}
                      </div>
                    ))}
                  </CVSection>
                );

              case 'education':
                return education && education.length > 0 && (
                  <CVSection key="education" title={getSectionLabel(config, 'education', 'Formation')} icon="fas fa-graduation-cap">
                    {education.map((edu: any, i: number) => (
                      <div key={i} className="abidjan-item" data-pf-splittable="true">
                        <div className="abidjan-item-header">
                          <span className="abidjan-item-title">{edu.degree}</span>
                          {edu.dates && <span className="abidjan-item-date">{edu.dates}</span>}
                        </div>
                        {edu.institution && <div className="abidjan-item-sub">{edu.institution}{edu.location ? ` · ${edu.location}` : ''}</div>}
                        {edu.description && <p className="abidjan-item-desc">{edu.description}</p>}
                      </div>
                    ))}
                  </CVSection>
                );

              case 'certifications':
                return certifications && certifications.length > 0 && (
                  <CVSection key="certifications" title={getSectionLabel(config, 'certifications', 'Certifications')} icon="fas fa-certificate">
                    {certifications.map((cert: any, i: number) => (
                      <div key={i} className="abidjan-item" data-pf-splittable="true">
                        <div className="abidjan-item-header">
                          <span className="abidjan-item-title">{cert.name}</span>
                          {cert.date && <span className="abidjan-item-date">{cert.date}</span>}
                        </div>
                        {cert.issuer && <div className="abidjan-item-sub">{cert.issuer}</div>}
                        {cert.url && <a href={cert.url} target="_blank" rel="noopener noreferrer" className="abidjan-link"><i className="fas fa-link" /> {cert.url.replace(/^https?:\/+(www\.)?/, '')}</a>}
                      </div>
                    ))}
                  </CVSection>
                );

              case 'projects':
                return projects && projects.length > 0 && (
                  <CVSection key="projects" title={getSectionLabel(config, 'projects', 'Projets')} icon="fas fa-lightbulb">
                    {projects.map((proj: any, i: number) => (
                      <div key={i} className="abidjan-item" data-pf-splittable="true">
                        <div className="abidjan-item-header">
                          <span className="abidjan-item-title">{proj.name}</span>
                          {proj.dates && <span className="abidjan-item-date">{proj.dates}</span>}
                        </div>
                        {proj.link && <a href={proj.link} target="_blank" rel="noopener noreferrer" className="abidjan-link"><i className="fas fa-link" /> {proj.link.replace(/^https?:\/+(www\.)?/, '')}</a>}
                        {proj.description && <p className="abidjan-item-desc">{proj.description}</p>}
                      </div>
                    ))}
                  </CVSection>
                );

              case 'references':
                return data.references && data.references.length > 0 && (
                  <CVSection key="references" title={getSectionLabel(config, 'references', 'Références')} icon="fas fa-users">
                    {data.references.map((ref: any, i: number) => (
                      <div key={i} className="abidjan-item" data-pf-splittable="true">
                        <div className="abidjan-item-header">
                          <span className="abidjan-item-title">{ref.name}</span>
                        </div>
                        {(ref.company || ref.title) && <div className="abidjan-item-sub">{ref.company || ref.title}</div>}
                        <div className="abidjan-ref-contacts">
                          {ref.email && <span><i className="fas fa-envelope" /> {ref.email}</span>}
                          {ref.phone && <span><i className="fas fa-phone" /> {ref.phone}</span>}
                        </div>
                      </div>
                    ))}
                  </CVSection>
                );

              default:
                if (section.type.startsWith('custom_')) {
                  const customId = section.type.replace('custom_', '');
                  const custom = custom_sections?.find((c: any) => c.id === customId);
                  if (custom) return (
                    <CVSection key={section.type} title={custom.title} icon={custom.icon || 'fas fa-star'}>
                      <CustomSectionContent custom={custom} />
                    </CVSection>
                  );
                }
                return null;
            }
          })}
        </main>
      </div>
    </div>
  );
};

export default React.memo(AbidjanTemplate);
