import React from 'react';
import { AIAssistant } from '@/components/app/shared/AIAssistant';
import { LetterData } from '../types';
import { API_BASE } from '@/lib/api';

interface AILetterGeneratorProps {
  session: any;
  cv: any;
  formData: LetterData['formData'];
  setFormData: React.Dispatch<React.SetStateAction<LetterData['formData']>>;
  updateCv: (id: string, updates: any) => void;
  setActiveTab: (tab: 'content' | 'design' | 'ai') => void;
}

export function AILetterGenerator({ session, cv, formData, setFormData, updateCv, setActiveTab }: AILetterGeneratorProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Assistant IA</h3>
        
        <AIAssistant 
          placeholder="Ex: Je postule pour un poste de Développeur chez Google. Voici l'offre : ..."
          buttonText="Rédiger la lettre"
          onGenerate={async (prompt) => {
            if (!session?.user?.accessToken || !cv) return;
            const res = await fetch(`${API_BASE}/ai/generate-cover-letter`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.user.accessToken}`
              },
              body: JSON.stringify({ 
                job_description: prompt, 
                recipient_name: formData.recipientName, 
                company_name: formData.companyName 
              })
            });
            
            if (!res.ok) {
              const errText = await res.text();
              throw new Error(errText || "Erreur lors de la génération");
            }
            const data = await res.json();
            
            const newSubject = data.subject || formData.subject;
            const newSalutation = data.salutation || formData.salutation;
            const newBody = data.body || formData.body;
            const newClosing = data.closing || formData.closing;

            setFormData(prev => ({
              ...prev,
              subject: newSubject,
              salutation: newSalutation,
              body: newBody,
              closing: newClosing
            }));
            
            try {
              const { cvApi } = await import('@/lib/cv-api');
              const updated = await cvApi.updateResume(session.user.accessToken, cv.id, {
                title: formData.title,
                content: {
                  recipient: {
                    name: formData.recipientName,
                    company: formData.companyName,
                    address: formData.recipientAddress,
                  },
                  subject: newSubject,
                  salutation: newSalutation,
                  body: newBody,
                  closing: newClosing,
                }
              });
              updateCv(updated.id, updated);
            } catch (saveErr) {
              console.error("Erreur lors de la sauvegarde automatique:", saveErr);
            }
            setActiveTab('content');
          }}
        />
      </div>
    </div>
  );
}
