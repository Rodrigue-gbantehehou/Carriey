"use client";

import { useState, useEffect } from 'react';
import BottomSheet from '@/components/app/shared/BottomSheet';
import { useProfileStore } from '@/store/profile';

const inputClass = "block w-full rounded-xl border border-gray-200 bg-white py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all";

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
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom</label><input type="text" value={personalForm.first_name || ''} onChange={e => setPersonalForm({...personalForm, first_name: e.target.value})} placeholder="Jean" className={inputClass} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label><input type="text" value={personalForm.last_name || ''} onChange={e => setPersonalForm({...personalForm, last_name: e.target.value})} placeholder="Dupont" className={inputClass} /></div>
          </div>
          
          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Métier ou titre</label><input type="text" value={personalForm.title || ''} onChange={e => setPersonalForm({...personalForm, title: e.target.value})} placeholder="Ex : Infirmière, Développeur…" className={inputClass} /></div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Email de contact</label><input type="email" value={personalForm.contact_email || ''} onChange={e => setPersonalForm({...personalForm, contact_email: e.target.value})} className={inputClass} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label><input type="tel" value={personalForm.contact_phone || ''} onChange={e => setPersonalForm({...personalForm, contact_phone: e.target.value})} className={inputClass} /></div>
            <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1.5">Ville / Pays</label><input type="text" value={personalForm.location || ''} onChange={e => setPersonalForm({...personalForm, location: e.target.value})} placeholder="Paris, France" className={inputClass} /></div>
          </div>
          
          <div className="border-t border-gray-100 pt-5 mt-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Liens professionnels</p>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">LinkedIn</label><input type="url" value={personalForm.linkedin_url || ''} onChange={e => setPersonalForm({...personalForm, linkedin_url: e.target.value})} placeholder="https://linkedin.com/in/..." className={inputClass} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Portfolio / Site web</label><input type="url" value={personalForm.website || ''} onChange={e => setPersonalForm({...personalForm, website: e.target.value})} placeholder="https://..." className={inputClass} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">GitHub</label><input type="url" value={personalForm.github_url || ''} onChange={e => setPersonalForm({...personalForm, github_url: e.target.value})} placeholder="https://github.com/..." className={inputClass} /></div>
            </div>
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
