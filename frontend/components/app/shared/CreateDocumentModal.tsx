'use client';

import { useUiStore } from '@/store/ui';
import { useCvStore } from '@/store/cv';
import { useRouter } from 'next/navigation';
import { FileText, LayoutTemplate, X, BookOpen, Layers, Briefcase, FileBadge } from 'lucide-react';
import { useState } from 'react';

const DOC_TYPES = [
  { id: 'cv', icon: FileText, label: 'CV', desc: 'Votre CV complet', active: true },
  { id: 'cover_letter', icon: FileBadge, label: 'Lettre de motivation', desc: 'Accompagnez votre CV', active: false },
  { id: 'portfolio', icon: Layers, label: 'Portfolio', desc: 'Présentez vos projets', active: false },
  { id: 'profile', icon: BookOpen, label: 'Profil pro', desc: 'Document de synthèse', active: false },
  { id: 'presentation', icon: LayoutTemplate, label: 'Présentation', desc: 'Slides personnalisés', active: false },
  { id: 'other', icon: Briefcase, label: 'Autre', desc: 'Document sur mesure', active: false },
];

export default function CreateDocumentModal() {
  const { isCreateModalOpen, closeCreateModal } = useUiStore();
  const { addCv } = useCvStore();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  if (!isCreateModalOpen) return null;

  const handleCreateCv = () => {
    closeCreateModal();
    router.push('/mes-documents/create/cv');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" 
        onClick={closeCreateModal}
      />
      
      {/* Modal Content */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden z-10 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Que voulez-vous créer ?</h2>
            <p className="text-sm text-gray-500 mt-1">Choisissez le type de document à générer à partir de votre profil.</p>
          </div>
          <button 
            onClick={closeCreateModal}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DOC_TYPES.map(doc => {
              const Icon = doc.icon;
              return (
                <button
                  key={doc.id}
                  disabled={!doc.active || isCreating}
                  onClick={doc.id === 'cv' ? handleCreateCv : undefined}
                  className={`
                    flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all text-center group relative
                    ${doc.active 
                      ? 'border-gray-200 hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-600/10 bg-white cursor-pointer' 
                      : 'border-gray-100 bg-gray-50/50 opacity-60 cursor-not-allowed'
                    }
                  `}
                >
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors
                    ${doc.active ? 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white' : 'bg-gray-200 text-gray-400'}
                  `}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className={`font-semibold mb-1 ${doc.active ? 'text-gray-900' : 'text-gray-500'}`}>
                    {doc.label}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2">
                    {doc.desc}
                  </p>
                  
                  {!doc.active && (
                    <span className="absolute top-3 right-3 text-[10px] font-bold tracking-wider uppercase text-gray-400 bg-gray-200/50 px-2 py-0.5 rounded-full">
                      Bientôt
                    </span>
                  )}
                  
                  {doc.id === 'cv' && isCreating && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
