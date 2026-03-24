
import React from 'react';
import { TemplateProps } from '@/types/cv';
import { TemplateStyles, RemoteStyles } from '../BaseComponents';

const AbidjanTemplate: React.FC<TemplateProps> = ({ data, config, apiBaseUrl }) => {
  const { profile, summary, experience, education, skills, languages, projects, custom_sections } = data;
  
  const isSectionEnabled = (type: string) => {
    return config.sections.find(s => s.type === type)?.enabled !== false;
  };

  const getSectionLabel = (type: string, fallback: string) => {
    return config.sections.find(s => s.type === type)?.label || fallback;
  };

  return (
    <div className={`cv-rendering-root cv-container abidjan-template sector-${(config.sector || 'general').toLowerCase()}`}>
      <RemoteStyles templateName={config.templateName} apiBaseUrl={apiBaseUrl} />
      <TemplateStyles config={config} />
      
      {/* Header Centralisé */}
      <div className="header">
        {/* Filigrane de secteur dynamique */}
        <div className="header-watermark">
          {config.sector === 'Santé' && <span>+</span>}
          {config.sector?.includes('Tech') && <span>&lt;/&gt;</span>}
          {config.sector === 'Commerce & Vente' && <span>$</span>}
        </div>

        {isSectionEnabled('photo') && (
          <div className="profile-photo-wrap" style={{ transform: config.tokens.spacing === 'compact' ? 'scale(0.85)' : 'none' }}>
            {profile.photo ? (
              <div className="profile-photo">
                <img src={profile.photo} alt={profile.name || 'Photo'} />
              </div>
            ) : (
              <div className="photo-placeholder"><i className="fas fa-user"></i></div>
            )}
          </div>
        )}

        <div className="header-info">
          <div className="header-name">{profile.name || 'Prénom Nom'}</div>
          {(profile.position || profile.title) && (
            <div className="header-title">{profile.position || profile.title}</div>
          )}

          {isSectionEnabled('contact') && (
            <div className="header-contact">
              {profile.phone && <div className="contact-item"><i className="fas fa-phone"></i><span>{profile.phone}</span></div>}
              {profile.email && <div className="contact-item"><i className="fas fa-envelope"></i><span>{profile.email}</span></div>}
              {profile.location && <div className="contact-item"><i className="fas fa-map-marker-alt"></i><span>{profile.location}</span></div>}
            </div>
          )}
        </div>
      </div>

      {/* Corps du CV */}
      <div className="cv-body">
        {config.sections.filter(s => s.enabled).map((section) => {
          switch (section.type) {
            case 'identity':
              return (profile.age || profile.nationality || (profile as any).marital_status) && (
                <div key="identity" className="cv-section">
                  <h3 className="section-title"><i className="fas fa-id-card"></i> {section.label || 'Identité'}</h3>
                  <div className="identity-grid">
                    {profile.age && <div className="identity-item"><span className="identity-label">Âge</span><span className="identity-value">{profile.age}</span></div>}
                    {profile.nationality && <div className="identity-item"><span className="identity-label">Nationalité</span><span className="identity-value">{profile.nationality}</span></div>}
                    {(profile as any).marital_status && <div className="identity-item"><span className="identity-label">Situation</span><span className="identity-value">{(profile as any).marital_status}</span></div>}
                  </div>
                </div>
              );
            case 'summary':
              return summary && (
                <div key="summary" className="cv-section">
                  <h3 className="section-title"><i className="fas fa-user-tie"></i> {section.label || 'Profil Professionnel'}</h3>
                  <p className="profile-text">{summary}</p>
                </div>
              );
            case 'experience':
              return experience && experience.length > 0 && (
                <div key="experience" className="cv-section">
                  <h3 className="section-title"><i className="fas fa-briefcase"></i> {section.label || 'Expériences Professionnelles'}</h3>
                  <div className="experiences-list">
                    {experience.map((exp, idx) => (
                      <div key={idx} className="experience-item">
                        <div className="exp-left">
                          <div className="exp-dates">{exp.dates || `${exp.start || ''} – ${exp.end || 'Présent'}`}</div>
                          <div className="exp-company">{exp.company}</div>
                        </div>
                        <div className="exp-right">
                          <div className="exp-title">{exp.position || (exp as any).role}</div>
                          {(exp.bullets || exp.tasks) && (
                            <ul className="exp-tasks">
                              {(exp.bullets || exp.tasks || []).map((task, tIdx) => <li key={tIdx}>{task}</li>)}
                            </ul>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            case 'education':
              return education && education.length > 0 && (
                <div key="education" className="cv-section">
                  <h3 className="section-title"><i className="fas fa-graduation-cap"></i> {section.label || 'Formation & Diplômes'}</h3>
                  <div className="education-list">
                    {education.map((edu, idx) => (
                      <div key={idx} className="education-item">
                        <div className="edu-left">
                          <div className="edu-year">
                            {edu.year || edu.dates || (edu.start || edu.end ? `${edu.start || ''} - ${edu.end || ''}` : '')}
                          </div>
                          <div className="edu-school">{edu.institution || edu.school}</div>
                        </div>
                        <div className="edu-right"><div className="edu-degree">{edu.degree}</div></div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            case 'skills':
              return skills?.groups && (
                <div key="skills" className="cv-section">
                  <h3 className="section-title"><i className="fas fa-star"></i> {section.label || 'Compétences Spécifiques'}</h3>
                  <div className="skills-list">
                    {skills.groups.flatMap(g => g.items || []).map((skill, sIdx) => (
                      <div key={sIdx} className="skill-tag">{skill}</div>
                    ))}
                  </div>
                </div>
              );
            case 'languages':
              return languages && languages.length > 0 && (
                <div key="languages" className="cv-section">
                  <h3 className="section-title"><i className="fas fa-language"></i> {section.label || 'Langues Maîtrisées'}</h3>
                  <div className="languages-list-grid">
                    {languages.map((lang, lIdx) => (
                      <div key={lIdx} className="language-item">
                        <span className="lang-name">{lang.name}</span>
                        <div className="lang-bar-bg"><div className="lang-bar-fill" style={{ width: lang.level.includes('Maternel') || lang.level.includes('Courant') ? '100%' : '70%' }}></div></div>
                        <span className="lang-level">{lang.level}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            case 'projects':
              return projects && projects.length > 0 && (
                <div key="projects" className="cv-section">
                  <h3 className="section-title"><i className="fas fa-lightbulb"></i> {section.label || 'Projets Réalisés'}</h3>
                  {projects.map((project, idx) => (
                    <div key={idx} className="experience-item">
                      <div className="exp-left"><div className="exp-company">{project.name}</div></div>
                      <div className="exp-right">
                        {project.link && <div className="exp-title" style={{ fontSize: '0.9em', opacity: 0.8 }}>{project.link}</div>}
                        <div className="profile-text" style={{ padding: 0, marginTop: '5px' }}>{project.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            case 'interests':
              return data.interests && data.interests.length > 0 && (
                <div key="interests" className="cv-section">
                  <h3 className="section-title"><i className="fas fa-heart"></i> {section.label || 'Centres d\'Intérêt'}</h3>
                  <div className="interests-list">
                    {data.interests.map((interest, iIdx) => (
                      <span key={iIdx} className="interest-tag">{interest}</span>
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
                    <div key={section.type} className="cv-section">
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
      <div className="cv-footer"></div>
    </div>
  );
};

export default React.memo(AbidjanTemplate);
