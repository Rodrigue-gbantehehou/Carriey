
import React from 'react';

/**
 * Shared CSS variables component to apply template tokens
 */
export const TemplateStyles = ({ config }: { config: any }) => {
  const tokens = config?.tokens || {};
  
  const photoShapeMap: any = { circle: "50%", square: "4px", rounded: "12px" };
  const photoShapeCss = photoShapeMap[tokens.photoShape || "circle"] || "50%";

  const spacingMap: any = { compact: "0.75", normal: "1", airy: "1.4" };
  const spacingVal = spacingMap[tokens.spacing || "normal"] || "1";

  // We use a style tag to inject CSS variables at the root of the CV container
  const cssVars = `
    .cv-rendering-root {
      --color-primary: ${tokens.colorPrimary || '#0f172a'};
      --color-secondary: ${tokens.colorSecondary || '#ffffff'};
      --color-accent: ${tokens.colorAccent || '#c5a059'};
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
        // Add a cache-busting timestamp to ensure we get the latest styles from disk
        const cacheBuster = new Date().getTime();
        const response = await fetch(`${apiBaseUrl}/templates/${slug}/style.css?v=${cacheBuster}`);
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
