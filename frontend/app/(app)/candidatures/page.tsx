"use client";
import { Briefcase } from "lucide-react";
export default function CandidaturesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Candidatures</h1>
      <p className="text-sm text-gray-500 mb-8">Suivez vos candidatures.</p>
      <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4"><Briefcase className="w-6 h-6 text-gray-400" /></div>
        <p className="text-sm font-medium text-gray-500">Fonctionnalité à venir</p>
        <p className="text-xs text-gray-400 mt-1">Disponible dans une prochaine version.</p>
      </div>
    </div>
  );
}
