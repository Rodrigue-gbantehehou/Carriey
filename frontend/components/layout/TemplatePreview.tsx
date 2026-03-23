'use client';

import React, { useEffect, useState, useRef } from 'react';
import { previewHtml } from '@/lib/api';

interface TemplatePreviewProps {
  template: any;
  scale?: number;
  data?: any;
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
        'Gestion d\'un budget de 50M FCFA.',
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

export default function TemplatePreview({ template, data = DEFAULT_MOCK_DATA }: TemplatePreviewProps) {
  const [html, setHtml] = useState<string>('');
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
        const A4_WIDTH_PX = 793.7; // 210mm at 96 DPI
        // We want the CV to take 100% of the container width
        const newScale = containerWidth / A4_WIDTH_PX;
        setDynamicScale(newScale);
      }
    };

    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(containerRef.current);
    updateScale(); // Initial call

    return () => resizeObserver.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !template) return;

    const fetchPreview = async () => {
      try {
        setLoading(true);
        const res = await previewHtml(
          { ...template, templateName: template.slug },
          {
            ...data,
            profile: {
              ...data.profile,
              photo: data.profile?.photo || stablePhoto
            }
          }
        );
        
        const crispStyles = `
          <style>
            html { 
              -webkit-font-smoothing: antialiased; 
              -moz-osx-font-smoothing: grayscale; 
              text-rendering: optimizeLegibility;
              image-rendering: -webkit-optimize-contrast;
            }
            body { 
              overflow: hidden !important; 
              width: 210mm !important;
              margin: 0 !important;
            }
            * { transition: none !important; }
          </style>
        `;
        setHtml(res.html.replace('</head>', `${crispStyles}</head>`));
      } catch (error) {
        console.error('Failed to fetch template preview:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [isVisible, template, data]);

  if (!isVisible) return <div ref={containerRef} className="w-full h-full bg-gray-50/50" />;

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative overflow-hidden bg-[#FBFBFB] flex items-center justify-center group/preview"
    >
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 origin-center transition-all duration-700 ease-out"
        style={{ 
          width: '210mm', 
          height: '297mm',
          transform: `translate(-50%, -50%) scale(${dynamicScale})`,
          opacity: html && !loading ? 1 : 0,
          boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.15), 0 10px 20px -10px rgba(0, 0, 0, 0.1), 0 0 1px 0 rgba(0, 0, 0, 0.05)'
        }}
      >
        {html && (
          <iframe
            srcDoc={html}
            className="w-full h-full border-0 pointer-events-none select-none"
            title={`Preview ${template.name}`}
            scrolling="no"
          />
        )}
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="origin-center" style={{ width: '210mm', height: '297mm', transform: `scale(${dynamicScale})` }}>
            <GhostCVSkeleton />
          </div>
        </div>
      )}
    </div>
  );
}
