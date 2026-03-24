
import React from 'react';
import { TemplateProps } from '@/types/cv';
import { TemplateStyles, RemoteStyles } from '../BaseComponents';

const TokyoTemplate: React.FC<TemplateProps> = ({ data, config, apiBaseUrl }) => {
  const { profile, summary, experience, education, skills, languages, projects, custom_sections } = data;
  
  const isSectionEnabled = (type: string) => {
    return config.sections.find(s => s.type === type)?.enabled !== false;
  };

  return (
    <div className="cv-rendering-root cv-container tokyo-template">
      <RemoteStyles templateName={config.templateName} apiBaseUrl={apiBaseUrl} />
      <TemplateStyles config={config} />
      
      <div className="left-column" style={{ width: '32%', flexShrink: 0 }}>
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

        {/* Dynamic Sidebar Sections */}
        {config.sections.filter(s => s.enabled && s.column === 'left').map((section) => {
          switch (section.type) {
            case 'contact':
              return (
                <section key="contact" className="sidebar-section">
                  <h3 className="sidebar-title">{section.label || 'Contact'}</h3>
                  <div className="contact-list">
                    {profile.location && <div className="contact-item"><i className="fas fa-map-marker-alt"></i><span>{profile.location}</span></div>}
                    {profile.phone && <div className="contact-item"><i className="fas fa-phone"></i><span>{profile.phone}</span></div>}
                    {profile.email && <div className="contact-item"><i className="fas fa-envelope"></i><span>{profile.email}</span></div>}
                  </div>
                </section>
              );
            case 'skills':
              return skills?.groups && (
                <section key="skills" className="sidebar-section">
                  <h3 className="sidebar-title">{section.label || 'Compétences'}</h3>
                  <div className="skills-list">
                    {skills.groups.flatMap(g => g.items || []).map((skill, sIdx) => (
                      <div key={sIdx} className="skill-item">
                        <span className="skill-name">{skill}</span>
                        <div className="skill-bar-bg"><div className="skill-bar-fill" style={{ width: '85%' }}></div></div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            case 'languages':
              return languages && languages.length > 0 && (
                <section key="languages" className="sidebar-section">
                  <h3 className="sidebar-title">{section.label || 'Langues'}</h3>
                  <div className="languages-list">
                    {languages.map((lang, lIdx) => (
                      <div key={lIdx} className="language-item">
                        <span className="lang-name">{lang.name}</span>
                        <span className="lang-level">{lang.level}</span>
                      </div>
                    ))}
                  </div>
                </section>
              );
            case 'identity':
              return (profile.age || profile.nationality) && (
                <section key="identity" className="sidebar-section">
                  <h3 className="sidebar-title">{section.label || 'Identité'}</h3>
                  <div className="languages-list">
                    {profile.age && <div className="language-item"><span className="lang-name">Âge</span><span className="lang-level">{profile.age}</span></div>}
                    {profile.nationality && <div className="language-item"><span className="lang-name">Nationalité</span><span className="lang-level">{profile.nationality}</span></div>}
                  </div>
                </section>
              );
            case 'interests':
              return data.interests && data.interests.length > 0 && (
                <section key="interests" className="sidebar-section">
                  <h3 className="sidebar-title">{section.label || 'Loisirs'}</h3>
                  <div className="skills-list" style={{ gap: '8px' }}>
                    {data.interests.map((interest, iIdx) => (
                      <div key={iIdx} className="skill-name" style={{ fontSize: '0.86em', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px' }}>
                        {interest}
                      </div>
                    ))}
                  </div>
                </section>
              );
            default:
              if (section.type.startsWith('custom_')) {
                const customId = section.type.replace('custom_', '');
                const custom = custom_sections?.find(c => c.id === customId);
                if (custom) {
                  return (
                    <section key={section.type} className="sidebar-section">
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
                    </section>
                  );
                }
              }
              return null;
          }
        })}
      </div>

      <div className="right-column" style={{ flex: 1 }}>
        <header className="header">
          <h1 className="name">{profile.name || 'Prénom Nom'}</h1>
          {(profile.position || profile.title) && (
            <p className="profession">{profile.position || profile.title}</p>
          )}
        </header>

        {config.sections.filter(s => s.enabled && s.column !== 'left').map((section) => {
          switch (section.type) {
            case 'summary':
              return summary && (
                <section key="summary" className="summary-section">
                  <h3 className="section-title">{section.label || 'Profil'}</h3>
                  <p className="profile-text">{summary}</p>
                </section>
              );
            case 'experience':
              return experience && experience.length > 0 && (
                <section key="experience" className="content-section">
                  <h3 className="section-title">{section.label || 'Expériences'}</h3>
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
                      <h4 className="edu-degree">{edu.degree}</h4>
                      <div className="edu-meta">
                        <span className="edu-school">{edu.institution || edu.school}</span>
                        <span className="edu-dates">
                          {edu.start || edu.end ? `${edu.start || ''} - ${edu.end || ''}` : (edu.dates || edu.year)}
                        </span>
                      </div>
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
                      <p className="profile-text" style={{ marginTop: '5px' }}>{project.description}</p>
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
                      <div className="profile-text">
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
      </div>
    </div>
  );
};

export default React.memo(TokyoTemplate);
