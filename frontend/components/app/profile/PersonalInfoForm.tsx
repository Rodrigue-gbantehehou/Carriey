"use client";

import { useState, useEffect } from 'react';
import BottomSheet from '@/components/app/shared/BottomSheet';
import { useProfileStore } from '@/store/profile';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

interface PersonalInfoFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PersonalInfoForm({ isOpen, onClose }: PersonalInfoFormProps) {
  const { profile, updateProfile } = useProfileStore();
  const [personalForm, setPersonalForm] = useState<any>({});

  useEffect(() => {
    if (isOpen && profile) {
      setPersonalForm({
        first_name: profile.first_name,
        last_name: profile.last_name,
        title: profile.title,
        username: profile.username,
        contact_email: profile.contact_email,
        contact_phone: profile.contact_phone,
        location: profile.location,
        linkedin_url: profile.linkedin_url,
        website: profile.website,
        github_url: profile.github_url,
        visibility: profile.visibility || 'private',
        show_email: profile.show_email ?? false,
        show_phone: profile.show_phone ?? false,
      });
    }
  }, [isOpen, profile]);

  const handleSave = () => {
    updateProfile(personalForm);
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Modifier mes informations">
        <div className="space-y-5 pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Prénom" value={personalForm.first_name || ''} onChange={e => setPersonalForm({...personalForm, first_name: e.target.value})} placeholder="Jean" />
            <Input label="Nom" value={personalForm.last_name || ''} onChange={e => setPersonalForm({...personalForm, last_name: e.target.value})} placeholder="Dupont" />
          </div>
          
          <Input label="Métier ou titre" value={personalForm.title || ''} onChange={e => setPersonalForm({...personalForm, title: e.target.value})} placeholder="Ex : Infirmière, Développeur…" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input type="email" label="Email de contact" value={personalForm.contact_email || ''} onChange={e => setPersonalForm({...personalForm, contact_email: e.target.value})} />
            <Input type="tel" label="Téléphone" value={personalForm.contact_phone || ''} onChange={e => setPersonalForm({...personalForm, contact_phone: e.target.value})} />
            <div className="sm:col-span-2">
              <Input label="Ville / Pays" value={personalForm.location || ''} onChange={e => setPersonalForm({...personalForm, location: e.target.value})} placeholder="Paris, France" />
            </div>
          </div>
          
          <div className="border-t border-border pt-5 mt-5">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wide mb-3">Liens professionnels</p>
            <div className="space-y-4">
              <Input type="url" label="LinkedIn" value={personalForm.linkedin_url || ''} onChange={e => setPersonalForm({...personalForm, linkedin_url: e.target.value})} placeholder="https://linkedin.com/in/..." />
              <Input type="url" label="Portfolio / Site web" value={personalForm.website || ''} onChange={e => setPersonalForm({...personalForm, website: e.target.value})} placeholder="https://..." />
              <Input type="url" label="GitHub" value={personalForm.github_url || ''} onChange={e => setPersonalForm({...personalForm, github_url: e.target.value})} placeholder="https://github.com/..." />
            </div>
          </div>
          
          <div className="border-t border-border pt-5 mt-5">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wide mb-3">Confidentialité</p>
            <div className="space-y-4">
              <Select
                label="Visibilité du profil public"
                value={personalForm.visibility || 'private'}
                onChange={e => setPersonalForm({...personalForm, visibility: e.target.value})}
              >
                <option value="private">Privé (Désactivé)</option>
                <option value="public">Public (Indexable par les moteurs de recherche)</option>
                <option value="link_only">Lien uniquement (Non indexable)</option>
              </Select>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="show_email" checked={personalForm.show_email || false} onChange={e => setPersonalForm({...personalForm, show_email: e.target.checked})} className="w-4 h-4 text-primary rounded focus:ring-primary border-border" />
                <label htmlFor="show_email" className="text-ui-sm text-text-primary">Afficher mon adresse email sur mon profil public</label>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="show_phone" checked={personalForm.show_phone || false} onChange={e => setPersonalForm({...personalForm, show_phone: e.target.checked})} className="w-4 h-4 text-primary rounded focus:ring-primary border-border" />
                <label htmlFor="show_phone" className="text-ui-sm text-text-primary">Afficher mon numéro de téléphone sur mon profil public</label>
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <Button fullWidth onClick={handleSave}>
              Enregistrer
            </Button>
          </div>
        </div>
    </BottomSheet>
  );
}
