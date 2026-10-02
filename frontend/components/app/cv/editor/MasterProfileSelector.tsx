"use client";

import { useState } from 'react';
import { useProfileStore } from '@/store/profile';
import { useEditorStore } from '@/store/editor';

export default function MasterProfileSelector({ type }: { type: 'experience' | 'education' }) {
  const { profile } = useProfileStore();
  const { data, setData } = useEditorStore();
  const [isOpen, setIsOpen] = useState(false);

  if (!profile) return null;

  const items = type === 'experience' ? profile.experiences : profile.educations;
  
  if (!items || items.length === 0) return null;

  const handleImport = (item: any) => {
    const currentList = data?.[type] || [];
    
    // Convert MasterProfile item to Resume format
    let newItem: any = {};
    if (type === 'experience') {
      newItem = {
        id: item.id,
        company: item.company,
        role: item.title,
        position: item.title,
        start: item.start_date || '',
        end: item.end_date || (item.current ? 'Présent' : ''),
        bullets: item.description ? item.description.split('\n') : []
      };
    } else {
      newItem = {
        id: item.id,
        institution: item.school,
        degree: item.degree,
        start: item.start_date || '',
        end: item.end_date || ''
      };
    }

    setData({
      ...data,
      [type]: [...currentList, newItem]
    } as any);

    
    setIsOpen(false);
  };

  return (
    <div className="mb-4">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed border-blue-300 text-blue-600 bg-blue-50 hover:bg-blue-100 text-xs font-bold transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 10v2m0 0v2m0-2h2m-2 0H9" /></svg>
          IMPORTER DEPUIS MON PROFIL MASTER
        </button>
      ) : (
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-bold text-blue-800 uppercase">Sélectionner un élément</h4>
            <button onClick={() => setIsOpen(false)} className="text-blue-500 hover:text-blue-700">Fermer</button>
          </div>
          <div className="space-y-2">
            {items.map((item: any) => (
              <div 
                key={item.id} 
                onClick={() => handleImport(item)}
                className="bg-white p-3 rounded shadow-sm cursor-pointer hover:border-blue-500 border border-transparent transition-all"
              >
                <p className="font-bold text-sm text-gray-900">{type === 'experience' ? item.title : item.degree}</p>
                <p className="text-xs text-gray-500">{type === 'experience' ? item.company : item.school}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
