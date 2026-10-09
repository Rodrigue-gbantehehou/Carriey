"use client";

import { useState } from 'react';
import { useProfileStore } from '@/store/profile';
import { Plus, Trash2, LayoutList } from 'lucide-react';
import { CustomSectionItem } from '@/types/profile';
import BottomSheet from '@/components/app/shared/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { TextList } from '@/components/ui/TextList';

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
        <div key={section.id || `sec-${index}`} className="bg-background border border-border rounded-panel overflow-hidden shadow-sm">
          {/* Section Header */}
          <div className="bg-background-subtle border-b border-border px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-background border border-border text-primary flex items-center justify-center">
                <LayoutList className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-text-primary">{section.title}</h3>
            </div>
            <button onClick={() => removeCustomSection(section.id)} className="text-text-muted hover:text-danger-text transition-colors p-2 rounded-button hover:bg-danger-bg">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Section Items */}
          <div className="p-5 space-y-4">
            {!section.items || section.items.length === 0 ? (
              <p className="text-ui-sm text-text-muted text-center py-4">Aucun élément dans cette section.</p>
            ) : (
              section.items.map((item: any, i: number) => (
                <div key={item.id || `item-${i}`} className="group relative border border-border bg-background rounded-panel p-4 hover:border-primary transition-colors">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-text-primary text-ui-base">{item.title}</h4>
                      {item.subtitle && <p className="text-ui-sm text-primary font-medium mt-0.5">{item.subtitle}</p>}
                      {item.date && <p className="text-ui-xs font-semibold text-text-secondary bg-background-subtle border border-border px-2 py-1 rounded-md inline-block mt-2">{item.date}</p>}
                      {item.description && <TextList text={item.description} className="text-ui-sm text-text-secondary mt-2 leading-relaxed" />}
                    </div>
                    <button onClick={() => removeCustomSectionItem(section.id, item.id)} className="text-text-muted hover:text-danger-text hover:bg-danger-bg p-1.5 rounded-button opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}

            <Button variant="ghost" fullWidth leftIcon={<Plus className="w-4 h-4" />} onClick={() => openAddItem(section.id)} className="mt-2 border border-dashed border-border">
              Ajouter un élément à "{section.title}"
            </Button>
          </div>
        </div>
      ))}

      {/* Add New Section Button */}
      <Button variant="secondary" fullWidth leftIcon={<Plus className="w-5 h-5" />} onClick={() => setIsAddingSection(true)} className="py-6 border-dashed border-2">
        Créer une nouvelle section personnalisée
      </Button>

      {/* Modal: Create Section */}
      <BottomSheet isOpen={isAddingSection} onClose={() => setIsAddingSection(false)} title="Nouvelle section">
        <div className="space-y-5 pb-6">
          <Input
            label="Nom de la section (ex: Bénévolat, Publications...) *"
            value={sectionForm.title}
            onChange={e => setSectionForm({...sectionForm, title: e.target.value})}
            placeholder="Ex : Engagements associatifs"
            autoFocus
          />
          <div className="pt-4">
            <Button fullWidth onClick={handleCreateSection} disabled={!sectionForm.title}>
              Créer la section
            </Button>
          </div>
        </div>
      </BottomSheet>

      {/* Modal: Create Item */}
      <BottomSheet isOpen={isAddingItem} onClose={() => setIsAddingItem(false)} title="Ajouter un élément">
        <div className="space-y-5 pb-6 max-h-[80vh] overflow-y-auto px-1">
          <Input
            label="Titre *"
            value={itemForm.title || ''}
            onChange={e => setItemForm({...itemForm, title: e.target.value})}
            placeholder="Titre principal..."
            autoFocus
          />
          <Input
            label="Sous-titre (Optionnel)"
            value={itemForm.subtitle || ''}
            onChange={e => setItemForm({...itemForm, subtitle: e.target.value})}
            placeholder="Institution, organisme, rôle..."
          />
          <Input
            label="Période ou Date (Optionnel)"
            value={itemForm.date || ''}
            onChange={e => setItemForm({...itemForm, date: e.target.value})}
            placeholder="Ex: 2021 - 2023"
          />
          <Textarea
            label="Description (Optionnel)"
            value={itemForm.description || ''}
            onChange={e => setItemForm({...itemForm, description: e.target.value})}
            rows={4}
            placeholder="Décrivez en détail..."
          />
          
          <div className="pt-4">
            <Button fullWidth onClick={handleCreateItem} disabled={!itemForm.title}>
              Enregistrer
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
