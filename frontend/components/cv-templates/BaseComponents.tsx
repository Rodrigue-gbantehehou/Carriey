
import React from 'react';

/**
 * Shared CSS variables component to apply template tokens
 */
export const TemplateStyles = ({ config }: { config: any }) => {
  const { tokens } = config;
  
  const photoShapeMap: any = { circle: "50%", square: "4px", rounded: "12px" };
  const photoShapeCss = photoShapeMap[tokens.photoShape] || "50%";

  const spacingMap: any = { compact: "0.75", normal: "1", airy: "1.4" };
  const spacingVal = spacingMap[tokens.spacing] || "1";

  // We use a style tag to inject CSS variables at the root of the CV container
  const cssVars = `
    .cv-rendering-root {
      --color-primary: ${tokens.colorPrimary || '#1a1a1a'};
      --color-secondary: ${tokens.colorSecondary || '#ffffff'};
      --color-accent: ${tokens.colorAccent || '#d4af37'};
      --font-heading: '${tokens.fontHeading || 'Playfair Display'}', sans-serif;
      --font-body: '${tokens.fontBody || 'Crimson Text'}', sans-serif;
      --border-radius: ${tokens.borderRadius || '4px'};
      --font-size-base: ${tokens.fontSize || 14}px;
      --photo-shape: ${photoShapeCss};
      --spacing-multiplier: ${spacingVal};
    }
  `;

  return <style dangerouslySetInnerHTML={{ __html: cssVars }} />;
};

export const CVSection = ({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) => (
  <section className={`section ${className}`}>
    {title && <h2 className="section-title">{title}</h2>}
    {children}
  </section>
);

export const ItemGroup = ({ title, subtitle, date, children }: { title: string; subtitle?: string; date?: string; children?: React.ReactNode }) => (
  <div className="item-group">
    <div className="item-header">
      <h4 className="item-title">{title}</h4>
      {date && <span className="item-date">{date}</span>}
    </div>
    {subtitle && <div className="item-subtitle">{subtitle}</div>}
    {children}
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
        const response = await fetch(`${apiBaseUrl}/templates/${slug}/style.css`);
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
