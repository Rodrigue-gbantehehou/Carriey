'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCvStore } from '@/store/cv';
import { cvApi } from '@/lib/cv-api';
import { API_BASE } from '@/lib/api';
import { Sparkles, FileText, ChevronRight, ChevronLeft, Briefcase, Link as LinkIcon, AlignLeft, Building2 } from 'lucide-react';
import { candidaturesApi } from '@/lib/candidature-api';

function CreateCoverLetterWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { addCv, cvs } = useCvStore();

  // Logic pour le template par défaut : URL -> Dernière lettre modifiée -> 'classique'
  const recentLetters = cvs.filter(c => c.doc_type === 'cover_letter')
    .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime());
  const defaultTemplate = recentLetters.length > 0 ? recentLetters[0].template_id : 'classique';
  const templateSlug = searchParams.get('template') || defaultTemplate;

  const [step, setStep] = useState(1);
  const [method, setMethod] = useState<'ai' | 'manual' | null>(null);
  
  // Form state
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);


  const handleGenerate = async () => {
    if (!session?.user?.accessToken) return;
    
    setIsGenerating(true);

    try {
      let generatedSubject = jobTitle ? `Candidature : ${jobTitle}` : 'Candidature';
      let generatedSalutation = 'Madame, Monsieur,';
      let generatedBody = '';
      let generatedClosing = "Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.";
      let extractedCompany = companyName;
      let extractedTitle = jobTitle;
      let extractedLocation = '';

      if (method === 'ai') {
        setGenerationStep(1); // Analyse du profil
        
        const textToAnalyze = jobDescription || jobTitle || "Candidature spontanée";
        
        // Execute the letter generation and the job extraction in parallel
        const [letterRes, extractRes] = await Promise.all([
          fetch(`${API_BASE}/ai/generate-cover-letter`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.user.accessToken}` },
            body: JSON.stringify({ job_description: textToAnalyze })
          }),
          fetch(`${API_BASE}/ai/extract-job`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.user.accessToken}` },
            body: JSON.stringify({ job_text: textToAnalyze })
          }).catch(() => null) // Ignore extract errors so it doesn't block the letter
        ]);
        
        setGenerationStep(2); // Analyse de l'offre
        if (letterRes.ok) {
          const data = await letterRes.json();
          if (data.subject) generatedSubject = data.subject;
          if (data.salutation) generatedSalutation = data.salutation;
          if (data.body) generatedBody = data.body;
          if (data.closing) generatedClosing = data.closing;
          
          if (extractRes && extractRes.ok) {
            const extractData = await extractRes.json();
            if (extractData.companyName && extractData.companyName !== "Non précisé") extractedCompany = extractData.companyName;
            if (extractData.jobTitle && extractData.jobTitle !== "Non précisé") extractedTitle = extractData.jobTitle;
            if (extractData.location && extractData.location !== "Non précisé") extractedLocation = extractData.location;
          }
          
          setGenerationStep(3); // Rédaction terminée
        } else {
          const errText = await letterRes.text();
          console.error("Erreur de l'API IA", errText);
          setIsGenerating(false);
          alert("Erreur lors de la génération IA : " + errText);
          return; // On arrête la création si l'IA échoue
        }
      }

      const newLetter = await cvApi.createResume(session.user.accessToken, {
        title: extractedTitle ? `Lettre - ${extractedTitle}` : 'Nouvelle lettre de motivation',
        doc_type: 'cover_letter',
        template_id: templateSlug,
        content: {
          recipient: {
            name: '',
            company: extractedCompany || '',
            address: ''
          },
          subject: generatedSubject,
          salutation: generatedSalutation,
          body: generatedBody,
          closing: generatedClosing
        }
      });
      
      // Bonus: Create Candidature automatically
      try {
        if (extractedCompany || extractedTitle) {
          await candidaturesApi.create({
            company: extractedCompany || 'Entreprise Inconnue',
            role: extractedTitle || 'Candidature',
            location: extractedLocation || '',
            status: 'envoyee',
            applied_date: new Date().toISOString().split('T')[0]
          }, session.user.accessToken);
        }
      } catch (err) {
        console.error("Erreur création candidature auto:", err);
      }
      
      addCv(newLetter);
      router.replace(`/mes-documents/lettre/${newLetter.id}`);
      
    } catch (error) {
      console.error("Erreur lors de la création de la lettre:", error);
      setIsGenerating(false);
      alert("Une erreur est survenue.");
    }
  };

  if (isGenerating) {
    const steps = [
      "Initialisation...",
      "Analyse de votre Master Profile...",
      "Analyse de l'offre d'emploi...",
      "Rédaction de la lettre sur-mesure...",
    ];

    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute inset-0 border-2 border-indigo-100 rounded-full" />
          <div className="absolute inset-0 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            {method === 'ai' ? <Sparkles className="w-6 h-6 text-indigo-600 animate-pulse" /> : <FileText className="w-6 h-6 text-indigo-600" />}
          </div>
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Préparation en cours</h2>
        <p className="text-sm text-gray-500 animate-pulse">
          {method === 'ai' ? steps[generationStep] : "Création du document..."}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-12 pb-24">
      {/* Header Minimaliste */}
      <div className="mb-6 sm:mb-8 text-center">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Nouvelle lettre</h1>
        <p className="text-sm text-gray-500 mt-1">Personnalisez votre candidature</p>
      </div>

      <div className="bg-white sm:rounded-3xl sm:shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:border border-gray-100 overflow-hidden">
        
        {step === 1 && (
          <div className="p-4 sm:p-8">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-6 text-center">Comment voulez-vous commencer ?</h2>

            <div className="flex flex-col gap-3">
              {/* Option IA */}
              <button
                onClick={() => { setMethod('ai'); setStep(2); }}
                className="group flex items-center gap-4 p-4 sm:p-5 rounded-2xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 transition-all text-left relative overflow-hidden active:scale-[0.98]"
              >
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-bold text-indigo-900 truncate">Cibler une offre</h3>
                    <span className="bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">IA</span>
                  </div>
                  <p className="text-xs text-indigo-700/70 line-clamp-2">
                    L'IA analyse vos expériences et rédige une lettre sur-mesure.
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform flex-shrink-0 hidden sm:block" />
              </button>

              {/* Option Manuelle */}
              <button
                onClick={() => { setMethod('manual'); setStep(2); }}
                className="group flex items-center gap-4 p-4 sm:p-5 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all text-left active:scale-[0.98]"
              >
                <div className="w-10 h-10 bg-gray-50 group-hover:bg-white border border-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                  <FileText className="w-5 h-5 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 mb-0.5 truncate">Candidature spontanée</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    Structure vide. Vous rédigez vous-même le contenu.
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-transform flex-shrink-0 hidden sm:block" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && method === 'ai' && (
          <div className="p-4 sm:p-8">
            <button onClick={() => setStep(1)} className="flex items-center text-xs text-gray-500 hover:text-gray-900 font-semibold mb-6 transition-colors">
              <ChevronLeft className="w-3 h-3 mr-1" /> Retour
            </button>
            
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Génération intelligente</h2>
                <p className="text-xs text-gray-500">Collez le lien ou le texte de l'offre.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 ml-1">Poste visé (Optionnel)</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    placeholder="Ex: Développeur React"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 ml-1">Lien ou description</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-3 flex gap-2">
                    <AlignLeft className="w-4 h-4 text-gray-400" />
                  </div>
                  <textarea
                    rows={5}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-colors"
                    placeholder="Collez ici le lien ou le texte de l'offre..."
                  />
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                disabled={!jobDescription && !jobTitle}
                onClick={handleGenerate}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/10 disabled:opacity-50 disabled:shadow-none active:scale-[0.98]"
              >
                Générer ma lettre <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && method === 'manual' && (
          <div className="p-4 sm:p-8">
            <button onClick={() => setStep(1)} className="flex items-center text-xs text-gray-500 hover:text-gray-900 font-semibold mb-6 transition-colors">
              <ChevronLeft className="w-3 h-3 mr-1" /> Retour
            </button>
            
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Candidature spontanée</h2>
                <p className="text-xs text-gray-500">Informations de base</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 ml-1">Poste visé</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    placeholder="Ex: Chef de Projet Digital"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 ml-1">Entreprise ciblée</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    placeholder="Ex: L'Oréal Paris"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={handleGenerate}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors shadow-md active:scale-[0.98]"
              >
                Créer le brouillon <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function CreateCoverLetterWizard() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center text-gray-500">Chargement...</div>}>
      <CreateCoverLetterWizardContent />
    </Suspense>
  );
}
