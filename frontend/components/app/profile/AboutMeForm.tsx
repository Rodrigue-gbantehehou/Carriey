"use client";

import { useState, useEffect } from 'react';
import BottomSheet from '@/components/app/shared/BottomSheet';
import { useProfileStore } from '@/store/profile';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';

interface AboutMeFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutMeForm({ isOpen, onClose }: AboutMeFormProps) {
  const { profile, updateProfile } = useProfileStore();
  const [aboutForm, setAboutForm] = useState<string>('');

  useEffect(() => {
    if (isOpen && profile) {
      setAboutForm(profile.bio || '');
    }
  }, [isOpen, profile]);

  const handleSave = () => {
    updateProfile({ bio: aboutForm });
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="À propos de moi">
        <div className="space-y-5 pb-6">
          <div>
            <Textarea 
              label="Présentez-vous en quelques mots"
              rows={8} 
              autoFocus
              value={aboutForm} 
              onChange={e => setAboutForm(e.target.value)}
              placeholder="Votre parcours, ce que vous aimez faire, vos soft-skills, vos objectifs…"
            />
            <p className="mt-2 text-[10px] text-text-muted flex justify-between font-medium">
              <span>{aboutForm.length} caractères</span>
              <span>Recommandé : 150 - 300</span>
            </p>
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
