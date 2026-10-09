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
        className="absolute inset-0 bg-text-primary/40 backdrop-blur-md transition-opacity"
        onClick={closeCreateModal}
      />

      {/* Modal — bottom sheet on mobile, centered card on sm+ */}
      <div className="relative bg-white/95 backdrop-blur-2xl border border-white/20 w-full sm:max-w-form sm:rounded-3xl rounded-t-3xl shadow-2xl z-10 overflow-hidden animate-slide-up">

        {/* Drag handle (mobile only) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-border rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Que voulez-vous créer ?</h2>
            <p className="text-xs text-text-secondary mt-0.5">Choisissez le type de document à générer.</p>
          </div>
          <button
            onClick={closeCreateModal}
            className="p-1.5 text-text-muted hover:text-text-secondary hover:bg-border rounded-full transition-colors ml-4 flex-shrink-0"
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
                    flex flex-col items-center justify-center p-5 rounded-panel border transition-all text-center group relative
                    ${doc.active
                      ? 'border-border/60 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 bg-white/50 backdrop-blur-sm cursor-pointer'
                      : 'border-border bg-background-subtle/30 opacity-50 cursor-not-allowed'
                    }
                  `}
                >
                  <div className={`
                    w-9 h-9 rounded-full flex items-center justify-center mb-2 transition-colors
                    ${doc.active ? 'bg-primary-subtle text-primary group-hover:bg-primary group-hover:text-white' : 'bg-border text-text-muted'}
                  `}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className={`text-xs font-bold leading-tight ${doc.active ? 'text-text-primary' : 'text-text-secondary'}`}>
                    {doc.label}
                  </h3>
                  <p className="text-[10px] text-text-muted mt-0.5 line-clamp-2 hidden sm:block">
                    {doc.desc}
                  </p>

                  {!doc.active && (
                    <span className="absolute top-2 right-2 text-[9px] font-bold uppercase text-text-muted bg-border px-1.5 py-0.5 rounded-full">
                      Bientôt
                    </span>
                  )}

                  {doc.id === 'cv' && isCreating && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-panel flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
