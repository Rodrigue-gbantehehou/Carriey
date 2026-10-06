'use client';

import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { CVTemplateRenderer } from '@/components/app/cv/templates';
import { LetterTemplateRenderer } from '@/components/app/letter/LetterTemplateRenderer';
import { PublicPageTemplateRenderer } from '@/components/app/public-page/templates';
import { API_BASE } from '@/lib/api';
import config from '@/lib/config';
import { CVData, TemplateConfig } from '@/types/cv';
import { PublicPageData } from '@/types/public-page';

interface TemplatePreviewProps {
  template: any;
  scale?: number;
  data?: any;
  sector?: string;
}

const DIVERSE_PHOTOS = [
  'https://images.unsplash.com/photo-1531384441138-2736e62e0919?fit=crop&w=300&h=300&q=80', // Homme noir pro
  'https://images.unsplash.com/photo-1548142813-c348350df52b?fit=crop&w=300&h=300&q=80', // Femme noire pro
  'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?fit=crop&w=300&h=300&q=80', // Homme noir pro 2
  'https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?fit=crop&w=300&h=300&q=80', // Femme noire pro 2
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?fit=crop&w=300&h=300&q=80', // Homme noir pro 3
];

const DEFAULT_MOCK_DATA = {
  profile: {
    name: 'Jean Dupont',
    title: 'Expert en Communication',
    email: 'jean.dupont@email.com',
    phone: '+225 07 00 00 00',
    location: 'Abidjan, Côte d\'Ivoire',
  },
  summary: 'Professionnel avec 10 ans d\'expérience dans la gestion de projets complexes et le management d\'équipes pluridisciplinaires.',
  experience: [
    {
      company: 'Digital Africa',
      role: 'Directeur Marketing',
      period: '2020 - Présent',
      bullets: [
        'Développement de la stratégie de marque.',
        'Gestion d\'un budget de 50M XOF.',
        'Augmentation de la visibilité de 150%.'
      ]
    }
  ],
  education: [
    {
      institution: 'INP-HB Yamoussoukro',
      degree: 'Diplôme d\'Ingénieur',
      year: '2014'
    }
  ],
  skills: {
    groups: [
      { label: 'Expertise', items: ['Management', 'Stratégie', 'Digital'] }
    ]
  },
  languages: [
    { name: 'Français', level: 'Natif' },
    { name: 'Anglais', level: 'Avancé' }
  ]
};

const DEFAULT_MOCK_PUBLIC_PAGE_DATA: PublicPageData = {
  page: {
    id: 'preview',
    slug: 'jean-dupont',
    title: 'Jean Dupont — Portfolio',
    theme: 'modern',
    accent_color: '#6366f1',
    show_photo: true,
    show_contact: true,
    sections: { bio: true, experiences: true, education: true, skills: true, projects: true, certifications: false, languages: true, links: false },
    custom_bio: null,
    seo_description: null,
    views: 0,
  },
  profile: {
    first_name: 'Jean',
    last_name: 'Dupont',
    title: 'Développeur Full-Stack',
    bio: 'Passionné de technologie avec 5 ans d\'expérience en développement web.',
    location: 'Abidjan, Côte d\'Ivoire',
    contact_email: 'jean.dupont@email.com',
    experiences: [
      { id: '1', title: 'Développeur Senior', company: 'Tech Africa', current: true, start_date: '2021-01', description: 'Développement d\'applications React & Node.js.' },
    ],
    educations: [
      { id: '1', degree: 'Master Informatique', school: 'INP-HB', start_date: '2017-09', end_date: '2019-07' },
    ],
    skills: [{ id: '1', name: 'React' }, { id: '2', name: 'Node.js' }, { id: '3', name: 'Python' }],
    projects: [],
    certifications: [],
    languages: [{ id: '1', name: 'Français', level: 'Natif' }, { id: '2', name: 'Anglais', level: 'Avancé' }],
    links: [],
  },
};

const GhostCVSkeleton = () => (
  <div className="w-full h-full p-8 flex flex-col gap-6 animate-pulse">
    {/* Header */}
    <div className="flex gap-4 items-start">
      <div className="w-16 h-16 bg-gray-100 rounded-full" />
      <div className="flex-1 space-y-3 pt-2">
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-50 rounded w-1/2" />
      </div>
    </div>
    {/* Body Section 1 */}
    <div className="space-y-4">
      <div className="h-4 bg-gray-100 rounded w-1/4 mb-6" />
      <div className="h-2 bg-gray-50 rounded w-full" />
      <div className="h-2 bg-gray-50 rounded w-full" />
      <div className="h-2 bg-gray-50 rounded w-3/4" />
    </div>
    {/* Body Section 2 */}
    <div className="space-y-4 pt-4">
      <div className="h-4 bg-gray-100 rounded w-1/3 mb-6" />
      <div className="flex gap-4">
        <div className="flex-1 space-y-2">
          <div className="h-2 bg-gray-50 rounded w-full" />
          <div className="h-2 bg-gray-50 rounded w-full" />
        </div>
        <div className="w-1/3 h-20 bg-gray-50 rounded" />
      </div>
    </div>
  </div>
);

const ShadowRoot: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const shadowHostRef = useRef<HTMLDivElement>(null);
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null);

  useLayoutEffect(() => {
    if (shadowHostRef.current) {
      if (!shadowHostRef.current.shadowRoot) {
        const root = shadowHostRef.current.attachShadow({ mode: 'open' });
        setShadowRoot(root);
      } else {
        setShadowRoot(shadowHostRef.current.shadowRoot);
      }
    }
  }, []);

  return (
    <div ref={shadowHostRef} className="w-full h-full">
      {shadowRoot && createPortal(
        <>
          <style>{`
            * { box-sizing: border-box; }
            html, body { margin: 0; padding: 0; height: 100%; }
            .cv-rendering-root {
              width: 100%;
              min-height: 100%;
              background: white;
              position: relative;
            }
            ul, ol { padding-left: 20px; }
            img { max-width: 100%; height: auto; display: block; }
            /* Force A4 proportions if the template doesn't specify */
            .cv-container {
              width: 210mm !important;
              min-height: 297mm !important;
              margin: 0 !important;
              box-shadow: none !important;
            }
          `}</style>
          {children}
        </>,
        shadowRoot
      )}
    </div>
  );
};

export default function TemplatePreview({ template, data = DEFAULT_MOCK_DATA, sector }: TemplatePreviewProps) {
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [dynamicScale, setDynamicScale] = useState(0.25);
  const containerRef = useRef<HTMLDivElement>(null);

  // Stable random photo based on template ID or name to avoid repetition
  const photoIndex = template?.id
    ? (typeof template.id === 'number' ? template.id % DIVERSE_PHOTOS.length : template.id.length % DIVERSE_PHOTOS.length)
    : 0;
  const stablePhoto = DIVERSE_PHOTOS[photoIndex];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Dynamic Scaling Engine
  useEffect(() => {
    if (!containerRef.current) return;

    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const isPublicPage = template?.template_type === 'public_page';
        const CONTENT_WIDTH_PX = isPublicPage ? 1280 : 793.7; // écran 1280px ou A4 210mm à 96 DPI
        const newScale = containerWidth / CONTENT_WIDTH_PX;
        setDynamicScale(newScale);
      }
    };

    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(containerRef.current);
    updateScale(); // Initial call

    return () => resizeObserver.disconnect();
  }, [isVisible, template?.template_type]);

  useEffect(() => {
    if (!isVisible || !template) return;
    setLoading(false);
  }, [isVisible, template]);

  // Map backend definition to TemplateConfig tokens
  const getTemplateConfig = (tpl: any): TemplateConfig => {
    const def = tpl.definition || {};
    return {
      templateName: tpl.slug,
      displayName: tpl.name,
      sector: sector, // Pass sector info for dynamic watermarks etc.
      tokens: {
        colorPrimary: def.tokens?.colorPrimary || def.colors?.primary || '#0f172a',
        colorSecondary: def.tokens?.colorSecondary || def.colors?.secondary || '#ffffff',
        colorAccent: def.tokens?.colorAccent || def.colors?.accent || '#c5a059',
        colorTextMain: def.tokens?.colorTextMain || def.colors?.textMain || '#1e293b',
        colorTextMuted: def.tokens?.colorTextMuted || def.colors?.textMuted || '#64748b',
        fontHeading: def.tokens?.fontHeading || def.fonts?.heading || 'Marcellus',
        fontBody: def.tokens?.fontBody || def.fonts?.body || 'Outfit',
        photoShape: def.tokens?.photoShape || 'circle',
        spacing: def.tokens?.spacing || 'normal',
        fontSize: def.tokens?.fontSize || 14,
        borderRadius: def.tokens?.borderRadius || '4px',
        sidebarWidth: def.tokens?.sidebarWidth || def.layout?.sidebarWidth || '35%',
        lineHeight: def.tokens?.lineHeight || 1.5
      },
      sections: def.sections || [
        { type: 'photo', enabled: true, column: 'left' },
        { type: 'contact', enabled: true, column: 'left', label: 'Contact' },
        { type: 'identity', enabled: true, column: 'left', label: 'Identité' },
        { type: 'skills', enabled: true, column: 'left', label: 'Compétences' },
        { type: 'languages', enabled: true, column: 'left', label: 'Langues' },
        { type: 'interests', enabled: true, column: 'left', label: 'Loisirs' },
        { type: 'summary', enabled: true, column: 'main', label: 'Profil' },
        { type: 'experience', enabled: true, column: 'main', label: 'Expérience' },
        { type: 'education', enabled: true, column: 'main', label: 'Formation' },
        { type: 'projects', enabled: true, column: 'main', label: 'Projets' }
      ]
    };
  };

  if (!isVisible) return <div ref={containerRef} className="w-full h-full bg-gray-50/50" />;

  if (template?.preview_image) {
    // If the path starts with /static, replace it to use the centralized static base url
    const src = template.preview_image.startsWith('http')
      ? template.preview_image
      : `${config.staticBaseUrl}${template.preview_image.replace('/static', '')}`;
    return (
      <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-[#FBFBFB] flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={template.name || template.slug}
          className="w-full h-full object-cover object-top"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden bg-[#FBFBFB] flex items-center justify-center group/preview"
    >
      {(() => {
        const isPublicPage = template?.template_type === 'public_page';
        const contentWidth = isPublicPage ? '1280px' : '210mm';
        const contentHeight = isPublicPage ? '800px' : '297mm';
        return (
          <>
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 origin-center transition-all duration-700 ease-out bg-white overflow-hidden shadow-cv"
              style={{
                width: contentWidth,
                height: contentHeight,
                transform: `translate(-50%, -50%) scale(${dynamicScale})`,
                opacity: !loading ? 1 : 0,
              }}
            >
              {!loading && (
                <ShadowRoot>
                  <div className="w-full h-full pointer-events-none select-none overflow-hidden">
                    {template.template_type === 'cover_letter' ? (
                      <LetterTemplateRenderer
                        templateName={template.slug}
                        data={{
                          profile: (data as any).profile || {},
                          formData: {
                            title: 'Candidature spontan\u00e9e',
                            recipientName: 'Madame, Monsieur',
                            companyName: 'Digital Africa',
                            recipientAddress: 'Abidjan, C\u00f4te d\u0027Ivoire',
                            subject: 'Candidature au poste de D\u00e9veloppeur',
                            salutation: 'Madame, Monsieur,',
                            body: 'Fort de mon exp\u00e9rience, je me permets de vous adresser ma candidature.',
                            closing: 'Dans l\u0027attente de vous rencontrer, veuillez agr\u00e9er mes salutations distingu\u00e9es.',
                          },
                        }}
                      />
                    ) : template.template_type === 'public_page' ? (
                      <PublicPageTemplateRenderer
                        templateName={template.slug}
                        data={DEFAULT_MOCK_PUBLIC_PAGE_DATA}
                        accent={template.definition?.tokens?.colorAccent || '#6366f1'}
                      />
                    ) : (
                      <CVTemplateRenderer
                        templateName={template.slug}
                        data={{
                          ...data,
                          profile: {
                            ...data.profile,
                            photo: data.profile?.photo || stablePhoto
                          }
                        } as CVData}
                        config={getTemplateConfig(template)}
                        apiBaseUrl={API_BASE}
                      />
                    )}
                  </div>
                </ShadowRoot>
              )}
            </div>

            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="origin-center" style={{ width: contentWidth, height: contentHeight, transform: `scale(${dynamicScale})` }}>
                  <GhostCVSkeleton />
                </div>
              </div>
            )}
          </>
        );
      })()}
    </div>
  );
}
