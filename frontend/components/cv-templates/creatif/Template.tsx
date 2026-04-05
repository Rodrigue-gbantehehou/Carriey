import React from 'react';
import { TemplateProps } from '@/types/cv';
import { TemplateStyles, RemoteStyles, CVSection, ItemGroup, SkillTag } from '../BaseComponents';
import { getSafeData, isSectionEnabled, getSectionLabel } from '../utils';

const CreatifTemplate: React.FC<TemplateProps> = ({ data: rawData, config, apiBaseUrl }) => {
  const data = getSafeData(rawData);
  const { profile, summary, experience, education, skills, languages, projects, custom_sections } = data;
  
  return (
    <div className="cv-rendering-root cv-container creatif-template">
      <RemoteStyles templateName={config.templateName} apiBaseUrl={apiBaseUrl} />
      <TemplateStyles config={config} />
      
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="profile-section">
          {isSectionEnabled(config, 'photo') && (
            profile.photo ? (
              <div className="profile-image">
                <img src={profile.photo} alt={profile.name} />
              </div>
            ) : (
              <div className="photo-placeholder">
                <i className="fas fa-user"></i>
              </div>
            )
          )}
          <h1 className="name">{profile.name}</h1>
          {profile.title && (
            <p className="tagline">{profile.title}</p>
          )}
        </div>

        {config.sections.filter(s => s.enabled && s.column === 'left').map((section) => {
          switch (section.type) {
            case 'contact':
              return (
                <div key="contact" className="sidebar-info">
                  <h3 className="sidebar-title">{getSectionLabel(config, 'contact', 'Contact')}</h3>
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
                  <h3 className="sidebar-title">{getSectionLabel(config, 'skills', 'Compétences')}</h3>
                  <div className="skills-wrap">
                    {skills.groups.flatMap((g: any) => g.items || []).map((skill: string, sIdx: number) => (
                      <SkillTag key={sIdx}>{skill}</SkillTag>
                    ))}
                  </div>
                </div>
              );
            case 'languages':
              return languages && languages.length > 0 && (
                <div key="languages" className="sidebar-info">
                  <h3 className="sidebar-title">{getSectionLabel(config, 'languages', 'Langues')}</h3>
                  <div className="languages-list">
                    {languages.map((lang: any, lIdx: number) => (
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
                const custom = custom_sections?.find((c: any) => c.id === customId);
                if (custom) {
                  return (
                    <div key={section.type} className="sidebar-info">
                      <h3 className="sidebar-title">{custom.title}</h3>
                      <div className="summary-text" style={{ fontSize: '0.9em', opacity: 0.9 }}>
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
      <main className="main-content">
        {config.sections.filter(s => s.enabled && s.column !== 'left').map((section) => {
          switch (section.type) {
            case 'summary':
              return summary && (
                <CVSection key="summary" title={getSectionLabel(config, 'summary', 'Profil')} className="section">
                  <div className="summary-text"><p>{summary}</p></div>
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
                        <div className="item-description">
                          <ul className="exp-tasks">
                            {exp.tasks.map((task: string, tIdx: number) => <li key={tIdx}>{task}</li>)}
                          </ul>
                        </div>
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
                      className="education-item"
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
                      <div className="item-description"><p>{project.description}</p></div>
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
                      <div className="summary-text">
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
  );
};

export default React.memo(CreatifTemplate);
