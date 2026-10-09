import React from 'react';

// Lightweight CSS representations of the templates instead of heavy DOM rendering
export const ThemeThumbnail = ({ templateId }: { templateId: string }) => {
  // Different wireframe layouts based on the template
  switch (templateId) {
    case 'moderne':
      return (
        <div className="w-full h-full bg-white shadow-sm rounded-lg flex overflow-hidden border border-border">
          <div className="w-[35%] bg-indigo-900 h-full p-2 flex flex-col gap-1.5">
            <div className="w-8 h-8 rounded-full bg-white/20 self-center mb-1" />
            <div className="w-full h-1 bg-white/40 rounded-full" />
            <div className="w-3/4 h-1 bg-white/20 rounded-full mb-2" />
            <div className="w-full h-0.5 bg-white/20 rounded-full" />
            <div className="w-5/6 h-0.5 bg-white/20 rounded-full" />
          </div>
          <div className="flex-1 p-2 flex flex-col gap-1.5">
            <div className="w-1/3 h-1.5 bg-indigo-900/20 rounded-full mb-1" />
            <div className="w-full h-0.5 bg-border rounded-full" />
            <div className="w-5/6 h-0.5 bg-border rounded-full" />
            <div className="w-4/6 h-0.5 bg-border rounded-full mb-1" />
            <div className="w-1/3 h-1.5 bg-indigo-900/20 rounded-full mb-1" />
            <div className="w-full h-0.5 bg-border rounded-full" />
            <div className="w-full h-0.5 bg-border rounded-full" />
          </div>
        </div>
      );
    case 'tokyo':
      return (
        <div className="w-full h-full bg-white shadow-sm rounded-lg flex flex-col overflow-hidden border border-border">
          <div className="h-[25%] bg-rose-700 w-full p-2 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex-shrink-0" />
            <div className="flex flex-col gap-1 flex-1">
              <div className="w-1/2 h-1.5 bg-white/60 rounded-full" />
              <div className="w-1/3 h-1 bg-white/30 rounded-full" />
            </div>
          </div>
          <div className="flex-1 p-2 flex flex-col gap-1.5">
            <div className="w-1/4 h-1.5 bg-rose-700/20 rounded-full mb-1" />
            <div className="w-full h-0.5 bg-border rounded-full" />
            <div className="w-5/6 h-0.5 bg-border rounded-full mb-1" />
            <div className="w-1/4 h-1.5 bg-rose-700/20 rounded-full mb-1" />
            <div className="w-full h-0.5 bg-border rounded-full" />
            <div className="w-4/5 h-0.5 bg-border rounded-full" />
          </div>
        </div>
      );
    case 'dakar':
      return (
        <div className="w-full h-full bg-white shadow-sm rounded-lg flex overflow-hidden border border-border">
          <div className="flex-1 p-2 flex flex-col gap-1.5">
            <div className="w-1/3 h-2 bg-amber-600/30 rounded-full mb-2" />
            <div className="w-1/4 h-1.5 bg-amber-600/20 rounded-full mb-1" />
            <div className="w-full h-0.5 bg-border rounded-full" />
            <div className="w-5/6 h-0.5 bg-border rounded-full mb-1" />
            <div className="w-1/4 h-1.5 bg-amber-600/20 rounded-full mb-1" />
            <div className="w-full h-0.5 bg-border rounded-full" />
            <div className="w-3/4 h-0.5 bg-border rounded-full" />
          </div>
          <div className="w-[30%] bg-amber-50 h-full p-2 border-l border-amber-100 flex flex-col gap-1.5">
             <div className="w-full h-1 bg-amber-600/40 rounded-full mb-1" />
             <div className="w-3/4 h-0.5 bg-amber-600/20 rounded-full" />
             <div className="w-full h-0.5 bg-amber-600/20 rounded-full" />
          </div>
        </div>
      );
    default:
      // Classique & others
      return (
        <div className="w-full h-full bg-white shadow-sm rounded-lg flex flex-col p-3 border border-border">
          <div className="w-1/2 h-2 bg-gray-800 rounded-full mb-3 self-center" />
          <div className="w-1/3 h-1.5 bg-gray-300 rounded-full mb-2" />
          <div className="w-full h-0.5 bg-border rounded-full mb-1" />
          <div className="w-5/6 h-0.5 bg-border rounded-full mb-3" />
          <div className="w-1/3 h-1.5 bg-gray-300 rounded-full mb-2" />
          <div className="w-full h-0.5 bg-border rounded-full mb-1" />
          <div className="w-4/6 h-0.5 bg-border rounded-full" />
        </div>
      );
  }
};
