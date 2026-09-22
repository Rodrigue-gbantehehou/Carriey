import React from 'react';
import { TemplateProps } from '@/types/cv';
import { TemplateStyles, CVSection, ItemGroup , RemoteStyles} from '../BaseComponents';
import { getSafeData, isSectionEnabled, getSectionLabel } from '../utils';

const ModerneTemplate: React.FC<TemplateProps> = ({ data: rawData, config, apiBaseUrl }) => {
  const data = getSafeData(rawData);
  const { profile, summary, experience, education, skills, languages, projects, custom_sections } = data;
  
  const sectionsInColumn = (column: 'left' | 'right' | 'full') => {
    return config.sections.filter(s => s.enabled && (s.column === column || (!s.column && column === 'right')));
  };

  return (
    <div className="cv-rendering-root cv-container moderne-template">
      <RemoteStyles templateName={config.templateName} apiBaseUrl={apiBaseUrl} />
      <TemplateStyles config={config} />
      
      {/* Header Split */}
      <header className="header">
        <div className="header-left">
          <h1 className="name">{profile.name}</h1>
          {profile.title && (
            <p className="profession">{profile.title}</p>
          )}
        </div>
        
        {isSectionEnabled(config, 'contact') && (
          <div className="header-right">
            {profile.phone && (
              <div className="contact-item">
                <span>{profile.phone}</span>
                <i className="fas fa-phone"></i>
              </div>
            )}
            {profile.email && (
              <div className="contact-item">
                <span>{profile.email}</span>
                <i className="fas fa-envelope"></i>
              </div>
            )}
            {profile.location && (
              <div className="contact-item">
                <span>{profile.location}</span>
                <i className="fas fa-map-marker-alt"></i>
              </div>
            )}
          </div>
        )}
      </header>

      <div className="main-content" style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside className="left-column" style={{ width: '35%', flexShrink: 0 }}>
          {isSectionEnabled(config, 'photo') && (
            <div className="profile-photo-wrap">
              {profile.photo ? (
                <div className="profile-photo" style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--photo-shape, 50%)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={profile.photo} alt={profile.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ) : (
                <div className="photo-placeholder">
                  <i className="fas fa-user"></i>
                </div>
              )}
            </div>
          )}

          {sectionsInColumn('left').map((section) => {
            switch (section.type) {
              case 'skills':
                return skills?.groups && (
                  <div key="skills" className="sidebar-section">
                    <h3 className="sidebar-title">{getSectionLabel(config, 'skills', 'Expertise')}</h3>
                    {skills.groups.map((group: any, gIdx: number) => (
                      <div key={gIdx} className="skill-category">
                        {group.label && <h4>{group.label}</h4>}
                        <div className="skill-items">
                          {(group.items || []).map((skill: string, sIdx: number) => (
                            <div key={sIdx} className="skill-item">{skill}</div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              case 'languages':
                return languages && languages.length > 0 && (
                  <div key="languages" className="sidebar-section">
                    <h3 className="sidebar-title">{getSectionLabel(config, 'languages', 'Langues')}</h3>
                    {languages.map((lang: any, lIdx: number) => (
                      <div key={lIdx} className="lang-item">
                        <span className="lang-name">{lang.name}</span>
                        <span className="lang-level">{lang.level}</span>
                      </div>
                    ))}
                  </div>
                );
              case 'identity':
                return (profile.age || profile.nationality) && (
                  <div key="identity" className="sidebar-section">
                    <h3 className="sidebar-title">{getSectionLabel(config, 'identity', 'Identité')}</h3>
                    {profile.age && (
                      <div className="lang-item">
                        <span className="lang-name">Âge</span>
                        <span className="lang-level">{profile.age}</span>
                      </div>
                    )}
                    {profile.nationality && (
                      <div className="lang-item">
                        <span className="lang-name">Nationalité</span>
                        <span className="lang-level">{profile.nationality}</span>
                      </div>
                    )}
                  </div>
                );
              default:
                if (section.type.startsWith('custom_')) {
                  const customId = section.type.replace('custom_', '');
                  const custom = custom_sections?.find((c: any) => c.id === customId);
                  if (custom) {
                    return (
                      <div key={section.type} className="sidebar-section">
                        <h3 className="sidebar-title">{custom.title}</h3>
                        <div style={{ fontSize: '0.9em', lineHeight: '1.4' }}>
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
                      </div>
                    );
                  }
                }
                return null;
            }
          })}
        </aside>

        {/* Main Content */}
        <main className="right-column">
          {sectionsInColumn('right').map((section) => {
            switch (section.type) {
              case 'summary':
                return summary && (
                  <CVSection key="summary" title={getSectionLabel(config, 'summary', 'Profil')} className="section">
                    <p className="about-text">{summary}</p>
                  </CVSection>
                );
              case 'experience':
                return experience && experience.length > 0 && (
                  <CVSection key="experience" title={getSectionLabel(config, 'experience', 'Expérience')} className="section">
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
                            {exp.tasks.map((task: string, tIdx: number) => (
                              <li key={tIdx}>{task}</li>
                            ))}
                          </ul>
                        )}
                      </ItemGroup>
                    ))}
                  </CVSection>
                );
              case 'education':
                return education && education.length > 0 && (
                  <CVSection key="education" title={getSectionLabel(config, 'education', 'Formation')} className="section">
                    {education.map((edu: any, idx: number) => (
                      <ItemGroup 
                        key={idx} 
                        title={edu.degree} 
                        subtitle={edu.institution} 
                        date={edu.dates}
                        className="edu-item"
                      />
                    ))}
                  </CVSection>
                );
              case 'projects':
                return projects && projects.length > 0 && (
                  <CVSection key="projects" title={getSectionLabel(config, 'projects', 'Projets')} className="section">
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
                      <CVSection key={section.type} title={custom.title} className="section">
                        <div className="about-text">
                          {custom.type === 'list' ? (
                            <ul className="exp-tasks">
                              {custom.content.split('\n').filter((line: string) => line.trim()).map((item: string, iIdx: number) => (
                                <li key={iIdx}>{item}</li>
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
        </main>
      </div>
    </div>
  );
};

export default React.memo(ModerneTemplate);
