
import React from 'react';
import { TemplateProps } from '@/types/cv';
import { TemplateStyles, RemoteStyles } from '../BaseComponents';

const CreatifTemplate: React.FC<TemplateProps> = ({ data, config, apiBaseUrl }) => {
  const { profile, summary, experience, education, skills, languages, projects, custom_sections } = data;
  
  const isSectionEnabled = (type: string) => {
    return config.sections.find(s => s.type === type)?.enabled !== false;
  };

  const getSectionLabel = (type: string, fallback: string) => {
    return config.sections.find(s => s.type === type)?.label || fallback;
  };

  const sectionsInColumn = (column: 'left' | 'right' | 'full') => {
    return config.sections.filter(s => s.enabled && (s.column === column || (!s.column && column !== 'left')));
  };

  return (
    <div className="cv-rendering-root cv-container creatif-template">
      <RemoteStyles templateName={config.templateName} apiBaseUrl={apiBaseUrl} />
      <TemplateStyles config={config} />
      
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="profile-section">
          {isSectionEnabled('photo') && (
            profile.photo ? (
              <div className="profile-image">
                <img src={profile.photo} alt={profile.name || 'Photo'} />
              </div>
            ) : (
              <div className="photo-placeholder">
                <i className="fas fa-user"></i>
              </div>
            )
          )}
          <h1 className="name">{profile.name || 'Nom Prénom'}</h1>
          {(profile.position || profile.title) && (
            <p className="tagline">{profile.position || profile.title}</p>
          )}
        </div>

        {config.sections.filter(s => s.enabled && s.column === 'left').map((section) => {
          switch (section.type) {
            case 'contact':
              return (
                <div key="contact" className="sidebar-info">
                  <h3 className="sidebar-title">{section.label || 'Contact'}</h3>
                  <div className="contact-list">
                    {profile.phone && <div className="contact-item"><i className="fas fa-phone"></i><span>{profile.phone}</span></div>}
                    {profile.email && <div className="contact-item"><i className="fas fa-envelope"></i><span>{profile.email}</span></div>}
                    {profile.location && <div className="contact-item"><i className="fas fa-map-marker-alt"></i><span>{profile.location}</span></div>}
                  </div>
                </div>
              );
            case 'skills':
              return skills?.groups && (
                <div key="skills" className="sidebar-info">
                  <h3 className="sidebar-title">{section.label || 'Compétences'}</h3>
                  <div className="skills-wrap">
                    {skills.groups.flatMap(g => g.items || []).map((skill, sIdx) => (
                      <span key={sIdx} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              );
            case 'languages':
              return languages && languages.length > 0 && (
                <div key="languages" className="sidebar-info">
                  <h3 className="sidebar-title">{section.label || 'Langues'}</h3>
                  <div className="languages-list">
                    {languages.map((lang, lIdx) => (
                      <div key={lIdx} className="language-item">
                        <span className="language-name">{lang.name}</span>
                        <span className="language-level">{lang.level}</span>
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
                    <div key={section.type} className="sidebar-info">
                      <h3 className="sidebar-title">{custom.title}</h3>
                      <div className="summary-text" style={{ fontSize: '0.9em', opacity: 0.9 }}>
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
      <main className="main-content">
        {config.sections.filter(s => s.enabled && s.column !== 'left').map((section) => {
          switch (section.type) {
            case 'summary':
              return summary && (
                <section key="summary" className="section">
                  <h2 className="section-title">{section.label || 'Profil'}</h2>
                  <div className="summary-text"><p>{summary}</p></div>
                </section>
              );
            case 'experience':
              return experience && experience.length > 0 && (
                <section key="experience" className="section">
                  <h2 className="section-title">{section.label || 'Expérience'}</h2>
                  {experience.map((exp, idx) => (
                    <div key={idx} className="experience-item">
                      <div className="item-header">
                        <div>
                          <div className="item-title">{exp.position || (exp as any).role}</div>
                          <div className="item-company">{exp.company}</div>
                        </div>
                        <div className="item-date">{exp.dates || `${exp.start || ''} – ${exp.end || 'Présent'}`}</div>
                      </div>
                      {(exp.tasks || exp.bullets) && (
                        <div className="item-description">
                          <ul className="exp-tasks">
                            {(exp.tasks || exp.bullets || []).map((task, tIdx) => <li key={tIdx}>{task}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </section>
              );
            case 'education':
              return education && education.length > 0 && (
                <section key="education" className="section">
                  <h2 className="section-title">{section.label || 'Formation'}</h2>
                  {education.map((edu, idx) => (
                    <div key={idx} className="education-item">
                      <div className="item-header">
                        <div>
                          <div className="item-title">{edu.degree}</div>
                          <div className="item-school">{edu.institution || edu.school}</div>
                        </div>
                        <div className="item-date">
                          {edu.start || edu.end ? `${edu.start || ''} - ${edu.end || ''}` : (edu.dates || edu.year)}
                        </div>
                      </div>
                    </div>
                  ))}
                </section>
              );
            case 'projects':
              return projects && projects.length > 0 && (
                <section key="projects" className="section">
                  <h2 className="section-title">{section.label || 'Projets'}</h2>
                  {projects.map((project, idx) => (
                    <div key={idx} className="experience-item">
                      <div className="item-header">
                        <div>
                          <div className="item-title">{project.name}</div>
                          {project.link && <div className="item-company">{project.link}</div>}
                        </div>
                      </div>
                      <div className="item-description"><p>{project.description}</p></div>
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
                      <h2 className="section-title">{custom.title}</h2>
                      <div className="summary-text">
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
  );
};

export default React.memo(CreatifTemplate);
