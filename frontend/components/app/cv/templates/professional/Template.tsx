
import React from 'react';
import { TemplateProps } from '@/types/cv';
import Image from 'next/image';
import { TemplateStyles, RemoteStyles, CVSection, ItemGroup, SkillBar } from '../BaseComponents';
import { getSafeData, isSectionEnabled, getSectionLabel } from '../utils';

const ProfessionalTemplate: React.FC<TemplateProps> = ({ data: rawData, config, apiBaseUrl }) => {
  const data = getSafeData(rawData);
  const { profile, summary, experience, education, skills, languages, projects, custom_sections } = data;
  
  return (
    <div className="cv-rendering-root cv-container professional-template">
      <RemoteStyles templateName={config.templateName} apiBaseUrl={apiBaseUrl} />
      <TemplateStyles config={config} />
      
      {/* Executive Header */}
      <header className="header">
        <h1 className="name">{profile.name}</h1>
        {profile.title && (
          <p className="profession">{profile.title}</p>
        )}
      </header>

      <div className="main-layout" style={{ display: 'flex', flex: 1, width: '100%' }}>
        {/* Sidebar */}
        <aside className="left-column" style={{ width: '32%', flexShrink: 0 }}>
          {isSectionEnabled(config, 'photo') && (
            <div className="profile-photo-wrap">
              {profile.photo ? (
              <div className="profile-photo" style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--photo-shape, 50%)' }}>
                <Image 
                  src={profile.photo} 
                  alt={profile.name} 
                  fill 
                  style={{ objectFit: 'cover' }}
                />
              </div>
              ) : (
                <div className="photo-placeholder"><i className="fas fa-user"></i></div>
              )}
            </div>
          )}

          {config.sections.filter(s => s.enabled && s.column === 'left').map((section) => {
            switch (section.type) {
              case 'contact':
                return (
                  <CVSection key="contact" title={getSectionLabel(config, 'contact', 'Coordonnées')} className="sidebar-section">
                    <div className="contact-list">
                      {profile.phone && <div className="contact-item"><i className="fas fa-phone"></i><span>{profile.phone}</span></div>}
                      {profile.email && <div className="contact-item"><i className="fas fa-envelope"></i><span>{profile.email}</span></div>}
                      {profile.location && <div className="contact-item"><i className="fas fa-map-marker-alt"></i><span>{profile.location}</span></div>}
                    </div>
                  </CVSection>
                );
              case 'identity':
                return (profile.age || profile.nationality || (profile as any).marital_status) && (
                  <CVSection key="identity" title={getSectionLabel(config, 'identity', 'État Civil')} className="sidebar-section">
                    <div className="contact-list">
                      {profile.age && <div className="contact-item"><i className="fas fa-calendar-check"></i><span>{profile.age}</span></div>}
                      {profile.nationality && <div className="contact-item"><i className="fas fa-flag"></i><span>{profile.nationality}</span></div>}
                      {(profile as any).marital_status && <div className="contact-item"><i className="fas fa-users"></i><span>{(profile as any).marital_status}</span></div>}
                    </div>
                  </CVSection>
                );
              case 'skills':
                return skills?.groups && (
                  <CVSection key="skills" title={getSectionLabel(config, 'skills', 'Expertise')} className="sidebar-section">
                    <div className="skills-list">
                      {skills.groups.flatMap((g: any) => g.items || []).map((skill: string, sIdx: number) => (
                        <SkillBar key={sIdx} name={skill} level={85} />
                      ))}
                    </div>
                  </CVSection>
                );
              case 'languages':
                return languages && languages.length > 0 && (
                  <CVSection key="languages" title={getSectionLabel(config, 'languages', 'Langues')} className="sidebar-section">
                    <div className="contact-list">
                      {languages.map((lang: any, lIdx: number) => (
                        <div key={lIdx} className="contact-item">
                          <i className="fas fa-globe"></i>
                          <span><strong>{lang.name}</strong> – {lang.level}</span>
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
        </aside>

        {/* Main Content */}
        <main className="right-column" style={{ flex: 1 }}>
          {config.sections.filter(s => s.enabled && s.column !== 'left').map((section) => {
            switch (section.type) {
              case 'summary':
                return summary && (
                  <CVSection key="summary" title={getSectionLabel(config, 'summary', 'Parcours Professionnel')} className="content-section">
                    <p className="about-text">{summary}</p>
                  </CVSection>
                );
              case 'experience':
                return experience && experience.length > 0 && (
                  <CVSection key="experience" title={getSectionLabel(config, 'experience', 'Expérience')} className="content-section">
                    {experience.map((exp: any, idx: number) => (
                      <ItemGroup 
                        key={idx} 
                        title={exp.title} 
                        subtitle={exp.company} 
                        date={exp.dates}
                        className="experience-item"
                      >
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
                  <CVSection key="education" title={getSectionLabel(config, 'education', 'Formation')} className="content-section">
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
                  <CVSection key="projects" title={getSectionLabel(config, 'projects', 'Projets')} className="content-section">
                    {projects.map((project: any, idx: number) => (
                      <ItemGroup 
                        key={idx} 
                        title={project.name} 
                        subtitle={project.link} 
                        className="experience-item"
                      >
                        <p className="about-text" style={{ fontSize: '0.95em', marginTop: '5px' }}>{project.description}</p>
                      </ItemGroup>
                    ))}
                  </CVSection>
                );
              default:
                if (section.type.startsWith('custom_')) {
                  const customId = section.type.replace('custom_', '');
                  const custom = custom_sections?.find((c: any) => c.id === customId);
                  if (custom) {
                    return (
                      <CVSection key={section.type} title={custom.title} className="content-section">
                        <div className="about-text">
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
        </main>
      </div>
    </div>
  );
};

export default React.memo(ProfessionalTemplate);
