import React from 'react';
import { TemplateProps } from '@/types/cv';
import { TemplateStyles, CVSection, ItemGroup, SkillTag , RemoteStyles} from '../BaseComponents';
import { getSafeData, isSectionEnabled, getSectionLabel } from '../utils';

const AbidjanTemplate: React.FC<TemplateProps> = ({ data: rawData, config, apiBaseUrl }) => {
  const data = getSafeData(rawData);
  const { profile, summary, experience, education, skills, languages, projects, custom_sections } = data;
  
  return (
    <div className={`cv-rendering-root cv-container abidjan-template sector-${(config.sector || 'general').toLowerCase()}`}>
      <RemoteStyles templateName={config.templateName} apiBaseUrl={apiBaseUrl} />
      <TemplateStyles config={config} />
      
      {/* Header Centralisé */}
      <div className="header">
        {/* Filigrane de secteur dynamique */}
        <div className="header-watermark">
          {config.sector === 'Santé' && <span>+</span>}
          {config.sector?.includes('Tech') && <span>&lt;/&gt;</span>}
          {config.sector === 'Commerce & Vente' && <span>$</span>}
        </div>

        {isSectionEnabled(config, 'photo') && (
          <div className="profile-photo-wrap" style={{ transform: config?.tokens?.spacing === 'compact' ? 'scale(0.85)' : 'none' }}>
            {profile.photo ? (
              <div className="profile-photo" style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--photo-shape, 50%)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={profile.photo} alt={profile.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ) : (
              <div className="photo-placeholder"><i className="fas fa-user"></i></div>
            )}
          </div>
        )}

        <div className="header-info">
          <div className="header-name">{profile.name}</div>
          {profile.title && (
            <div className="header-title">{profile.title}</div>
          )}

          {isSectionEnabled(config, 'contact') && (
            <div className="header-contact">
              {profile.phone && <div className="contact-item"><i className="fas fa-phone"></i><span>{profile.phone}</span></div>}
              {profile.email && <div className="contact-item"><i className="fas fa-envelope"></i><span>{profile.email}</span></div>}
              {profile.location && <div className="contact-item"><i className="fas fa-map-marker-alt"></i><span>{profile.location}</span></div>}
            </div>
          )}
        </div>
      </div>

      {/* Corps du CV */}
      <div className="cv-body">
        {config.sections.filter(s => s.enabled).map((section) => {
          switch (section.type) {
            case 'identity':
              return (profile.age || profile.nationality || (profile as any).marital_status) && (
                <CVSection key="identity" title={getSectionLabel(config, 'identity', 'Identité')} icon="fas fa-id-card">
                  <div className="identity-grid">
                    {profile.age && <div className="identity-item"><span className="identity-label">Âge</span><span className="identity-value">{profile.age}</span></div>}
                    {profile.nationality && <div className="identity-item"><span className="identity-label">Nationalité</span><span className="identity-value">{profile.nationality}</span></div>}
                    {(profile as any).marital_status && <div className="identity-item"><span className="identity-label">Situation</span><span className="identity-value">{(profile as any).marital_status}</span></div>}
                  </div>
                </CVSection>
              );
            case 'summary':
              return summary && (
                <CVSection key="summary" title={getSectionLabel(config, 'summary', 'Profil Professionnel')} icon="fas fa-user-tie">
                  <p className="profile-text">{summary}</p>
                </CVSection>
              );
            case 'experience':
              return experience && experience.length > 0 && (
                <CVSection key="experience" title={getSectionLabel(config, 'experience', 'Expériences Professionnelles')} icon="fas fa-briefcase">
                  <div className="experiences-list">
                    {experience.map((exp: any, idx: number) => (
                      <div key={idx} className="experience-item">
                        <div className="exp-left">
                          <div className="exp-dates">{exp.dates}</div>
                          <div className="exp-company">{exp.company}</div>
                        </div>
                        <div className="exp-right">
                          <div className="exp-title">{exp.title}</div>
                          {exp.tasks && exp.tasks.length > 0 && (
                            <ul className="exp-tasks">
                              {exp.tasks.map((task: string, tIdx: number) => <li key={tIdx}>{task}</li>)}
                            </ul>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CVSection>
              );
            case 'education':
              return education && education.length > 0 && (
                <CVSection key="education" title={getSectionLabel(config, 'education', 'Formation & Diplômes')} icon="fas fa-graduation-cap">
                  <div className="education-list">
                    {education.map((edu: any, idx: number) => (
                      <div key={idx} className="education-item">
                        <div className="edu-left">
                          <div className="edu-year">{edu.dates}</div>
                          <div className="edu-school">{edu.institution}</div>
                        </div>
                        <div className="edu-right"><div className="edu-degree">{edu.degree}</div></div>
                      </div>
                    ))}
                  </div>
                </CVSection>
              );
            case 'skills':
              return skills?.groups && (
                <CVSection key="skills" title={getSectionLabel(config, 'skills', 'Compétences Spécifiques')} icon="fas fa-star">
                  <div className="skills-list">
                    {skills.groups.flatMap((g: any) => g.items || []).map((skill: string, sIdx: number) => (
                      <SkillTag key={sIdx}>{skill}</SkillTag>
                    ))}
                  </div>
                </CVSection>
              );
            case 'languages':
              return languages && languages.length > 0 && (
                <CVSection key="languages" title={getSectionLabel(config, 'languages', 'Langues Maîtrisées')} icon="fas fa-language">
                  <div className="languages-list-grid">
                    {languages.map((lang: any, lIdx: number) => (
                      <div key={lIdx} className="language-item">
                        <span className="lang-name">{lang.name}</span>
                        <div className="lang-bar-bg"><div className="lang-bar-fill" style={{ width: lang.level?.includes('Maternel') || lang.level?.includes('Courant') ? '100%' : '70%' }}></div></div>
                        <span className="lang-level">{lang.level}</span>
                      </div>
                    ))}
                  </div>
                </CVSection>
              );
            case 'projects':
              return projects && projects.length > 0 && (
                <CVSection key="projects" title={getSectionLabel(config, 'projects', 'Projets Réalisés')} icon="fas fa-lightbulb">
                  {projects.map((project: any, idx: number) => (
                    <div key={idx} className="experience-item">
                      <div className="exp-left"><div className="exp-company">{project.name}</div></div>
                      <div className="exp-right">
                        {project.link && <div className="exp-title" style={{ fontSize: '0.9em', opacity: 0.8 }}>{project.link}</div>}
                        <div className="profile-text" style={{ padding: 0, marginTop: '5px' }}>{project.description}</div>
                      </div>
                    </div>
                  ))}
                </CVSection>
              );
            case 'interests':
              return data.interests && data.interests.length > 0 && (
                <CVSection key="interests" title={getSectionLabel(config, 'interests', 'Centres d&apos;Intérêt')} icon="fas fa-heart">
                  <div className="interests-list">
                    {data.interests.map((interest: string, iIdx: number) => (
                      <span key={iIdx} className="interest-tag">{interest}</span>
                    ))}
                  </div>
                </CVSection>
              );
            default:
              if (section.type.startsWith('custom_')) {
                const customId = section.type.replace('custom_', '');
                const custom = custom_sections?.find((c: any) => c.id === customId);
                if (custom) {
                  return (
                    <CVSection key={section.type} title={custom.title} icon="fas fa-plus-circle">
                      <div className="profile-text">
                        {custom.type === 'list' ? (
                          <ul className="exp-tasks">
                            {custom.content.split('\n').filter((line: string) => line.trim()).map((item: string, iIdx: number) => <li key={iIdx}>{item}</li>)}
                          </ul>
                        ) : (
                          <div dangerouslySetInnerHTML={{ __html: custom.content.replace(/\n/g, '<br>') }} />
                        )}
                      </div>
                    </CVSection>
                  );
                }
              }
              return null;
          }
        })}
      </div>
      <div className="cv-footer"></div>
    </div>
  );
};

export default React.memo(AbidjanTemplate);
