import nunjucks from 'nunjucks/browser/nunjucks.js';
import config from './config';

// Base URL for templates (now served by the backend)
const TEMPLATE_BASE_URL = `${config.apiBaseUrl}/templates`;

export interface RenderOptions {
  colorPrimary?: string;
  colorSecondary?: string;
  colorAccent?: string;
  fontHeading?: string;
  fontBody?: string;
  spacing?: 'compact' | 'normal' | 'airy';
  fontSize?: number;
  lineHeight?: number;
  photoShape?: 'circle' | 'square' | 'rounded';
  borderRadius?: string;
  sections?: any[];
  is_preview?: boolean;
}

/**
 * LocalRenderer handles CV rendering directly in the browser.
 * It fetches the Jinja2/Nunjucks templates and CSS from the backend
 * and uses Nunjucks to produce the HTML.
 */
export class LocalRenderer {
  private static env: nunjucks.Environment = (() => {
    const e = new nunjucks.Environment(null, { autoescape: true });
    // Add selectattr filter if missing or to enhance it
    e.addFilter('selectattr', (arr: any[], attr: string, test: string, value: any) => {
      if (!arr || !Array.isArray(arr)) return [];
      return arr.filter(item => {
        const itemVal = item[attr];
        if (test === 'equalto' || test === '==') return itemVal === value;
        if (test === 'defined') return itemVal !== undefined;
        return !!itemVal;
      });
    });
    return e;
  })();
  private static templateCache: Record<string, { jinja: string; css: string; metadata: any }> = {};

  /**
   * Fetches template files from the backend and caches them.
   */
  private static async getTemplateFiles(templateName: string) {
    const slug = templateName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9_-]/g, "");
    
    if (this.templateCache[slug]) {
      return this.templateCache[slug];
    }

    const [jinjaRes, cssRes, metaRes] = await Promise.all([
      fetch(`${TEMPLATE_BASE_URL}/${slug}/template.jinja2`),
      fetch(`${TEMPLATE_BASE_URL}/${slug}/style.css`),
      fetch(`${TEMPLATE_BASE_URL}/${slug}/template.json`)
    ]);

    if (!jinjaRes.ok) throw new Error(`Template '${templateName}' not found`);

    const files = {
      jinja: await jinjaRes.text(),
      css: await cssRes.text().catch(() => ""),
      metadata: await metaRes.json().catch(() => ({})),
    };

    this.templateCache[slug] = files;
    return files;
  }

  /**
   * Prepares data for rendering, mirroring backend logic.
   */
  private static async prepareData(data: any) {
    if (!data) return {};
    const prepared = JSON.parse(JSON.stringify(data)); // Deep clone
    
    // Encode photo if it's a URL (to avoid mixed content/previews issues)
    if (prepared.profile && prepared.profile.photo && prepared.profile.photo.startsWith('http')) {
      try {
        // Optionnel: On pourrait encoder la photo ici si besoin, 
        // mais dans le navigateur une URL directe suffit généralement.
        // On la garde telle quelle pour l'instant pour la rapidité.
      } catch (e) {
        console.warn("Failed to process photo:", e);
      }
    }
    
    return prepared;
  }

  /**
   * Renders the CV HTML.
   */
  public static async render(templateName: string, data: any, options: RenderOptions = {}): Promise<string> {
    const { jinja, css, metadata } = await this.getTemplateFiles(templateName);

    // Merge options with metadata
    const finalMetadata = { ...metadata, ...options };
    
    // Prepare data (like photo placeholders and encoding)
    const preparedData = await this.prepareData(data);

    // Render the body using Nunjucks
    const renderedBody = this.env.renderString(jinja, { data: preparedData, template: finalMetadata });

    // Prepare CSS variables (mirroring backend logic)
    const cssVars = this.generateCssVars(finalMetadata);
    
    // Handle Google Fonts
    const fontLinks = this.generateFontLinks(finalMetadata);

    // Assembly
    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>CV Preview (Local)</title>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
  ${fontLinks}
  <style>
    ${css}
    ${cssVars}
    ${this.getExtraStyles(finalMetadata)}
  </style>
</head>
<body>
  ${renderedBody}
  <script>
    function reportHeight() {
      const container = document.querySelector('.cv-container');
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const totalHeight = rect.bottom + scrollTop + 20;
      window.parent.postMessage({ type: 'CV_HEIGHT', height: Math.ceil(totalHeight) }, '*');
    }
    window.addEventListener('load', reportHeight);
    if (window.ResizeObserver) {
      new ResizeObserver(() => reportHeight()).observe(document.querySelector('.cv-container'));
    }
    setInterval(reportHeight, 1000);
  </script>
</body>
</html>
    `.trim();

    return html;
  }

  private static generateCssVars(metadata: any): string {
    const tokens = metadata.tokens || {};
    const colors = metadata.colors || {};
    const fonts = metadata.fonts || {};
    const layout = metadata.layout || {};

    const primary = metadata.colorPrimary || tokens.colorPrimary || colors.primary;
    const secondary = metadata.colorSecondary || tokens.colorSecondary || colors.secondary;
    const accent = metadata.colorAccent || tokens.colorAccent || colors.accent;
    const fontH = metadata.fontHeading || tokens.fontHeading || fonts.heading;
    const fontB = metadata.fontBody || tokens.fontBody || fonts.body;

    const sidebarWidth = metadata.sidebarWidth || tokens.sidebarWidth || layout.sidebarWidth || "35%";
    const borderRadius = metadata.borderRadius || tokens.borderRadius || "4px";
    const fontSize = metadata.fontSize || tokens.fontSize || 13;
    const lineHeight = metadata.lineHeight || tokens.lineHeight || 1.5;
    const photoShapeRaw = metadata.photoShape || tokens.photoShape || "circle";
    const spacingRaw = metadata.spacing || tokens.spacing || "normal";

    const photoShapeMap: any = { circle: "50%", square: borderRadius, rounded: "12px" };
    const photoShapeCss = photoShapeMap[photoShapeRaw] || "50%";

    const spacingMap: any = { compact: "0.75", normal: "1", airy: "1.4" };
    const spacingVal = spacingMap[spacingRaw] || "1";

    return `
:root {
  ${primary ? `--color-primary: ${primary};` : ''}
  ${secondary ? `--color-secondary: ${secondary};` : ''}
  ${accent ? `--color-accent: ${accent};` : ''}
  ${fontH ? `--font-heading: '${fontH}', sans-serif;` : ''}
  ${fontB ? `--font-body: '${fontB}', sans-serif;` : ''}
  --sidebar-width: ${sidebarWidth};
  --border-radius: ${borderRadius};
  --font-size-base: ${fontSize}px;
  --line-height: ${lineHeight};
  --photo-shape: ${photoShapeCss};
  --spacing: ${spacingVal};
  --spacing-base: ${spacingVal};
}
    `.trim();
  }

  private static generateFontLinks(metadata: any): string {
    const fonts = [metadata.fontHeading, metadata.fontBody].filter(Boolean);
    const uniqueFonts = Array.from(new Set(fonts));
    return uniqueFonts.map(font => {
      const encoded = font.replace(/ /g, '+');
      return `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${encoded}:wght@400;600;700&display=swap" />`;
    }).join('\n  ');
  }

  private static getExtraStyles(metadata: any): string {
    if (!metadata.is_preview) return "";
    return `
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      background: #CBD5E1;
      -webkit-print-color-adjust: exact;
    }
    .cv-container {
      margin: 0 auto 40px;
      width: 210mm;
      min-height: 297mm;
      height: auto;
      background: white;
      position: relative;
      box-shadow: 0 10px 30px rgba(0,0,0,0.25);
    }
    .cv-container::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      background-image: repeating-linear-gradient(
        to bottom,
        transparent,
        transparent calc(297mm - 1px),
        rgba(239, 68, 68, 0.4) 297mm,
        rgba(239, 68, 68, 0.4) 297mm,
        transparent calc(297mm + 1px)
      );
      z-index: 100;
    }
    .section-title, h1, h2, h3 { break-after: avoid !important; }
    .experience-item, .education-item, .cv-section, .section { break-inside: avoid !important; }
    p, li { widows: 3; orphans: 3; }
    `.trim();
  }
}
