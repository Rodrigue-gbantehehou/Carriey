
import React from 'react';
import { TemplateProps } from '@/types/cv';
import { TemplateStyles, RemoteStyles } from '../BaseComponents';

const RodrigueTemplate: React.FC<TemplateProps> = ({ data, config, apiBaseUrl }) => {
  const { profile, summary, experience, education, skills, languages, projects, custom_sections } = data;
  
  const isSectionEnabled = (type: string) => {
    return config.sections.find(s => s.type === type)?.enabled !== false;
  };

  return (
    <div className="cv-rendering-root cv-container rodrigue-template">
      <RemoteStyles templateName={config.templateName} apiBaseUrl={apiBaseUrl} />
      <TemplateStyles config={config} />
      
      {/* Sidebar */}
      <aside className="left-column">
        {isSectionEnabled('photo') && (
          <div className="profile-photo-wrap">
            {profile.photo ? (
              <div className="profile-photo">
                <img src={profile.photo} alt={profile.name || 'Photo'} />
              </div>
            ) : (
              <div className="photo-placeholder"><i className="fas fa-magic"></i></div>
            )}
          </div>
        )}

        {config.sections.filter(s => s.enabled && s.column === 'left').map((section) => {
          switch (section.type) {
            case 'contact':
              return (
                <div key="contact" className="sidebar-section">
                  <h3 className="sidebar-title">{section.label || 'Connexion'}</h3>
                  <div className="contact-list">
                    {profile.phone && <div className="contact-item"><i className="fas fa-mobile-alt"></i><span>{profile.phone}</span></div>}
                    {profile.email && <div className="contact-item"><i className="fas fa-at"></i><span>{profile.email}</span></div>}
                    {profile.location && <div className="contact-item"><i className="fas fa-map-pin"></i><span>{profile.location}</span></div>}
                  </div>
                </div>
              );
            case 'identity':
              return (profile.age || profile.nationality || (profile as any).marital_status) && (
                <div key="identity" className="sidebar-section">
                  <h3 className="sidebar-title">{section.label || 'Perso'}</h3>
                  <div className="identity-list">
                    {profile.age && <div className="identity-item"><span className="identity-label">Âge</span><span>{profile.age}</span></div>}
                    {profile.nationality && <div className="identity-item"><span className="identity-label">Origine</span><span>{profile.nationality}</span></div>}
                    {(profile as any).marital_status && <div className="identity-item"><span className="identity-label">Statut</span><span>{(profile as any).marital_status}</span></div>}
                  </div>
                </div>
              );
            case 'skills':
              return skills?.groups && (
                <div key="skills" className="sidebar-section">
                  <h3 className="sidebar-title">{section.label || 'Vibes / Tech'}</h3>
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
                  {languages.map((lang, lIdx) => (
                    <div key={lIdx} className="identity-item">
                      <span className="identity-label">{lang.name}</span>
                      <span>{lang.level}</span>
                    </div>
                  ))}
                </div>
              );
            case 'interests':
              return data.interests && data.interests.length > 0 && (
                <div key="interests" className="sidebar-section">
                  <h3 className="sidebar-title">{section.label || 'Passions'}</h3>
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
      </aside>

      {/* Main Content */}
      <main className="right-column">
        <header className="header-meta">
          <h1 className="name">{profile.name || 'Nom Prénom'}</h1>
          {(profile.position || profile.title) && (
            <p className="profession">{profile.position || profile.title}</p>
          )}
        </header>

        {config.sections.filter(s => s.enabled && s.column !== 'left').map((section) => {
          switch (section.type) {
            case 'summary':
              return summary && (
                <section key="summary" className="content-section">
                  <h2 className="section-title">{section.label || 'En Bref'}</h2>
                  <p className="about-text">{summary}</p>
                </section>
              );
            case 'experience':
              return experience && experience.length > 0 && (
                <section key="experience" className="content-section">
                  <h2 className="section-title">{section.label || 'Expériences'}</h2>
                  {experience.map((exp, idx) => (
                    <div key={idx} className="experience-item">
                      <div className="exp-header">
                        <h4 className="exp-title">{exp.position || (exp as any).role || (exp as any).title}</h4>
                        <span className="exp-date">{exp.dates || (exp as any).period || `${exp.start || ''} - ${exp.end || ''}`}</span>
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
                  <h2 className="section-title">{section.label || 'Études'}</h2>
                  <div className="education-list">
                    {education.map((edu, idx) => (
                      <div key={idx} className="edu-item">
                        <div className="edu-year">
                          {edu.start || edu.end ? `${edu.start || ''} - ${edu.end || ''}` : (edu.dates || edu.year || (edu as any).period)}
                        </div>
                        <div className="edu-content">
                          <div className="edu-degree">{edu.degree}</div>
                          <span className="edu-school">{edu.institution || edu.school}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            case 'projects':
              return projects && projects.length > 0 && (
                <section key="projects" className="content-section">
                  <h2 className="section-title">{section.label || 'Projets'}</h2>
                  {projects.map((project, idx) => (
                    <div key={idx} className="experience-item">
                      <div className="exp-header"><h4 className="exp-title">{project.name}</h4></div>
                      {project.link && <div className="exp-company">{project.link}</div>}
                      <p className="about-text" style={{ marginTop: '5px' }}>{project.description}</p>
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
                      <h2 className="section-title">{custom.title}</h2>
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
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
    </div>
  );
};

export default React.memo(RodrigueTemplate);
