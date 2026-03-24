
import React from 'react';
import { TemplateProps } from '@/types/cv';
import { TemplateStyles, CVSection, ItemGroup, SkillTag } from '../BaseComponents';

const ClassiqueTemplate: React.FC<TemplateProps> = ({ data, config }) => {
  const { profile, summary, experience, education, skills, languages, projects, custom_sections } = data;
  
  // Find section config to check if enabled
  const isSectionEnabled = (type: string) => {
    return config.sections.find(s => s.type === type)?.enabled !== false;
  };

  const getSectionLabel = (type: string, fallback: string) => {
    return config.sections.find(s => s.type === type)?.label || fallback;
  };

  return (
    <div className="cv-rendering-root cv-container classique-template">
      <TemplateStyles config={config} />
      
      {/* Header */}
      <header className="header">
        <h1 className="name">{profile.name || 'Nom Prénom'}</h1>
        {(profile.position || profile.title) && (
          <p className="profession">{profile.position || profile.title}</p>
        )}
        
        <div className="meta-info">
          {isSectionEnabled('contact') && (
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
            </>
          )}

          {isSectionEnabled('identity') && (
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
              <CVSection key="experience" title={getSectionLabel('experience', 'Expérience Professionnelle')}>
                {experience.map((exp, idx) => (
                  <ItemGroup 
                    key={idx}
                    title={exp.position || (exp as any).role}
                    subtitle={exp.company}
                    date={exp.dates || `${exp.start || ''} – ${exp.end || 'Présent'}`}
                  >
                    {(exp.tasks || exp.bullets) && (
                      <ul className="item-tasks">
                        {(exp.tasks || exp.bullets || []).map((task, tIdx) => (
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
              <CVSection key="education" title={getSectionLabel('education', 'Formation Académique')}>
                {education.map((edu, idx) => (
                  <ItemGroup 
                    key={idx}
                    title={edu.degree}
                    subtitle={edu.institution || edu.school}
                    date={edu.start || edu.end ? `${edu.start || ''} - ${edu.end || ''}` : (edu.dates || edu.year)}
                  />
                ))}
              </CVSection>
            ) : null;

          case 'skills':
            return skills?.groups && skills.groups.length > 0 ? (
              <CVSection key="skills" title={getSectionLabel('skills', 'Compétences')}>
                {skills.groups.map((group, gIdx) => (
                  <div key={gIdx} className="skill-set">
                    {group.label && <h4>{group.label}</h4>}
                    <div className="skill-list">
                      {(group.items || []).map((skill, sIdx) => (
                        <SkillTag key={sIdx}>{skill}</SkillTag>
                      ))}
                    </div>
                  </div>
                ))}
              </CVSection>
            ) : null;

          case 'languages':
            return languages && languages.length > 0 ? (
              <CVSection key="languages" title={getSectionLabel('languages', 'Langues')}>
                <div className="skill-list">
                  {languages.map((lang, lIdx) => (
                    <div key={lIdx} className="skill-tag" style={{ display: 'block', width: '100%', border: 'none' }}>
                      <strong>{lang.name}</strong> – {lang.level}
                    </div>
                  ))}
                </div>
              </CVSection>
            ) : null;

          case 'projects':
            return projects && projects.length > 0 ? (
              <CVSection key="projects" title={getSectionLabel('projects', 'Projets')}>
                {projects.map((project, pIdx) => (
                  <ItemGroup 
                    key={pIdx}
                    title={project.name}
                    subtitle={project.description}
                    date={project.link}
                  />
                ))}
              </CVSection>
            ) : null;

          default:
            if (section.type.startsWith('custom_')) {
              const customId = section.type.replace('custom_', '');
              const custom = custom_sections?.find(c => c.id === customId);
              if (custom) {
                return (
                  <CVSection key={section.type} title={custom.title}>
                    <div className="about-text">
                      {custom.type === 'list' ? (
                        <ul className="item-tasks">
                          {custom.content.split('\n').filter(line => line.trim()).map((item, iIdx) => (
                            <li key={iIdx}>{item}</li>
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

      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
    </div>
  );
};

export default React.memo(ClassiqueTemplate);
