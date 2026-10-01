"use client";

import { useState, useEffect } from 'react';
import BottomSheet from '@/components/app/shared/BottomSheet';
import { useProfileStore } from '@/store/profile';

const inputClass = "block w-full rounded-xl border border-gray-200 bg-white py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all";

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
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Présentez-vous en quelques mots</label>
            <textarea 
              rows={8} 
              autoFocus
              value={aboutForm} 
              onChange={e => setAboutForm(e.target.value)}
              placeholder="Votre parcours, ce que vous aimez faire, vos soft-skills, vos objectifs…"
              className={`${inputClass} resize-y text-base`} 
            />
            <p className="mt-2 text-xs text-gray-400 flex justify-between">
              <span>{aboutForm.length} caractères</span>
              <span>Recommandé : 150 - 300</span>
            </p>
          </div>
          
          <div className="pt-4">
            <button onClick={handleSave} className="w-full bg-indigo-600 text-white font-semibold py-3.5 px-4 rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all">
              Enregistrer
            </button>
          </div>
        </div>
    </BottomSheet>
  );
}
