import React from 'react';
import { Save, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
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
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Destinataire</h3>
        <div className="space-y-4">
          <Input
            label="Contact (Optionnel)"
            value={formData.recipientName}
            onChange={(e) => setFormData({...formData, recipientName: e.target.value})}
            placeholder="Ex: M. le Directeur des Ressources Humaines"
          />
          <Input
            label="Entreprise"
            value={formData.companyName}
            onChange={(e) => setFormData({...formData, companyName: e.target.value})}
            placeholder="Ex: Google France"
          />
          <Textarea
            label="Adresse"
            rows={2}
            value={formData.recipientAddress}
            onChange={(e) => setFormData({...formData, recipientAddress: e.target.value})}
            placeholder="8 rue de Londres..."
          />
        </div>
      </section>

      <div className="h-px bg-border" />

      <section>
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Contenu</h3>
        <div className="space-y-4">
          <Input
            label="Objet"
            value={formData.subject}
            onChange={(e) => setFormData({...formData, subject: e.target.value})}
            placeholder="Objet de la candidature"
          />
          <Input
            label="Appel"
            value={formData.salutation}
            onChange={(e) => setFormData({...formData, salutation: e.target.value})}
          />
          <Textarea
            label="Corps de texte"
            rows={10}
            className="leading-relaxed custom-scrollbar"
            value={formData.body}
            onChange={(e) => setFormData({...formData, body: e.target.value})}
            placeholder="Commencez à rédiger votre lettre..."
          />
          <Textarea
            label="Politesse"
            rows={2}
            value={formData.closing}
            onChange={(e) => setFormData({...formData, closing: e.target.value})}
          />
        </div>
      </section>
      
      <div className="pt-4 lg:hidden">
         <Button
          onClick={onSave}
          disabled={isSaving}
          isLoading={isSaving}
          variant="primary"
          fullWidth
          className="lg:hidden"
          leftIcon={savedSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Save className="w-4 h-4" />}
        >
          {savedSuccess ? 'Sauvegardé' : 'Enregistrer'}
        </Button>
      </div>
    </div>
  );
}
