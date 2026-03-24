
import React from 'react';
import { TemplateProps } from '@/types/cv';
import { TemplateStyles, RemoteStyles } from '../BaseComponents';

const DakarTemplate: React.FC<TemplateProps> = ({ data, config, apiBaseUrl }) => {
  const { profile, summary, experience, education, skills, languages, projects, custom_sections } = data;
  
  const isSectionEnabled = (type: string) => {
    return config.sections.find(s => s.type === type)?.enabled !== false;
  };

  const getSectionLabel = (type: string, fallback: string) => {
    return config.sections.find(s => s.type === type)?.label || fallback;
  };

  return (
    <div className="cv-rendering-root cv-container dakar-template">
      <RemoteStyles templateName={config.templateName} apiBaseUrl={apiBaseUrl} />
      <TemplateStyles config={config} />
      
      {/* Bandeau en-tête */}
      <div className="header-band">
        <div className="header-text">
          <div className="header-name">{profile.name || 'Prénom Nom'}</div>
          {(profile.position || profile.title) && (
            <div className="header-title">{profile.position || profile.title}</div>
          )}
        </div>
      </div>

      <div className="main-layout">
        {/* Colonne gauche */}
        <div className="left-column">
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
              case 'identity':
                return (profile.age || profile.nationality || (profile as any).marital_status) && (
                  <div key="identity" className="sidebar-section">
                    <h3 className="sidebar-title">{section.label || 'Identité'}</h3>
                    <div className="identity-list">
                      {profile.age && <div className="identity-item"><span className="identity-label">Âge</span><span className="identity-value">{profile.age}</span></div>}
                      {profile.nationality && <div className="identity-item"><span className="identity-label">Nationalité</span><span className="identity-value">{profile.nationality}</span></div>}
                      {(profile as any).marital_status && <div className="identity-item"><span className="identity-label">Situation</span><span className="identity-value">{(profile as any).marital_status}</span></div>}
                    </div>
                  </div>
                );
              case 'contact':
                return (
                  <div key="contact" className="sidebar-section">
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
                  <div key="skills" className="sidebar-section">
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
                  <div key="languages" className="sidebar-section">
                    <h3 className="sidebar-title">{section.label || 'Langues'}</h3>
                    <div className="languages-list">
                      {languages.map((lang, lIdx) => (
                        <div key={lIdx} className="language-item">
                          <div className="lang-name">{lang.name}</div>
                          <div className="lang-level">{lang.level}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              case 'interests':
                return data.interests && data.interests.length > 0 && (
                  <div key="interests" className="sidebar-section">
                    <h3 className="sidebar-title">{section.label || 'Loisirs'}</h3>
                    <div className="skills-wrap">
                      {data.interests.map((interest, iIdx) => (
                        <span key={iIdx} className="skill-tag">{interest}</span>
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
        </div>

        {/* Colonne droite */}
        <div className="right-column">
          {config.sections.filter(s => s.enabled && s.column !== 'left').map((section) => {
            switch (section.type) {
              case 'summary':
                return summary && (
                  <div key="summary" className="content-section">
                    <h3 className="section-title"><i className="fas fa-user"></i> {section.label || 'Profil'}</h3>
                    <p className="profile-text">{summary}</p>
                  </div>
                );
              case 'experience':
                return experience && experience.length > 0 && (
                  <div key="experience" className="content-section">
                    <h3 className="section-title"><i className="fas fa-briefcase"></i> {section.label || 'Expérience'}</h3>
                    {experience.map((exp, idx) => (
                      <div key={idx} className="experience-item">
                        <div className="exp-dot"></div>
                        <div className="exp-title">{exp.position || (exp as any).role}</div>
                        <div className="exp-company">{exp.company}</div>
                        <span className="exp-dates">{exp.dates || `${exp.start || ''} – ${exp.end || 'Présent'}`}</span>
                        {(exp.tasks || exp.bullets) && (
                          <ul className="exp-tasks">
                            {(exp.tasks || exp.bullets || []).map((task, tIdx) => <li key={tIdx}>{task}</li>)}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                );
              case 'education':
                return education && education.length > 0 && (
                  <div key="education" className="content-section">
                    <h3 className="section-title"><i className="fas fa-graduation-cap"></i> {section.label || 'Formation'}</h3>
                    {education.map((edu, idx) => (
                      <div key={idx} className="education-item">
                        <div className="edu-degree">{edu.degree}</div>
                        <div className="edu-school">{edu.institution || edu.school}</div>
                        <span className="edu-dates">
                          {edu.start || edu.end ? `${edu.start || ''} - ${edu.end || ''}` : (edu.dates || edu.year)}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              case 'projects':
                return projects && projects.length > 0 && (
                  <div key="projects" className="content-section">
                    <h3 className="section-title"><i className="fas fa-lightbulb"></i> {section.label || 'Projets'}</h3>
                    {projects.map((project, idx) => (
                      <div key={idx} className="experience-item">
                        <div className="exp-dot"></div>
                        <div className="exp-title">{project.name}</div>
                        {project.link && <div className="exp-company" style={{ fontSize: '0.9em', opacity: 0.8 }}>{project.link}</div>}
                        <p className="profile-text" style={{ fontSize: '0.95em', color: 'inherit', padding: 0, marginTop: '5px' }}>{project.description}</p>
                      </div>
                    ))}
                  </div>
                );
              case 'references':
                return (data as any).references && (data as any).references.length > 0 && (
                  <div key="references" className="content-section">
                    <h3 className="section-title"><i className="fas fa-certificate"></i> {section.label || 'Références'}</h3>
                    <div className="experience-item" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', border: 'none', paddingLeft: 0 }}>
                      {(data as any).references.map((ref: any, idx: number) => (
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
                  </div>
                );
              default:
                if (section.type.startsWith('custom_')) {
                  const customId = section.type.replace('custom_', '');
                  const custom = custom_sections?.find(c => c.id === customId);
                  if (custom) {
                    return (
                      <div key={section.type} className="content-section">
                        <h3 className="section-title"><i className="fas fa-plus-circle"></i> {custom.title}</h3>
                        <div className="profile-text">
                          {custom.type === 'list' ? (
                            <ul className="exp-tasks">
                              {custom.content.split('\n').filter(line => line.trim()).map((item, iIdx) => <li key={iIdx}>{item}</li>)}
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
        </div>
      </div>
    </div>
  );
};

export default React.memo(DakarTemplate);
