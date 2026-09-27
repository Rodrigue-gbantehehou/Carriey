'use client';

import { useUiStore } from '@/store/ui';
import { useCvStore } from '@/store/cv';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FileText, LayoutTemplate, X, BookOpen, Layers, Briefcase, FileBadge } from 'lucide-react';
import { useState } from 'react';

const DOC_TYPES = [
  { id: 'cv', icon: FileText, label: 'CV', desc: 'Votre CV complet', active: true },
  { id: 'cover_letter', icon: FileBadge, label: 'Lettre de motivation', desc: 'Accompagnez votre CV', active: true },
  { id: 'portfolio', icon: Layers, label: 'Portfolio', desc: 'Présentez vos projets', active: false },
  { id: 'profile', icon: BookOpen, label: 'Profil public', desc: 'Page personnelle en ligne', active: true },
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

  const handleCreateCoverLetter = () => {
    closeCreateModal();
    router.push('/mes-documents/create/lettre');
  };

  const handleCreateProfile = () => {
    closeCreateModal();
    router.push('/mes-documents/create/page-publique');
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
        onClick={closeCreateModal}
      />

      {/* Modal — bottom sheet on mobile, centered card on sm+ */}
      <div className="relative bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-3xl shadow-2xl z-10 overflow-hidden">

        {/* Drag handle (mobile only) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Que voulez-vous créer ?</h2>
            <p className="text-xs text-gray-500 mt-0.5">Choisissez le type de document à générer.</p>
          </div>
          <button
            onClick={closeCreateModal}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors ml-4 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grid */}
        <div className="p-4 pb-8 sm:pb-6">
          <div className="grid grid-cols-3 gap-3">
            {DOC_TYPES.map(doc => {
              const Icon = doc.icon;
              return (
                <button
                  key={doc.id}
                  disabled={!doc.active || isCreating}
                  onClick={
                    doc.id === 'cv' ? handleCreateCv : 
                    doc.id === 'profile' ? handleCreateProfile : 
                    doc.id === 'cover_letter' ? handleCreateCoverLetter : undefined
                  }
                  className={`
                    flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all text-center group relative
                    ${doc.active
                      ? 'border-gray-200 hover:border-indigo-600 hover:shadow-md hover:shadow-indigo-600/10 bg-white cursor-pointer'
                      : 'border-gray-100 bg-gray-50/50 opacity-50 cursor-not-allowed'
                    }
                  `}
                >
                  <div className={`
                    w-9 h-9 rounded-full flex items-center justify-center mb-2 transition-colors
                    ${doc.active ? 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white' : 'bg-gray-200 text-gray-400'}
                  `}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className={`text-xs font-bold leading-tight ${doc.active ? 'text-gray-900' : 'text-gray-500'}`}>
                    {doc.label}
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-2 hidden sm:block">
                    {doc.desc}
                  </p>

                  {!doc.active && (
                    <span className="absolute top-2 right-2 text-[9px] font-bold uppercase text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                      Bientôt
                    </span>
                  )}

                  {doc.id === 'cv' && isCreating && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
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
