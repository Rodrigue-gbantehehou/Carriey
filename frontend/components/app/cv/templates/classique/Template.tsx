import React from 'react';
import { TemplateProps } from '@/types/cv';
import { TemplateStyles, CVSection, ItemGroup, SkillTag, RemoteStyles, CustomSectionContent } from '../BaseComponents';
import { getSafeData, isSectionEnabled, getSectionLabel } from '../utils';

const ClassiqueTemplate: React.FC<TemplateProps> = ({ data: rawData, config, apiBaseUrl }) => {
  const data = getSafeData(rawData);
  const { profile, summary, experience, education, certifications, skills, languages, projects, custom_sections } = data;
  
  return (
    <div className="cv-rendering-root cv-container classique-template">
      <RemoteStyles templateName={config.templateName} apiBaseUrl={apiBaseUrl} />
      <TemplateStyles config={config} />
      
      {/* Header */}
      <header className="header">
        <h1 className="name">{profile.name}</h1>
        {profile.title && (
          <p className="profession">{profile.title}</p>
        )}
        
        <div className="meta-info">
          {isSectionEnabled(config, 'contact') && (
            <>
              {profile.phone && (
                <div className="meta-item">
                  <i className="fas fa-phone"></i>
                  <span>{profile.phone}</span>
                </div>
              )}
              {profile.email && (
                <div className="meta-item">
                  <i className="fas fa-envelope"></i>
                  <span>{profile.email}</span>
                </div>
              )}
              {profile.location && (
                <div className="meta-item">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.website && (
                <div className="meta-item">
                  <i className="fas fa-globe"></i>
                  <span>{profile.website}</span>
                </div>
              )}
              {profile.linkedin_url && (
                <div className="meta-item">
                  <i className="fab fa-linkedin"></i>
                  <span>{profile.linkedin_url.replace(/^https?:\/+(www\.)?/, '')}</span>
                </div>
              )}
              {profile.github_url && (
                <div className="meta-item">
                  <i className="fab fa-github"></i>
                  <span>{profile.github_url.replace(/^https?:\/+(www\.)?/, '')}</span>
                </div>
              )}
            </>
          )}

          {isSectionEnabled(config, 'identity') && (
            <>
              {profile.age && (
                <div className="meta-item">
                  <span className="meta-label">Âge:</span>
                  <span>{profile.age}</span>
                </div>
              )}
              {profile.nationality && (
                <div className="meta-item">
                  <span className="meta-label">Nationalité:</span>
                  <span>{profile.nationality}</span>
                </div>
              )}
              {(profile as any).marital_status && (
                <div className="meta-item">
                  <span className="meta-label">Situation:</span>
                  <span>{(profile as any).marital_status}</span>
                </div>
              )}
            </>
          )}
        </div>
      </header>

      {/* Sections rendering based on config order */}
      {config.sections.filter(s => s.enabled).map((section) => {
        switch (section.type) {
          case 'summary':
            return summary ? (
              <CVSection key="summary">
                <div className="about-text">{summary}</div>
              </CVSection>
            ) : null;

          case 'experience':
            return experience && experience.length > 0 ? (
              <CVSection key="experience" title={getSectionLabel(config, 'experience', 'Expérience Professionnelle')}>
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
                      <ul className="item-tasks">
                        {exp.tasks.map((task: string, tIdx: number) => (
                          <li key={tIdx}>{task}</li>
                        ))}
                      </ul>
                    )}
                  </ItemGroup>
                ))}
              </CVSection>
            ) : null;

          case 'education':
            return education && education.length > 0 ? (
              <CVSection key="education" title={getSectionLabel(config, 'education', 'Formation')}>
                {education.map((edu: any, idx: number) => (
                  <ItemGroup 
                    key={idx}
                    title={edu.degree}
                    subtitle={edu.institution}
                    date={edu.dates}
                    location={edu.location}
                    description={edu.description}
                  />
                ))}
              </CVSection>
            ) : null;

          case 'certifications':
            return certifications && certifications.length > 0 ? (
              <CVSection key="certifications" title={getSectionLabel(config, 'certifications', 'Certifications')}>
                {certifications.map((cert: any, idx: number) => (
                  <ItemGroup 
                    key={idx}
                    title={cert.name}
                    subtitle={cert.issuer}
                    date={cert.date}
                    url={cert.url}
                  />
                ))}
              </CVSection>
            ) : null;

          case 'skills':
            return skills?.groups && skills.groups.length > 0 ? (
              <CVSection key="skills" title={getSectionLabel(config, 'skills', 'Compétences')}>
                {skills.groups.map((group: any, gIdx: number) => (
                  <div key={gIdx} className="skill-set">
                    {group.label && <h4>{group.label}</h4>}
                    <div className="skill-list">
                      {(group.items || []).map((skill: any, sIdx: number) => (
                        <SkillTag key={sIdx}>{typeof skill === 'object' ? skill.name : skill}</SkillTag>
                      ))}
                    </div>
                  </div>
                ))}
              </CVSection>
            ) : null;

          case 'languages':
            return languages && languages.length > 0 ? (
              <CVSection key="languages" title={getSectionLabel(config, 'languages', 'Langues')}>
                <div className="skill-list">
                  {languages.map((lang: any, lIdx: number) => (
                    <div key={lIdx} className="skill-tag-item">
                      <strong>{lang.name}</strong> – {lang.level}
                    </div>
                  ))}
                </div>
              </CVSection>
            ) : null;

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
            return projects && projects.length > 0 ? (
              <CVSection key="projects" title={getSectionLabel(config, 'projects', 'Projets')}>
                {projects.map((project: any, pIdx: number) => (
                  <ItemGroup 
                    key={pIdx}
                    title={project.name}
                    date={project.dates}
                    url={project.link}
                    description={project.description}
                  />
                ))}
              </CVSection>
            ) : null;

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
    </div>
  );
};

export default React.memo(ClassiqueTemplate);
