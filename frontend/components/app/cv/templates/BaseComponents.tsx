
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

export const ItemGroup = ({ title, subtitle, date, children, className = "" }: { title: string; subtitle?: string; date?: string; children?: React.ReactNode; className?: string }) => (
  <div className={`item-group ${className}`}>
    <div className="item-header">
      <h4 className="item-title">{title}</h4>
      {date && <span className="item-date">{date}</span>}
    </div>
    {subtitle && <div className="item-subtitle">{subtitle}</div>}
    {children && <div className="item-body">{children}</div>}
  </div>
);

export const SkillTag = ({ children }: { children: React.ReactNode }) => (
  <span className="skill-tag">{children}</span>
);

/**
 * Loads the CSS from the backend and injects it into a style tag.
 */
export const RemoteStyles = ({ templateName, apiBaseUrl }: { templateName: string; apiBaseUrl: string }) => {
  const [css, setCss] = React.useState<string>('');
  const slug = templateName.toLowerCase();

  React.useEffect(() => {
    const fetchCss = async () => {
      try {
        const cacheBuster = new Date().getTime();
        // Fetch directly from the Next.js public directory
        const response = await fetch(`/template-assets/${slug}/style.css?v=${cacheBuster}`);
        if (response.ok) {
          const text = await response.text();
          setCss(text);
        }
      } catch (e) {
        console.warn(`Failed to fetch styles for ${slug}:`, e);
      }
    };
    fetchCss();
  }, [slug, apiBaseUrl]);

  if (!css) return null;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
};
