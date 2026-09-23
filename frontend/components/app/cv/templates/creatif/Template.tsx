import React from 'react';
import { TemplateProps } from '@/types/cv';
import { TemplateStyles, CVSection, RemoteStyles, CustomSectionContent } from '../BaseComponents';
import { getSafeData, isSectionEnabled, getSectionLabel, getLeftColumnSections, getRightColumnSections } from '../utils';

const CreatifTemplate: React.FC<TemplateProps> = ({ data: rawData, config, apiBaseUrl }) => {
  const data = getSafeData(rawData);
  const { profile, summary, experience, education, certifications, skills, languages, projects, custom_sections } = data;

  return (
    <div className="cv-rendering-root cv-container creatif-template">
      <RemoteStyles templateName={config.templateName} apiBaseUrl={apiBaseUrl} />
      <TemplateStyles config={config} />

      {/* Layout 2 colonnes — Pageflow parallel */}
      <div className="creatif-layout" data-pf-parallel="true">

        {/* ── Sidebar gauche ── */}
        <aside className="creatif-sidebar" data-pf-splittable="true">

          {/* Photo + Nom + Titre */}
          <div className="creatif-profile">
            {isSectionEnabled(config, 'photo') && (
              profile.photo ? (
                <div className="creatif-photo" style={{ borderRadius: 'var(--photo-shape, 50%)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={profile.photo} alt={profile.name} />
                </div>
              ) : (
                <div className="creatif-photo-placeholder"><i className="fas fa-user" /></div>
              )
            )}
            <h1 className="creatif-name">{profile.name}</h1>
            {profile.title && <div className="creatif-title">{profile.title}</div>}
          </div>

          {/* Sections gauche */}
          {getLeftColumnSections(config).map((section: any) => {
            switch (section.type) {
              case 'contact':
                return (
                  <div key="contact" className="creatif-sidebar-section" data-pf-splittable="true">
                    <h3 className="creatif-sidebar-heading">{getSectionLabel(config, 'contact', 'Contact')}</h3>
                    <div className="creatif-contact-list">
                      {profile.phone    && <div className="creatif-contact-item"><i className="fas fa-phone" /><span>{profile.phone}</span></div>}
                      {profile.email    && <div className="creatif-contact-item"><i className="fas fa-envelope" /><span>{profile.email}</span></div>}
                      {profile.location && <div className="creatif-contact-item"><i className="fas fa-map-marker-alt" /><span>{profile.location}</span></div>}
                      {profile.website  && <div className="creatif-contact-item"><i className="fas fa-globe" /><span>{profile.website}</span></div>}
                      {profile.linkedin_url && <div className="creatif-contact-item"><i className="fab fa-linkedin" /><span>{profile.linkedin_url.replace(/^https?:\/+(www\.)?/, '')}</span></div>}
                      {profile.github_url   && <div className="creatif-contact-item"><i className="fab fa-github" /><span>{profile.github_url.replace(/^https?:\/+(www\.)?/, '')}</span></div>}
                    </div>
                  </div>
                );

              case 'identity':
                return (profile.age || profile.nationality || (profile as any).marital_status) && (
                  <div key="identity" className="creatif-sidebar-section" data-pf-splittable="true">
                    <h3 className="creatif-sidebar-heading">{getSectionLabel(config, 'identity', 'Identité')}</h3>
                    <div className="creatif-contact-list">
                      {profile.age         && <div className="creatif-contact-item"><i className="fas fa-user" /><span>Âge : {profile.age}</span></div>}
                      {profile.nationality && <div className="creatif-contact-item"><i className="fas fa-flag" /><span>{profile.nationality}</span></div>}
                      {(profile as any).marital_status && <div className="creatif-contact-item"><i className="fas fa-heart" /><span>{(profile as any).marital_status}</span></div>}
                    </div>
                  </div>
                );

              case 'skills':
                return skills?.groups && skills.groups.length > 0 && (
                  <div key="skills" className="creatif-sidebar-section" data-pf-splittable="true">
                    <h3 className="creatif-sidebar-heading">{getSectionLabel(config, 'skills', 'Compétences')}</h3>
                    <div className="creatif-skills">
                      {skills.groups.flatMap((g: any) => g.items || []).map((skill: any, i: number) => (
                        <span key={i} className="creatif-skill-tag">{typeof skill === 'string' ? skill : skill.name || ''}</span>
                      ))}
                    </div>
                  </div>
                );

              case 'languages':
                return languages && languages.length > 0 && (
                  <div key="languages" className="creatif-sidebar-section" data-pf-splittable="true">
                    <h3 className="creatif-sidebar-heading">{getSectionLabel(config, 'languages', 'Langues')}</h3>
                    <div className="creatif-lang-list">
                      {languages.map((lang: any, i: number) => (
                        <div key={i} className="creatif-lang-item">
                          <span className="creatif-lang-name">{lang.name}</span>
                          {lang.level && <span className="creatif-lang-level">{lang.level}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                );

              case 'interests':
                return data.interests && data.interests.length > 0 && (
                  <div key="interests" className="creatif-sidebar-section" data-pf-splittable="true">
                    <h3 className="creatif-sidebar-heading">{getSectionLabel(config, 'interests', "Centres d'intérêt")}</h3>
                    <div className="creatif-skills">
                      {data.interests.map((interest: string, i: number) => (
                        <span key={i} className="creatif-skill-tag">{interest}</span>
                      ))}
                    </div>
                  </div>
                );

              default:
                if (section.type.startsWith('custom_')) {
                  const customId = section.type.replace('custom_', '');
                  const custom = custom_sections?.find((c: any) => c.id === customId);
                  if (custom) return (
                    <div key={section.type} className="creatif-sidebar-section" data-pf-splittable="true">
                      <h3 className="creatif-sidebar-heading">{custom.title}</h3>
                      <CustomSectionContent custom={custom} />
                    </div>
                  );
                }
                return null;
            }
          })}
        </aside>

        {/* ── Colonne principale ── */}
        <main className="creatif-main" data-pf-splittable="true">
          {getRightColumnSections(config).map((section: any) => {
            switch (section.type) {
              case 'summary':
                return summary && (
                  <CVSection key="summary" title={getSectionLabel(config, 'summary', 'Profil')}>
                    <p className="creatif-summary">{summary}</p>
                  </CVSection>
                );

              case 'experience':
                return experience && experience.length > 0 && (
                  <CVSection key="experience" title={getSectionLabel(config, 'experience', 'Expériences')}>
                    {experience.map((exp: any, i: number) => (
                      <div key={i} className="creatif-item" data-pf-splittable="true">
                        <div className="creatif-item-header">
                          <span className="creatif-item-title">{exp.title}</span>
                          {exp.dates && <span className="creatif-item-date">{exp.dates}</span>}
                        </div>
                        {(exp.company || exp.location) && (
                          <div className="creatif-item-sub">{exp.company}{exp.location ? ` · ${exp.location}` : ''}</div>
                        )}
                        {exp.description && <p className="creatif-item-desc">{exp.description}</p>}
                        {exp.tasks && exp.tasks.length > 0 && (
                          <ul className="creatif-tasks">
                            {exp.tasks.map((t: string, j: number) => <li key={j}>{t}</li>)}
                          </ul>
                        )}
                      </div>
                    ))}
                  </CVSection>
                );

              case 'education':
                return education && education.length > 0 && (
                  <CVSection key="education" title={getSectionLabel(config, 'education', 'Formation')}>
                    {education.map((edu: any, i: number) => (
                      <div key={i} className="creatif-item" data-pf-splittable="true">
                        <div className="creatif-item-header">
                          <span className="creatif-item-title">{edu.degree}</span>
                          {edu.dates && <span className="creatif-item-date">{edu.dates}</span>}
                        </div>
                        {(edu.institution || edu.location) && (
                          <div className="creatif-item-sub">{edu.institution}{edu.location ? ` · ${edu.location}` : ''}</div>
                        )}
                        {edu.description && <p className="creatif-item-desc">{edu.description}</p>}
                      </div>
                    ))}
                  </CVSection>
                );

              case 'certifications':
                return certifications && certifications.length > 0 && (
                  <CVSection key="certifications" title={getSectionLabel(config, 'certifications', 'Certifications')}>
                    {certifications.map((cert: any, i: number) => (
                      <div key={i} className="creatif-item" data-pf-splittable="true">
                        <div className="creatif-item-header">
                          <span className="creatif-item-title">{cert.name}</span>
                          {cert.date && <span className="creatif-item-date">{cert.date}</span>}
                        </div>
                        {cert.issuer && <div className="creatif-item-sub">{cert.issuer}</div>}
                        {cert.url && <a href={cert.url} target="_blank" rel="noopener noreferrer" className="creatif-link"><i className="fas fa-link" /> {cert.url.replace(/^https?:\/+(www\.)?/, '')}</a>}
                      </div>
                    ))}
                  </CVSection>
                );

              case 'projects':
                return projects && projects.length > 0 && (
                  <CVSection key="projects" title={getSectionLabel(config, 'projects', 'Projets')}>
                    {projects.map((proj: any, i: number) => (
                      <div key={i} className="creatif-item" data-pf-splittable="true">
                        <div className="creatif-item-header">
                          <span className="creatif-item-title">{proj.name}</span>
                          {proj.dates && <span className="creatif-item-date">{proj.dates}</span>}
                        </div>
                        {proj.link && <a href={proj.link} target="_blank" rel="noopener noreferrer" className="creatif-link"><i className="fas fa-link" /> {proj.link.replace(/^https?:\/+(www\.)?/, '')}</a>}
                        {proj.description && <p className="creatif-item-desc">{proj.description}</p>}
                      </div>
                    ))}
                  </CVSection>
                );

              case 'references':
                return data.references && data.references.length > 0 && (
                  <CVSection key="references" title={getSectionLabel(config, 'references', 'Références')}>
                    {data.references.map((ref: any, i: number) => (
                      <div key={i} className="creatif-item" data-pf-splittable="true">
                        <div className="creatif-item-header">
                          <span className="creatif-item-title">{ref.name}</span>
                        </div>
                        {(ref.company || ref.title) && <div className="creatif-item-sub">{ref.company || ref.title}</div>}
                        <div className="creatif-ref-contacts">
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
                    <CVSection key={section.type} title={custom.title}>
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

export default React.memo(CreatifTemplate);
