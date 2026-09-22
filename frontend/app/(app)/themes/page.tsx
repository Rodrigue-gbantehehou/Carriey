"use client";
import { Palette } from "lucide-react";
export default function ThemesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Thèmes</h1>
      <p className="text-sm text-gray-500 mb-8">Choisissez un design pour vos CV.</p>
      <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center">
        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-4"><Palette className="w-6 h-6 text-indigo-400" /></div>
        <p className="text-sm font-medium text-gray-500">Galerie de thèmes</p>
        <p className="text-xs text-gray-400 mt-1">Bientôt disponible.</p>
      </div>
    </div>
  );
}
