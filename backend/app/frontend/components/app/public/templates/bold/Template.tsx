import React from 'react';
import { TemplateProps } from '@/types/cv';
import { TemplateStyles, RemoteStyles } from '../BaseComponents';

const Template: React.FC<TemplateProps> = ({ data, config, apiBaseUrl }) => {
  const { profile, summary, experience, education, skills, languages, projects, custom_sections } = data;
  
  return (
    <div className="cv-rendering-root cv-container">
      <RemoteStyles templateName={config.templateName} apiBaseUrl={apiBaseUrl} />
      <TemplateStyles config={config} />
      
      <header className="header" style={{ padding: '40px', textAlign: 'center' }}>
        <h1 className="name" style={{ fontSize: '2.5em', margin: 0 }}>{profile.name || 'Nom Prénom'}</h1>
        <p className="profession" style={{ fontSize: '1.2em', color: 'var(--color-accent)' }}>{profile.position || profile.title}</p>
      </header>
      
      <div className="main-content" style={{ padding: '0 40px' }}>
        <section className="section">
          <h2 className="section-title">Résumé</h2>
          <p className="about-text">{summary}</p>
        </section>
      </div>
    </div>
  );
};

export default React.memo(Template);
