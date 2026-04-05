import React from 'react';
import { TemplateProps } from '@/types/cv';
import { TemplateStyles, RemoteStyles, CVSection, ItemGroup, SkillTag } from '../BaseComponents';
import { getSafeData, isSectionEnabled, getSectionLabel } from '../utils';

const RodrigueTemplate: React.FC<TemplateProps> = ({ data: rawData, config, apiBaseUrl }) => {
  const data = getSafeData(rawData);
  const { profile, summary, experience, education, skills, languages, projects, custom_sections } = data;
  
  return (
    <div className="cv-rendering-root cv-container rodrigue-template">
      <RemoteStyles templateName={config.templateName} apiBaseUrl={apiBaseUrl} />
      <TemplateStyles config={config} />
      
      {/* Sidebar */}
      <aside className="left-column">
        {isSectionEnabled(config, 'photo') && (
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
                <CVSection key="contact" title={getSectionLabel(config, 'contact', 'Connexion')} className="sidebar-section">
                  <div className="contact-list">
                    {profile.phone && <div className="contact-item"><i className="fas fa-mobile-alt"></i><span>{profile.phone}</span></div>}
                    {profile.email && <div className="contact-item"><i className="fas fa-at"></i><span>{profile.email}</span></div>}
                    {profile.location && <div className="contact-item"><i className="fas fa-map-pin"></i><span>{profile.location}</span></div>}
                  </div>
                </CVSection>
              );
            case 'identity':
              return (profile.age || profile.nationality || (profile as any).marital_status) && (
                <CVSection key="identity" title={getSectionLabel(config, 'identity', 'Perso')} className="sidebar-section">
                  <div className="identity-list">
                    {profile.age && <div className="identity-item"><span className="identity-label">Âge</span><span>{profile.age}</span></div>}
                    {profile.nationality && <div className="identity-item"><span className="identity-label">Origine</span><span>{profile.nationality}</span></div>}
                    {(profile as any).marital_status && <div className="identity-item"><span className="identity-label">Statut</span><span>{(profile as any).marital_status}</span></div>}
                  </div>
                </CVSection>
              );
            case 'skills':
              return skills?.groups && (
                <CVSection key="skills" title={getSectionLabel(config, 'skills', 'Vibes / Tech')} className="sidebar-section">
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
                  {languages.map((lang: any, lIdx: number) => (
                    <div key={lIdx} className="identity-item">
                      <span className="identity-label">{lang.name}</span>
                      <span>{lang.level}</span>
                    </div>
                  ))}
                </CVSection>
              );
            case 'interests':
              return data.interests && data.interests.length > 0 && (
                <CVSection key="interests" title={getSectionLabel(config, 'interests', 'Passions')} className="sidebar-section">
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
                <CVSection key="summary" title={getSectionLabel(config, 'summary', 'En Bref')} className="content-section">
                  <p className="about-text">{summary}</p>
                </CVSection>
              );
            case 'experience':
              return experience && experience.length > 0 && (
                <CVSection key="experience" title={getSectionLabel(config, 'experience', 'Expériences')} className="content-section">
                  {experience.map((exp: any, idx: number) => (
                    <ItemGroup 
                      key={idx} 
                      title={exp.position || exp.role || exp.title} 
                      subtitle={exp.company} 
                      date={exp.dates || exp.period || `${exp.start || ''} - ${exp.end || ''}`}
                      className="experience-item"
                    >
                      {(exp.tasks || exp.bullets) && (
                        <ul className="exp-tasks">
                          {(exp.tasks || exp.bullets || []).map((task: string, tIdx: number) => <li key={tIdx}>{task}</li>)}
                        </ul>
                      )}
                    </ItemGroup>
                  ))}
                </CVSection>
              );
            case 'education':
              return education && education.length > 0 && (
                <CVSection key="education" title={getSectionLabel(config, 'education', 'Études')} className="content-section">
                  <div className="education-list">
                    {education.map((edu: any, idx: number) => (
                      <div key={idx} className="edu-item">
                        <div className="edu-year">
                          {edu.start || edu.end ? `${edu.start || ''} - ${edu.end || ''}` : (edu.dates || edu.year || edu.period)}
                        </div>
                        <div className="edu-content">
                          <div className="edu-degree">{edu.degree}</div>
                          <span className="edu-school">{edu.institution || edu.school}</span>
                        </div>
                      </div>
                    ))}
                  </div>
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
                      <p className="about-text" style={{ marginTop: '5px' }}>{project.description}</p>
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
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
    </div>
  );
};

export default React.memo(RodrigueTemplate);
