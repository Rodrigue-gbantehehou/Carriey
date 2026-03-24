
import React from 'react';
import { TemplateProps } from '@/types/cv';
import { TemplateStyles, RemoteStyles } from '../BaseComponents';

const ProfessionalTemplate: React.FC<TemplateProps> = ({ data, config, apiBaseUrl }) => {
  const { profile, summary, experience, education, skills, languages, projects, custom_sections } = data;
  
  const isSectionEnabled = (type: string) => {
    return config.sections.find(s => s.type === type)?.enabled !== false;
  };

  return (
    <div className="cv-rendering-root cv-container professional-template">
      <RemoteStyles templateName={config.templateName} apiBaseUrl={apiBaseUrl} />
      <TemplateStyles config={config} />
      
      {/* Executive Header */}
      <header className="header">
        <h1 className="name">{profile.name || 'Nom Prénom'}</h1>
        {(profile.position || profile.title) && (
          <p className="profession">{profile.position || profile.title}</p>
        )}
      </header>

      <div className="main-layout" style={{ display: 'flex', flex: 1, width: '100%' }}>
        {/* Sidebar */}
        <aside className="left-column" style={{ width: '32%', flexShrink: 0 }}>
          {isSectionEnabled('photo') && (
            <div className="profile-photo-wrap">
              {profile.photo ? (
                <div className="profile-photo">
                  <img src={profile.photo} alt={profile.name || 'Photo'} />
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
                  <div key="contact" className="sidebar-section">
                    <h3 className="sidebar-title">{section.label || 'Coordonnées'}</h3>
                    <div className="contact-list">
                      {profile.phone && <div className="contact-item"><i className="fas fa-phone"></i><span>{profile.phone}</span></div>}
                      {profile.email && <div className="contact-item"><i className="fas fa-envelope"></i><span>{profile.email}</span></div>}
                      {profile.location && <div className="contact-item"><i className="fas fa-map-marker-alt"></i><span>{profile.location}</span></div>}
                    </div>
                  </div>
                );
              case 'identity':
                return (profile.age || profile.nationality || (profile as any).marital_status) && (
                  <div key="identity" className="sidebar-section">
                    <h3 className="sidebar-title">{section.label || 'État Civil'}</h3>
                    <div className="contact-list">
                      {profile.age && <div className="contact-item"><i className="fas fa-calendar-check"></i><span>{profile.age}</span></div>}
                      {profile.nationality && <div className="contact-item"><i className="fas fa-flag"></i><span>{profile.nationality}</span></div>}
                      {(profile as any).marital_status && <div className="contact-item"><i className="fas fa-users"></i><span>{(profile as any).marital_status}</span></div>}
                    </div>
                  </div>
                );
              case 'skills':
                return skills?.groups && (
                  <div key="skills" className="sidebar-section">
                    <h3 className="sidebar-title">{section.label || 'Expertise'}</h3>
                    <div className="skills-list">
                      {skills.groups.flatMap(g => g.items || []).map((skill, sIdx) => (
                        <div key={sIdx} className="skill-group">
                          <div className="skill-item">{skill}</div>
                          <div className="skill-bar-bg"><div className="skill-bar-fill" style={{ width: '85%' }}></div></div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              case 'languages':
                return languages && languages.length > 0 && (
                  <div key="languages" className="sidebar-section">
                    <h3 className="sidebar-title">{section.label || 'Langues'}</h3>
                    <div className="contact-list">
                      {languages.map((lang, lIdx) => (
                        <div key={lIdx} className="contact-item">
                          <i className="fas fa-globe"></i>
                          <span><strong>{lang.name}</strong> – {lang.level}</span>
                        </div>
                      ))}
                    </div>
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
                        <div style={{ fontSize: '0.9em', lineHeight: 1.4, opacity: 0.9 }}>
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
        <main className="right-column" style={{ flex: 1 }}>
          {config.sections.filter(s => s.enabled && s.column !== 'left').map((section) => {
            switch (section.type) {
              case 'summary':
                return summary && (
                  <section key="summary" className="content-section">
                    <h3 className="section-title">{section.label || 'Parcours Professionnel'}</h3>
                    <p className="about-text">{summary}</p>
                  </section>
                );
              case 'experience':
                return experience && experience.length > 0 && (
                  <section key="experience" className="content-section">
                    <h3 className="section-title">{section.label || 'Expérience'}</h3>
                    {experience.map((exp, idx) => (
                      <div key={idx} className="experience-item">
                        <div className="exp-header">
                          <h4 className="exp-title">{exp.position || (exp as any).role}</h4>
                          <span className="exp-dates">{exp.dates || `${exp.start || ''} - ${exp.end || ''}`}</span>
                        </div>
                        <div className="exp-company">{exp.company}</div>
                        {(exp.tasks || exp.bullets) && (
                          <ul className="exp-tasks">
                            {(exp.tasks || exp.bullets || []).map((task, tIdx) => <li key={tIdx}>{task}</li>)}
                          </ul>
                        )}
                      </div>
                    ))}
                  </section>
                );
              case 'education':
                return education && education.length > 0 && (
                  <section key="education" className="content-section">
                    <h3 className="section-title">{section.label || 'Formation'}</h3>
                    {education.map((edu, idx) => (
                      <div key={idx} className="education-item">
                        <div className="edu-degree">{edu.degree}</div>
                        <div className="edu-school">{edu.institution || edu.school}</div>
                        <span className="edu-dates">
                          {edu.start || edu.end ? `${edu.start || ''} - ${edu.end || ''}` : (edu.dates || edu.year)}
                        </span>
                      </div>
                    ))}
                  </section>
                );
              case 'projects':
                return projects && projects.length > 0 && (
                  <section key="projects" className="content-section">
                    <h3 className="section-title">{section.label || 'Projets'}</h3>
                    {projects.map((project, idx) => (
                      <div key={idx} className="experience-item">
                        <div className="exp-header"><h4 className="exp-title">{project.name}</h4></div>
                        {project.link && <div className="exp-company">{project.link}</div>}
                        <p className="about-text" style={{ fontSize: '0.95em', marginTop: '5px' }}>{project.description}</p>
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
                      <section key={section.type} className="content-section">
                        <h3 className="section-title">{custom.title}</h3>
                        <div className="about-text">
                          {custom.type === 'list' ? (
                            <ul className="exp-tasks">
                              {custom.content.split('\n').filter(line => line.trim()).map((item, iIdx) => <li key={iIdx}>{item}</li>)}
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

export default React.memo(ProfessionalTemplate);
