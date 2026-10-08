"use client";

import { useState, useRef } from 'react';
import { Upload, X, Loader2, FileText, CheckCircle2 } from 'lucide-react';
import config from '@/lib/config';

interface ImportCvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (data: any) => void;
}

export default function ImportCvModal({ isOpen, onClose, onApply }: ImportCvModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [extractedData, setExtractedData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
      setError('');
    } else {
      setError('Veuillez sélectionner un fichier PDF.');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${config.apiBaseUrl}/import-cv/extract`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.detail || "Erreur lors de l'extraction.");
      }

      const data = await res.json();
      setExtractedData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (extractedData) {
      onApply(extractedData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-600" />
            Importer un CV (PDF)
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {!extractedData ? (
            <div className="space-y-6">
              <p className="text-sm text-gray-500">
                L'IA va extraire automatiquement vos expériences, formations et compétences pour préremplir votre Master Profile.
              </p>

              <div 
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${file ? 'border-indigo-400 bg-indigo-50/50' : 'border-gray-300 hover:border-indigo-300 bg-gray-50'}`}
                onClick={() => !file && fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  accept=".pdf,application/pdf" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileChange} 
                />
                
                {file ? (
                  <div className="flex flex-col items-center">
                    <FileText className="w-8 h-8 text-indigo-600 mb-2" />
                    <p className="text-sm font-bold text-gray-900">{file.name}</p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="text-xs text-red-500 mt-2 hover:underline"
                    >
                      Retirer
                    </button>
                  </div>
                ) : (
                  <div className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-900">Cliquez pour sélectionner un PDF</p>
                    <p className="text-xs text-gray-500 mt-1">Maximum 5 Mo.</p>
                  </div>
                )}
              </div>

              {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Extraction réussie !</p>
                  <p className="text-xs mt-1">Vérifiez les données ci-dessous. En confirmant, elles seront ajoutées à votre profil (sans écraser l'existant, sauf pour le titre et la bio si vides).</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl text-sm border border-gray-100 max-h-64 overflow-y-auto">
                <pre className="whitespace-pre-wrap font-mono text-xs text-gray-700">
                  {JSON.stringify(extractedData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Annuler
          </button>
          {!extractedData ? (
            <button 
              onClick={handleUpload}
              disabled={!file || loading}
              className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {loading ? 'Extraction...' : 'Extraire les données'}
            </button>
          ) : (
            <button 
              onClick={handleConfirm}
              className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Importer dans mon profil
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
