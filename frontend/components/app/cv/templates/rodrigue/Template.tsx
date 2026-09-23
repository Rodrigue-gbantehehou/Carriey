import React from 'react';
import { TemplateProps } from '@/types/cv';
import { TemplateStyles, CVSection, ItemGroup, SkillTag, RemoteStyles, CustomSectionContent } from '../BaseComponents';
import { getSafeData, isSectionEnabled, getSectionLabel, getLeftColumnSections, getRightColumnSections } from '../utils';

const RodrigueTemplate: React.FC<TemplateProps> = ({ data: rawData, config, apiBaseUrl }) => {
  const data = getSafeData(rawData);
  const { profile, summary, experience, education, certifications, skills, languages, projects, custom_sections } = data;
  
  return (
    <div className="cv-rendering-root cv-container rodrigue-template">
      <RemoteStyles templateName={config.templateName} apiBaseUrl={apiBaseUrl} />
      <TemplateStyles config={config} />
      
      <div data-pf-parallel="true" style={{ display: 'flex', width: '100%', minHeight: '100%' }}>
      {/* Sidebar */}
      <aside className="left-column" data-pf-splittable="true">
        {isSectionEnabled(config, 'photo') && (
          <div className="profile-photo-wrap">
            {profile.photo ? (
              <div className="profile-photo" style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--photo-shape, 50%)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={profile.photo} alt={profile.name || 'Photo'} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ) : (
              <div className="photo-placeholder"><i className="fas fa-magic"></i></div>
            )}
          </div>
        )}

        {getLeftColumnSections(config).map((section: any) => {
          switch (section.type) {
            case 'contact':
              return (
                <CVSection key="contact" title={getSectionLabel(config, 'contact', 'Connexion')} className="sidebar-section">
                  <div className="contact-list">
                    {profile.phone && <div className="contact-item"><i className="fas fa-mobile-alt"></i><span>{profile.phone}</span></div>}
                    {profile.email && <div className="contact-item"><i className="fas fa-at"></i><span>{profile.email}</span></div>}
                    {profile.website && <div className="contact-item"><i className="fas fa-globe"></i><span>{profile.website}</span></div>}
                    {profile.location && <div className="contact-item"><i className="fas fa-map-pin"></i><span>{profile.location}</span></div>}
                    {profile.linkedin_url && <div className="contact-item"><i className="fab fa-linkedin"></i><span>{profile.linkedin_url.replace(/^https?:\/+(www\.)?/, '')}</span></div>}
                    {profile.github_url && <div className="contact-item"><i className="fab fa-github"></i><span>{profile.github_url.replace(/^https?:\/+(www\.)?/, '')}</span></div>}
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
              return skills?.groups && skills.groups.length > 0 && (
                <CVSection key="skills" title={getSectionLabel(config, 'skills', 'Vibes / Tech')} className="sidebar-section">
                  <div className="skills-wrap">
                    {skills.groups.flatMap((g: any) => g.items || []).map((skill: any, sIdx: number) => (
                      <SkillTag key={sIdx}>{typeof skill === 'string' ? skill : skill.name || ''}</SkillTag>
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
        <header className="header-meta">
          <h1 className="name">{profile.name || 'Nom Prénom'}</h1>
          {(profile.position || profile.title) && (
            <p className="profession">{profile.position || profile.title}</p>
          )}
        </header>

        {getRightColumnSections(config).map((section: any) => {
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
                      location={exp.location}
                      description={exp.description}
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
                <CVSection key="education" title={getSectionLabel(config, 'education', 'Formations')} className="content-section">
                  <div className="education-list">
                    {education.map((edu: any, idx: number) => (
                      <div key={idx} className="edu-item">
                        <div className="edu-year">
                          {edu.start || edu.end ? `${edu.start || ''} - ${edu.end || ''}` : (edu.dates || edu.year || edu.period)}
                        </div>
                        <div className="edu-content">
                          <div className="edu-degree">{edu.degree}</div>
                          <span className="edu-school">{edu.institution || edu.school}</span>
                          {edu.location && <div style={{ fontSize: '0.85em', opacity: 0.8, marginTop: '2px' }}><i className="fas fa-map-marker-alt"></i> {edu.location}</div>}
                          {edu.description && <div style={{ fontSize: '0.9em', marginTop: '4px', whiteSpace: 'pre-wrap' }}>{edu.description}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CVSection>
              );
            case 'certifications':
              return certifications && certifications.length > 0 && (
                <CVSection key="certifications" title={getSectionLabel(config, 'certifications', 'Certifications')} className="content-section">
                  <div className="education-list">
                    {certifications.map((cert: any, idx: number) => (
                      <div key={idx} className="edu-item">
                        <div className="edu-year">{cert.date}</div>
                        <div className="edu-content">
                          <div className="edu-degree">{cert.name}</div>
                          <span className="edu-school">{cert.issuer}</span>
                          {cert.url && <div style={{ fontSize: '0.85em', marginTop: '2px' }}><a href={cert.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}><i className="fas fa-link"></i> Lien</a></div>}
                        </div>
                      </div>
                    ))}
                  </div>
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
                <CVSection key="projects" title={getSectionLabel(config, 'projects', 'Projets')} className="content-section">
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
                    <CVSection key={section.type} title={custom.title} className="content-section">
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
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
    </div>
  );
};

export default React.memo(RodrigueTemplate);
