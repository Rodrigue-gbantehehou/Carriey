"use client";

import { useState } from 'react';
import { useProfileStore } from '@/store/profile';
import { Plus, Trash2, LayoutList } from 'lucide-react';
import { CustomSectionItem } from '@/types/profile';
import BottomSheet from '@/components/app/shared/BottomSheet';

const inputClass = "block w-full rounded-xl border border-gray-200 bg-white py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all";

export function CustomSectionsList() {
  const { profile, addCustomSection, removeCustomSection, addCustomSectionItem, removeCustomSectionItem } = useProfileStore();
  const customSections = profile?.custom_sections || [];
  
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [sectionForm, setSectionForm] = useState<{ title: string; type: string }>({ title: '', type: 'detailed_list' });

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [itemForm, setItemForm] = useState<Partial<CustomSectionItem>>({});

  const handleCreateSection = () => {
    if (!sectionForm.title) return;
    addCustomSection({ title: sectionForm.title, type: sectionForm.type });
    setSectionForm({ title: '', type: 'detailed_list' });
    setIsAddingSection(false);
  };

  const handleCreateItem = () => {
    if (!activeSectionId || !itemForm.title) return;
    addCustomSectionItem(activeSectionId, {
      title: itemForm.title,
      subtitle: itemForm.subtitle || '',
      date: itemForm.date || '',
      description: itemForm.description || ''
    });
    setItemForm({});
    setIsAddingItem(false);
  };

  const openAddItem = (sectionId: string) => {
    setActiveSectionId(sectionId);
    setItemForm({});
    setIsAddingItem(true);
  };

  return (
    <div className="space-y-8">
      {customSections.map((section, index) => (
        <div key={section.id || `sec-${index}`} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          {/* Section Header */}
          <div className="bg-gray-50 border-b border-gray-200 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <LayoutList className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-gray-900">{section.title}</h3>
            </div>
            <button onClick={() => removeCustomSection(section.id)} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Section Items */}
          <div className="p-5 space-y-4">
            {!section.items || section.items.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Aucun élément dans cette section.</p>
            ) : (
              section.items.map((item: any, i: number) => (
                <div key={item.id || `item-${i}`} className="group relative border border-gray-100 rounded-xl p-4 hover:border-gray-300 transition-all">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-base">{item.title}</h4>
                      {item.subtitle && <p className="text-sm text-indigo-600 font-medium mt-0.5">{item.subtitle}</p>}
                      {item.date && <p className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-md inline-block mt-2">{item.date}</p>}
                      {item.description && <p className="text-sm text-gray-600 mt-2 leading-relaxed whitespace-pre-wrap">{item.description}</p>}
                    </div>
                    <button onClick={() => removeCustomSectionItem(section.id, item.id)} className="text-gray-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}

            <button onClick={() => openAddItem(section.id)} className="w-full py-3 mt-2 border-2 border-dashed border-gray-200 rounded-xl text-sm font-medium text-gray-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 flex items-center justify-center gap-2 transition-all">
              <Plus className="w-4 h-4" /> Ajouter un élément à "{section.title}"
            </button>
          </div>
        </div>
      ))}

      {/* Add New Section Button */}
      <button onClick={() => setIsAddingSection(true)} className="w-full py-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-700 font-semibold hover:bg-indigo-100 hover:border-indigo-200 transition-all flex items-center justify-center gap-2">
        <Plus className="w-5 h-5" /> Créer une nouvelle section personnalisée
      </button>

      {/* Modal: Create Section */}
      <BottomSheet isOpen={isAddingSection} onClose={() => setIsAddingSection(false)} title="Nouvelle section">
        <div className="space-y-5 pb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom de la section (ex: Bénévolat, Publications...) <span className="text-red-400">*</span></label>
            <input type="text" autoFocus value={sectionForm.title} onChange={e => setSectionForm({...sectionForm, title: e.target.value})} placeholder="Ex : Engagements associatifs" className={inputClass} />
          </div>
          <div className="pt-2">
            <button onClick={handleCreateSection} disabled={!sectionForm.title} className="w-full bg-indigo-600 text-white font-semibold py-3.5 px-4 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-md">
              Créer la section
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* Modal: Create Item */}
      <BottomSheet isOpen={isAddingItem} onClose={() => setIsAddingItem(false)} title="Ajouter un élément">
        <div className="space-y-5 pb-6 max-h-[80vh] overflow-y-auto px-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Titre <span className="text-red-400">*</span></label>
            <input type="text" autoFocus value={itemForm.title || ''} onChange={e => setItemForm({...itemForm, title: e.target.value})} placeholder="Titre principal..." className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Sous-titre (Optionnel)</label>
            <input type="text" value={itemForm.subtitle || ''} onChange={e => setItemForm({...itemForm, subtitle: e.target.value})} placeholder="Institution, organisme, rôle..." className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Période ou Date (Optionnel)</label>
            <input type="text" value={itemForm.date || ''} onChange={e => setItemForm({...itemForm, date: e.target.value})} placeholder="Ex: 2021 - 2023" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (Optionnel)</label>
            <textarea value={itemForm.description || ''} onChange={e => setItemForm({...itemForm, description: e.target.value})} rows={4} placeholder="Décrivez en détail..." className={inputClass} />
          </div>
          
          <div className="pt-2">
            <button onClick={handleCreateItem} disabled={!itemForm.title} className="w-full bg-indigo-600 text-white font-semibold py-3.5 px-4 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-md">
              Enregistrer
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
