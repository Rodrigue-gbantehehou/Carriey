import React from 'react';
import { Save, Loader2, CheckCircle2 } from 'lucide-react';
import { LetterData } from '../types';

interface LetterFormProps {
  formData: LetterData['formData'];
  setFormData: React.Dispatch<React.SetStateAction<LetterData['formData']>>;
  onSave: () => void;
  isSaving: boolean;
  savedSuccess: boolean;
}

export function LetterForm({ formData, setFormData, onSave, isSaving, savedSuccess }: LetterFormProps) {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Destinataire</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Contact (Optionnel)</label>
            <input
              type="text"
              className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder:text-gray-400"
              value={formData.recipientName}
              onChange={(e) => setFormData({...formData, recipientName: e.target.value})}
              placeholder="Ex: M. le Directeur des Ressources Humaines"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Entreprise</label>
            <input
              type="text"
              className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder:text-gray-400"
              value={formData.companyName}
              onChange={(e) => setFormData({...formData, companyName: e.target.value})}
              placeholder="Ex: Google France"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Adresse</label>
            <textarea
              rows={2}
              className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-colors placeholder:text-gray-400"
              value={formData.recipientAddress}
              onChange={(e) => setFormData({...formData, recipientAddress: e.target.value})}
              placeholder="8 rue de Londres..."
            />
          </div>
        </div>
      </section>

      <div className="h-px bg-gray-100" />

      <section>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Contenu</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Objet</label>
            <input
              type="text"
              className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors font-medium"
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              placeholder="Objet de la candidature"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Appel</label>
            <input
              type="text"
              className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              value={formData.salutation}
              onChange={(e) => setFormData({...formData, salutation: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Corps de texte</label>
            <textarea
              rows={10}
              className="w-full text-sm px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-colors leading-relaxed custom-scrollbar"
              value={formData.body}
              onChange={(e) => setFormData({...formData, body: e.target.value})}
              placeholder="Commencez à rédiger votre lettre..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Politesse</label>
            <textarea
              rows={2}
              className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-colors"
              value={formData.closing}
              onChange={(e) => setFormData({...formData, closing: e.target.value})}
            />
          </div>
        </div>
      </section>
      
      <div className="pt-4 lg:hidden">
         <button
          onClick={onSave}
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl active:scale-95 transition-transform disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : savedSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Save className="w-4 h-4" />}
          {savedSuccess ? 'Sauvegardé' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
}
