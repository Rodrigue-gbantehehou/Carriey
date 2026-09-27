import React, { Suspense } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { CVTemplateRenderer } from '../templates';
import { API_BASE } from '@/lib/api';

interface CVPreviewProps {
  scale: number;
  setScale: React.Dispatch<React.SetStateAction<number>>;
  sourceRef: React.RefObject<HTMLDivElement>;
  targetRef: React.RefObject<HTMLDivElement>;
  templateId: string;
  adapterData: any;
  templateConfig: any;
}

export function CVPreview({
  scale,
  setScale,
  sourceRef,
  targetRef,
  templateId,
  adapterData,
  templateConfig
}: CVPreviewProps) {
  const [contentHeight, setContentHeight] = React.useState(0);

  React.useEffect(() => {
    if (!targetRef.current) return;
    
    // We observe the targetRef to know exactly how tall the generated CV pages are
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setContentHeight(entries[0].contentRect.height);
      }
    });
    
    observer.observe(targetRef.current);
    return () => observer.disconnect();
  }, [targetRef]);

  return (
    <div className="rounded-3xl p-4 sm:p-8 flex flex-col items-center h-full min-h-[600px] border border-gray-200 relative overflow-auto custom-scrollbar" style={{ background: 'radial-gradient(circle, #d1d5db 1px, #f8f9fa 1px)', backgroundSize: '20px 20px' }}>

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-full shadow-sm border border-gray-200 flex items-center p-1">
        <button
          onClick={() => setScale(s => Math.max(0.3, s - 0.1))}
          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors focus:outline-none text-gray-500"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-xs font-bold text-gray-900 w-12 text-center cursor-default select-none">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => setScale(s => Math.min(2, s + 0.1))}
          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors focus:outline-none text-gray-500"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>

      {/* Document Container */}
      <div
        className="relative mt-8 mb-8 transition-all duration-200"
        style={{
          width: `calc(210mm * ${scale})`,
          height: contentHeight > 0 ? contentHeight * scale : undefined,
          transformOrigin: 'top center',
        }}
      >
        <div
          className="origin-top-left transition-transform duration-200"
          style={{
            width: '210mm',
            transform: `scale(${scale})`,
          }}
        >

          {/* SOURCE: Hidden off-screen so PageFlow can measure it */}
          <div
            ref={sourceRef}
            className="print-container absolute opacity-0 pointer-events-none"
            style={{ width: '210mm', left: '-9999px', top: 0 }}
          >
            <Suspense fallback={<div className="h-full w-full flex items-center justify-center text-gray-500 font-semibold bg-white">Chargement du modèle...</div>}>
              <CVTemplateRenderer
                templateName={templateId}
                data={adapterData as any}
                config={templateConfig as any}
                apiBaseUrl={API_BASE}
              />
            </Suspense>
          </div>

          {/* TARGET: Where PageFlow injects the generated pages */}
          <div ref={targetRef} className="pageflow-output" />

        </div>
      </div>
    </div>
  );
}
