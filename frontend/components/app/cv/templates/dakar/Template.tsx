import React from 'react';
import { TemplateProps } from '@/types/cv';
import { TemplateStyles, CVSection, ItemGroup, SkillTag , RemoteStyles} from '../BaseComponents';
import { getSafeData, isSectionEnabled, getSectionLabel } from '../utils';

const DakarTemplate: React.FC<TemplateProps> = ({ data: rawData, config, apiBaseUrl }) => {
  const data = getSafeData(rawData);
  const { profile, summary, experience, education, skills, languages, projects, references, custom_sections } = data;
  
  return (
    <div className="cv-rendering-root cv-container dakar-template">
      <RemoteStyles templateName={config.templateName} apiBaseUrl={apiBaseUrl} />
      <TemplateStyles config={config} />
      
      {/* Bandeau en-tête */}
      <div className="header-band">
        <div className="header-text">
          <h1 className="header-name">{profile.name}</h1>
          {profile.title && (
            <div className="header-title">{profile.title}</div>
          )}
        </div>
      </div>

      <div className="main-layout">
        {/* Colonne gauche */}
        <div className="left-column">
          {isSectionEnabled(config, 'photo') && (
            <div className="profile-photo-wrap">
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

          {config.sections.filter(s => s.enabled && s.column === 'left').map((section) => {
            switch (section.type) {
              case 'identity':
                return (profile.age || profile.nationality || (profile as any).marital_status) && (
                  <CVSection key="identity" title={getSectionLabel(config, 'identity', 'Identité')} className="sidebar-section">
                    <div className="identity-list">
                      {profile.age && <div className="identity-item"><span className="identity-label">Âge</span><span className="identity-value">{profile.age}</span></div>}
                      {profile.nationality && <div className="identity-item"><span className="identity-label">Nationalité</span><span className="identity-value">{profile.nationality}</span></div>}
                      {(profile as any).marital_status && <div className="identity-item"><span className="identity-label">Situation</span><span className="identity-value">{(profile as any).marital_status}</span></div>}
                    </div>
                  </CVSection>
                );
              case 'contact':
                return (
                  <CVSection key="contact" title={getSectionLabel(config, 'contact', 'Contact')} className="sidebar-section">
                    <div className="contact-list">
                      {profile.phone && <div className="contact-item"><i className="fas fa-phone"></i><span>{profile.phone}</span></div>}
                      {profile.email && <div className="contact-item"><i className="fas fa-envelope"></i><span>{profile.email}</span></div>}
                      {profile.location && <div className="contact-item"><i className="fas fa-map-marker-alt"></i><span>{profile.location}</span></div>}
                    </div>
                  </CVSection>
                );
              case 'skills':
                return skills?.groups && (
                  <CVSection key="skills" title={getSectionLabel(config, 'skills', 'Compétences')} className="sidebar-section">
                    <div className="skills-wrap">
                      {skills.groups.flatMap((g: any) => g.items || []).map((skill: string, sIdx: number) => (
                        <SkillTag key={sIdx}>{skill}</SkillTag>
                      ))}
                    </div>
                  </CVSection>
                );
              case 'languages':
                return languages && languages.length > 0 && (
                  <CVSection key="languages" title={getSectionLabel(config, 'languages', 'Langues')} className="sidebar-section">
                    <div className="languages-list">
                      {languages.map((lang: any, lIdx: number) => (
                        <div key={lIdx} className="language-item">
                          <div className="lang-name">{lang.name}</div>
                          <div className="lang-level">{lang.level}</div>
                        </div>
                      ))}
                    </div>
                  </CVSection>
                );
              case 'interests':
                return data.interests && data.interests.length > 0 && (
                  <CVSection key="interests" title={getSectionLabel(config, 'interests', 'Loisirs')} className="sidebar-section">
                    <div className="skills-wrap">
                      {data.interests.map((interest: string, iIdx: number) => (
                        <SkillTag key={iIdx}>{interest}</SkillTag>
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
                      <CVSection key={section.type} title={custom.title} className="sidebar-section">
                        <div style={{ fontSize: '0.9em', lineHeight: 1.4, opacity: 0.9 }}>
                          {custom.type === 'list' ? (
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                              {custom.content.split('\n').filter((line: string) => line.trim()).map((item: string, iIdx: number) => (
                                <li key={iIdx} style={{ marginBottom: '4px' }}>• {item}</li>
                              ))}
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

        {/* Colonne droite */}
        <div className="right-column">
          {config.sections.filter(s => s.enabled && s.column !== 'left').map((section) => {
            switch (section.type) {
              case 'summary':
                return summary && (
                  <CVSection key="summary" title={getSectionLabel(config, 'summary', 'Profil')} icon="fas fa-user" className="content-section">
                    <p className="profile-text">{summary}</p>
                  </CVSection>
                );
              case 'experience':
                return experience && experience.length > 0 && (
                  <CVSection key="experience" title={getSectionLabel(config, 'experience', 'Expérience')} icon="fas fa-briefcase" className="content-section">
                    {experience.map((exp: any, idx: number) => (
                      <ItemGroup 
                        key={idx} 
                        title={exp.title} 
                        subtitle={exp.company} 
                        date={exp.dates}
                        className="experience-item"
                      >
                        <div className="exp-dot"></div>
                        {exp.tasks && exp.tasks.length > 0 && (
                          <ul className="exp-tasks">
                            {exp.tasks.map((task: string, tIdx: number) => <li key={tIdx}>{task}</li>)}
                          </ul>
                        )}
                      </ItemGroup>
                    ))}
                  </CVSection>
                );
              case 'education':
                return education && education.length > 0 && (
                  <CVSection key="education" title={getSectionLabel(config, 'education', 'Formation')} icon="fas fa-graduation-cap" className="content-section">
                    {education.map((edu: any, idx: number) => (
                      <ItemGroup 
                        key={idx} 
                        title={edu.degree} 
                        subtitle={edu.institution} 
                        date={edu.dates}
                        className="education-item"
                      />
                    ))}
                  </CVSection>
                );
              case 'projects':
                return projects && projects.length > 0 && (
                  <CVSection key="projects" title={getSectionLabel(config, 'projects', 'Projets')} icon="fas fa-lightbulb" className="content-section">
                    {projects.map((project: any, idx: number) => (
                      <ItemGroup 
                        key={idx} 
                        title={project.name} 
                        subtitle={project.link} 
                        className="experience-item"
                      >
                        <div className="exp-dot"></div>
                        <p className="profile-text" style={{ fontSize: '0.95em', color: 'inherit', padding: 0, marginTop: '5px' }}>{project.description}</p>
                      </ItemGroup>
                    ))}
                  </CVSection>
                );
              case 'references':
                return references && references.length > 0 && (
                  <CVSection key="references" title={getSectionLabel(config, 'references', 'Références')} icon="fas fa-certificate" className="content-section">
                    <div className="experience-item" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', border: 'none', paddingLeft: 0 }}>
                      {references.map((ref: any, idx: number) => (
                        <div key={idx} style={{ marginBottom: '10px' }}>
                          <div className="exp-title" style={{ fontSize: '1.1em' }}>{ref.name}</div>
                          {(ref.title || ref.company) && (
                            <div style={{ fontSize: '0.9em', opacity: 0.8 }}>{ref.title}{ref.title && ref.company ? ' - ' : ''}{ref.company}</div>
                          )}
                          <div style={{ fontSize: '0.85em', marginTop: '3px' }}>
                            {ref.phone && <span><i className="fas fa-phone"></i> {ref.phone}</span>}
                            {ref.email && <div style={{ marginTop: '2px' }}><i className="fas fa-envelope"></i> {ref.email}</div>}
                          </div>
                        </div>
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
                      <CVSection key={section.type} title={custom.title} icon="fas fa-plus-circle" className="content-section">
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
      </div>
    </div>
  );
};

export default React.memo(DakarTemplate);
