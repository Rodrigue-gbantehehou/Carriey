import React from 'react';
import { TemplateProps } from '@/types/cv';
import { TemplateStyles, CVSection, ItemGroup, RemoteStyles, CustomSectionContent } from '../BaseComponents';
import { getSafeData, isSectionEnabled, getSectionLabel, getLeftColumnSections, getRightColumnSections } from '../utils';

const ModerneTemplate: React.FC<TemplateProps> = ({ data: rawData, config, apiBaseUrl }) => {
  const data = getSafeData(rawData);
  const { profile, summary, experience, education, certifications, skills, languages, projects, custom_sections } = data;

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
            {profile.website && (
              <div className="contact-item">
                <span>{profile.website}</span>
                <i className="fas fa-globe"></i>
              </div>
            )}
            {profile.linkedin_url && (
              <div className="contact-item">
                <span>{profile.linkedin_url.replace(/^https?:\/+(www\.)?/, '')}</span>
                <i className="fab fa-linkedin"></i>
              </div>
            )}
            {profile.github_url && (
              <div className="contact-item">
                <span>{profile.github_url.replace(/^https?:\/+(www\.)?/, '')}</span>
                <i className="fab fa-github"></i>
              </div>
            )}
          </div>
        )}
      </header>

      <div className="main-content" data-pf-parallel="true" style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside className="left-column" data-pf-splittable="true" style={{ width: '35%', flexShrink: 0 }}>
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

          {getLeftColumnSections(config).map((section: any) => {
            switch (section.type) {
              case 'skills':
                return skills?.groups && skills.groups.length > 0 && (
                  <div key="skills" className="sidebar-section">
                    <h3 className="sidebar-title">{getSectionLabel(config, 'skills', 'Expertise')}</h3>
                    {skills.groups.map((group: any, gIdx: number) => (
                      <div key={gIdx} className="skill-category">
                        {group.label && <h4>{group.label}</h4>}
                        <div className="skill-items">
                          {(group.items || []).map((skill: any, sIdx: number) => (
                            <div key={sIdx} className="skill-item">{typeof skill === 'string' ? skill : skill.name || ''}</div>
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
                return (profile.age || profile.nationality || (profile as any).marital_status) && (
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
                    {(profile as any).marital_status && (
                      <div className="lang-item">
                        <span className="lang-name">Statut</span>
                        <span className="lang-level">{(profile as any).marital_status}</span>
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
                      <CVSection key={section ? section.type : 'custom'} title={custom.title} icon={custom.icon || "fas fa-star"}>
                        <div className="profile-text">
                          <CustomSectionContent custom={custom} />
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
        <main className="right-column" data-pf-splittable="true">
          {getRightColumnSections(config).map((section: any) => {
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
                      
                      location={exp.location}
                      description={exp.description}
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
                        location={edu.location}
                        description={edu.description}
                        className="edu-item"
                      />
                    ))}
                  </CVSection>
                );
              case 'certifications':
                return certifications && certifications.length > 0 && (
                  <CVSection key="certifications" title={getSectionLabel(config, 'certifications', 'Certifications')} className="section">
                    {certifications.map((cert: any, idx: number) => (
                      <ItemGroup 
                        key={idx} 
                        title={cert.name} 
                        subtitle={cert.issuer} 
                        date={cert.date}
                        url={cert.url}
                        className="edu-item"
                      />
                    ))}
                  </CVSection>
                );
                          case 'references':
              return data.references && data.references.length > 0 && (
                <CVSection key="references" title={getSectionLabel(config, 'references', 'Références')} className="content-section section">
                  {data.references.map((ref: any, idx: number) => (
                    <ItemGroup 
                      key={idx} 
                      title={ref.name} 
                      subtitle={ref.company || ref.title} 
                      className="experience-item"
                    >
                      <div className="profile-text" style={{ marginTop: '5px' }}>
                        {ref.email && <div><i className="fas fa-envelope" style={{marginRight: '5px'}}></i>{ref.email}</div>}
                        {ref.phone && <div><i className="fas fa-phone" style={{marginRight: '5px'}}></i>{ref.phone}</div>}
                      </div>
                    </ItemGroup>
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
                        date={project.dates}
                        url={project.link} 
                        description={project.description}
                        className="experience-item"
                      />
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
                          <CustomSectionContent custom={custom} />
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
