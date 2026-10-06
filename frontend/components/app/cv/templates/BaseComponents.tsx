"use client";

import React from 'react';

/**
 * Shared CSS variables component to apply template tokens
 */
export const TemplateStyles = ({ config }: { config: any }) => {
  const tokens = config?.tokens || {};
  
  const photoShapeMap: any = { circle: "50%", square: "4px", rounded: "12px" };
  const photoShapeCss = photoShapeMap[tokens.photoShape || "circle"] || "50%";

  const spacingMap: any = { compact: "0.7", normal: "1", airy: "1.3" };
  const spacingVal = spacingMap[tokens.spacing || "normal"] || "1";

  const cssVars = `
    .cv-rendering-root {
      --color-primary: ${tokens.colorPrimary || '#0f172a'};
      --color-secondary: ${tokens.colorSecondary || '#ffffff'};
      --color-accent: ${tokens.colorAccent || '#c5a059'};
      --color-background-soft: rgba(0, 0, 0, 0.03);
      --color-text-main: ${tokens.colorTextMain || '#1e293b'};
      --color-text-muted: ${tokens.colorTextMuted || '#64748b'};
      --font-heading: '${tokens.fontHeading || 'Marcellus'}', serif;
      --font-body: '${tokens.fontBody || 'Outfit'}', sans-serif;
      --border-radius: ${tokens.borderRadius || '4px'};
      --font-size-base: ${tokens.fontSize || 14}px;
      --sidebar-width: ${tokens.sidebarWidth || '35%'};
      --photo-shape: ${photoShapeCss};
      --spacing: ${spacingVal};
      --spacing-multiplier: ${spacingVal};
      --line-height: ${tokens.lineHeight || 1.4};
      --section-gap: calc(24px * var(--spacing-multiplier));
      --item-gap: calc(16px * var(--spacing-multiplier));
    }
    .cv-container {
      min-height: 297mm;
      box-sizing: border-box;
    }
  `;

  return <style dangerouslySetInnerHTML={{ __html: cssVars }} />;
};

export const SkillBar = ({ name, level = 85 }: { name: string; level?: number }) => (
  <div className="skill-item">
    <span className="skill-name">{name}</span>
    <div className="skill-bar-bg">
      <div className="skill-bar-fill" style={{ width: `${level}%` }}></div>
    </div>
  </div>
);

export const DateRange = ({ start, end, dates }: { start?: string; end?: string; dates?: string }) => {
  const displayDates = dates || (start && end ? `${start} - ${end}` : start || end || "");
  if (!displayDates) return null;
  return <span className="item-date">{displayDates}</span>;
};

export const CVSection = ({ title, icon, children, className = "" }: { title?: string; icon?: string; children: React.ReactNode; className?: string }) => (
  <section className={`section ${className}`}>
    {title && (
      <h2 className="section-title">
        {icon && <i className={`${icon} section-icon`}></i>}
        {title}
      </h2>
    )}
    <div className="section-content">{children}</div>
  </section>
);

export const ItemGroup = ({ title, subtitle, date, location, url, description, children, className = "" }: { title: string; subtitle?: string; date?: string; location?: string; url?: string; description?: string; children?: React.ReactNode; className?: string }) => (
  <div className={`item-group ${className}`}>
    <div className="item-header">
      <h4 className="item-title">{title}</h4>
      {date && <span className="item-date">{date}</span>}
    </div>
    {(subtitle || location || url) && (
      <div className="item-subtitle">
        {subtitle && <span>{subtitle}</span>}
        {subtitle && (location || url) && <span style={{margin: '0 8px'}}>|</span>}
        {location && <span className="item-location"><i className="fas fa-map-marker-alt" style={{marginRight: '4px'}}></i>{location}</span>}
        {location && url && <span style={{margin: '0 8px'}}>|</span>}
        {url && <a href={url} target="_blank" rel="noopener noreferrer" className="item-url" style={{color: 'inherit', textDecoration: 'none'}}><i className="fas fa-link" style={{marginRight: '4px'}}></i>{url.replace(/^https?:\/+(www\.)?/, '')}</a>}
      </div>
    )}
    {description && <div className="item-description" style={{marginTop: '6px', whiteSpace: 'pre-wrap'}}>{description}</div>}
    {children && <div className="item-body">{children}</div>}
  </div>
);

export const SkillTag = ({ children }: { children: React.ReactNode }) => (
  <span className="skill-tag">{children}</span>
);

export const CustomSectionContent = ({ custom }: { custom: any }) => {
  if (!custom) return null;
  
  if (custom.type === 'detailed_list' && custom.items) {
    return (
      <div className="experiences-list">
        {custom.items.map((item: any, idx: number) => (
          <div key={idx} className="experience-item" style={{ marginBottom: '15px' }}>
            <div className="exp-meta" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', marginBottom: '4px' }}>
              {item.subtitle && <span className="exp-company">{item.subtitle}</span>}
              {item.date && <span className="exp-dates">{item.date}</span>}
            </div>
            <div className="exp-header" style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
              <div className="exp-title">{item.title}</div>
            </div>
            {item.description && (
              <div className="profile-text" style={{ padding: 0, marginTop: '2px', background: 'transparent', borderLeft: 'none', whiteSpace: 'pre-wrap' }}>
                {item.description}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }
  
  const content = custom.content || '';
  if (custom.type === 'list' || custom.type === 'simple_list') {
    const items = custom.items ? custom.items.map((i: any) => i.title) : content.split('\n').filter((line: string) => line.trim());
    return (
      <ul className="item-tasks exp-tasks skills-list" style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
        {items.map((item: string, iIdx: number) => (
          <li key={iIdx}>{item}</li>
        ))}
      </ul>
    );
  }

  return (
    <div>
      {content.split('\n').map((line: string, i: number) => (
        <React.Fragment key={i}>
          {line}
          {i < content.split('\n').length - 1 && <br />}
        </React.Fragment>
      ))}
    </div>
  );
};


// Cache mémoire — l'import n'est fait qu'une seule fois par slug
const CSS_CACHE: Record<string, string> = {};

/**
 * RemoteStyles: charge le CSS du template via l'API interne /api/template-css/[slug].
 * Cette API lit directement les fichiers sources — aucune copie dans public/,
 * aucune liste à maintenir. Ajouter un template = créer son dossier + style.css.
 */
export const RemoteStyles = ({ templateName, apiBaseUrl }: { templateName: string; apiBaseUrl: string }) => {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [css, setCss] = React.useState<string>('');
  const slug = (templateName || 'classique').toLowerCase().replace(/[^a-z0-9_-]/g, '');

  React.useEffect(() => {
    if (CSS_CACHE[slug]) {
      setCss(CSS_CACHE[slug]);
      ref.current?.dispatchEvent(new CustomEvent('pageflow:css-ready', { bubbles: true }));
      return;
    }

    fetch(`/api/template-css/${slug}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then(text => {
        CSS_CACHE[slug] = text;
        setCss(text);
      })
      .catch(e => console.warn(`[RemoteStyles] CSS introuvable pour "${slug}":`, e))
      .finally(() => {
        ref.current?.dispatchEvent(new CustomEvent('pageflow:css-ready', { bubbles: true }));
      });
  }, [slug]);

  return (
    <span ref={ref} style={{ display: 'none' }}>
      {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
    </span>
  );
};
