
import React from 'react';
import { TemplateProps } from '@/types/cv';
import { TemplateStyles, RemoteStyles } from '../BaseComponents';

const ModerneTemplate: React.FC<TemplateProps> = ({ data, config, apiBaseUrl }) => {
  const { profile, summary, experience, education, skills, languages, projects, custom_sections } = data;
  
  const isSectionEnabled = (type: string) => {
    return config.sections.find(s => s.type === type)?.enabled !== false;
  };

  const getSectionLabel = (type: string, fallback: string) => {
    return config.sections.find(s => s.type === type)?.label || fallback;
  };

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
          <h1 className="name">{profile.name || 'Nom Prénom'}</h1>
          {(profile.position || profile.title) && (
            <p className="profession">{profile.position || profile.title}</p>
          )}
        </div>
        
        {isSectionEnabled('contact') && (
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
          {isSectionEnabled('photo') && (
            <div className="profile-photo-wrap">
              {profile.photo ? (
                <div className="profile-photo">
                  <img src={profile.photo} alt={profile.name || 'Photo'} />
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
                    <h3 className="sidebar-title">{section.label || 'Expertise'}</h3>
                    {skills.groups.map((group, gIdx) => (
                      <div key={gIdx} className="skill-category">
                        {group.label && <h4>{group.label}</h4>}
                        {group.items.map((skill, sIdx) => (
                          <div key={sIdx} className="skill-item">{skill}</div>
                        ))}
                      </div>
                    ))}
                  </div>
                );
              case 'languages':
                return languages && languages.length > 0 && (
                  <div key="languages" className="sidebar-section">
                    <h3 className="sidebar-title">{section.label || 'Langues'}</h3>
                    {languages.map((lang, lIdx) => (
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
                    <h3 className="sidebar-title">{section.label || 'Identité'}</h3>
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
                  const custom = custom_sections?.find(c => c.id === customId);
                  if (custom) {
                    return (
                      <div key={section.type} className="sidebar-section">
                        <h3 className="sidebar-title">{custom.title}</h3>
                        <div style={{ fontSize: '0.9em', lineHeight: '1.4' }}>
                          {custom.type === 'list' ? (
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                              {custom.content.split('\n').filter(line => line.trim()).map((item, iIdx) => (
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
                  <section key="summary" className="section">
                    <h3 className="section-title">{section.label || 'Profil'}</h3>
                    <p className="about-text">{summary}</p>
                  </section>
                );
              case 'experience':
                return experience && experience.length > 0 && (
                  <section key="experience" className="section">
                    <h3 className="section-title">{section.label || 'Expérience'}</h3>
                    {experience.map((exp, idx) => (
                      <div key={idx} className="experience-item">
                        <div className="exp-header">
                          <h4 className="exp-title">{exp.position || (exp as any).role}</h4>
                          <span className="exp-date">{exp.dates || `${exp.start || ''} - ${exp.end || 'Présent'}`}</span>
                        </div>
                        <div className="exp-company">{exp.company}</div>
                        {(exp.tasks || exp.bullets) && (
                          <ul className="exp-tasks">
                            {(exp.tasks || exp.bullets || []).map((task, tIdx) => (
                              <li key={tIdx}>{task}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </section>
                );
              case 'education':
                return education && education.length > 0 && (
                  <section key="education" className="section">
                    <h3 className="section-title">{section.label || 'Formation'}</h3>
                    {education.map((edu, idx) => (
                      <div key={idx} className="edu-item">
                        <div className="edu-degree">{edu.degree}</div>
                        <div className="edu-school">{edu.institution || edu.school}</div>
                        <span className="edu-year">
                          {edu.start || edu.end ? `${edu.start || ''} - ${edu.end || ''}` : (edu.dates || edu.year)}
                        </span>
                      </div>
                    ))}
                  </section>
                );
              case 'projects':
                return projects && projects.length > 0 && (
                  <section key="projects" className="section">
                    <h3 className="section-title">{section.label || 'Projets'}</h3>
                    {projects.map((project, idx) => (
                      <div key={idx} className="experience-item">
                        <div className="exp-header">
                          <h4 className="exp-title">{project.name}</h4>
                        </div>
                        {project.link && <div className="exp-company">{project.link}</div>}
                        <div className="about-text" style={{ fontSize: '0.95em', marginTop: '5px' }}>{project.description}</div>
                      </div>
                    ))}
                  </section>
                );
              default:
                if (section.type.startsWith('custom_')) {
                  const customId = section.type.replace('custom_', '');
                  const custom = custom_sections?.find(c => c.id === customId);
                  if (custom) {
                    return (
                      <section key={section.type} className="section">
                        <h3 className="section-title">{custom.title}</h3>
                        <div className="about-text">
                          {custom.type === 'list' ? (
                            <ul className="exp-tasks">
                              {custom.content.split('\n').filter(line => line.trim()).map((item, iIdx) => (
                                <li key={iIdx}>{item}</li>
                              ))}
                            </ul>
                          ) : (
                            <div dangerouslySetInnerHTML={{ __html: custom.content.replace(/\n/g, '<br>') }} />
                          )}
                        </div>
                      </section>
                    );
                  }
                }
                return null;
            }
          })}
        </main>
      </div>

      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
    </div>
  );
};

export default React.memo(ModerneTemplate);
