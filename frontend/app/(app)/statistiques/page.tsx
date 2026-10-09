'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useProfileStore } from '@/store/profile';
import { candidaturesApi } from '@/lib/candidature-api';
import config from '@/lib/config';
import {
  BarChart3,
  Briefcase,
  FileText,
  Eye,
  TrendingUp,
  CalendarDays,
  Target,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function StatistiquesPage() {
  const { data: session } = useSession();
  const { profile } = useProfileStore();

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCandidatures: 0,
    accepted: 0,
    refused: 0,
    interview: 0,
    sent: 0,
    totalResumes: 0,
    totalLetters: 0,
    publicViews: 0, // Mock for now
  });

  useEffect(() => {
    async function fetchStats() {
      if (!session?.user?.accessToken) return;

      try {
        // Fetch Candidatures
        const candidatures = await candidaturesApi.list(session.user.accessToken);

        // Fetch Resumes & Letters
        const resDocs = await fetch(`${config.apiBaseUrl}/resumes/`, {
          headers: { 'Authorization': `Bearer ${session.user.accessToken}` }
        });
        const docs = await resDocs.json();

        const cvs = docs.filter((d: any) => d.doc_type === 'cv' || !d.doc_type);
        const letters = docs.filter((d: any) => d.doc_type === 'cover_letter');

        setStats({
          totalCandidatures: candidatures.length,
          accepted: candidatures.filter((c: any) => c.status === 'acceptee').length,
          refused: candidatures.filter((c: any) => c.status === 'refusee').length,
          interview: candidatures.filter((c: any) => c.status === 'entretien').length,
          sent: candidatures.filter((c: any) => c.status === 'envoyee').length,
          totalResumes: cvs.length,
          totalLetters: letters.length,
          publicViews: 0, // En attente d'implémentation backend
        });
      } catch (error) {
        console.error("Erreur de chargement des statistiques", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, [session]);

  // Calculate profile completion
  const calculateCompletion = () => {
    if (!profile) return 0;
    let score = 0;
    const total = 5; // bio, experience, education, skills, contact
    if (profile.title && profile.bio) score++;
    if (profile.experiences && profile.experiences.length > 0) score++;
    if (profile.educations && profile.educations.length > 0) score++;
    if (profile.skills && profile.skills.length > 0) score++;
    if (profile.contact_email || profile.contact_phone) score++;
    return (score / total) * 100;
  };

  const completionRate = calculateCompletion();

  const StatCard = ({ title, value, icon: Icon, trend, colorClass, delay }: any) => (
    <div className={`bg-white/60 backdrop-blur-md p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all animate-slide-up group`} style={{ animationDelay: `${delay}s` }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1.5 tracking-tight group-hover:scale-105 transition-transform origin-left">{value}</h3>
        </div>
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <TrendingUp className="w-3.5 h-3.5 text-green-500" />
          <span className="font-semibold text-green-600">{trend}</span>
          <span className="text-gray-400">ce mois-ci</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 animate-fade-in pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 animate-slide-up">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Vos Statistiques</h1>
          <p className="text-sm text-gray-500 mt-1">
            Analysez l'impact de vos candidatures et l'attractivité de votre profil.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm text-gray-500 font-medium">Analyse de vos données...</p>
        </div>
      ) : (
        <div className="space-y-6">

          {/* Top KPI row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title="Candidatures envoyées"
              value={stats.totalCandidatures}
              icon={Send}
              colorClass="bg-blue-50 text-blue-600 border border-blue-100"
              delay={0.1}
            />
            <StatCard
              title="Entretiens obtenus"
              value={stats.interview}
              icon={Target}
              colorClass="bg-orange-50 text-orange-600 border border-orange-100"
              delay={0.2}
            />
            <StatCard
              title="Vues du profil public"
              value={stats.publicViews}
              icon={Eye}
              colorClass="bg-purple-50 text-purple-600 border border-purple-100"
              delay={0.3}
            />
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-5 rounded-3xl shadow-lg shadow-indigo-600/20 text-white animate-slide-up relative overflow-hidden" style={{ animationDelay: '0.4s' }}>
              <div className="absolute top-0 right-0 p-3 opacity-20">
                <BarChart3 className="w-16 h-16 transform translate-x-2 -translate-y-2" />
              </div>
              <p className="text-indigo-100 font-medium text-xs">Complétion du profil</p>
              <h3 className="text-3xl font-bold mt-1">{completionRate}%</h3>

              <div className="w-full bg-black/20 rounded-full h-1.5 mt-3 overflow-hidden">
                <div className="bg-white h-1.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${completionRate}%` }}></div>
              </div>

              <p className="text-[10px] text-indigo-100 mt-2">
                {completionRate === 100 ? "Parfait ! Votre profil est complet." : "Complétez votre profil pour plus de visibilité."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Funnel de conversion */}
            <div className="lg:col-span-2 bg-white/60 backdrop-blur-md p-5 rounded-3xl border border-gray-100 shadow-sm animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-gray-900">Entonnoir de conversion</h3>
                <Link href="/candidatures" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">Voir tout</Link>
              </div>

              <div className="space-y-5">
                <div className="relative">
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="flex items-center gap-1.5"><Send className="w-3.5 h-3.5 text-blue-500" /> Envoyées</span>
                    <span className="text-gray-900">{stats.sent}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${stats.totalCandidatures ? (stats.sent / stats.totalCandidatures) * 100 : 0}%` }}></div>
                  </div>
                </div>

                <div className="relative">
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-orange-500" /> En attente / Entretien</span>
                    <span className="text-gray-900">{stats.interview}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: `${stats.totalCandidatures ? (stats.interview / stats.totalCandidatures) * 100 : 0}%` }}></div>
                  </div>
                </div>

                <div className="relative">
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Acceptées</span>
                    <span className="text-gray-900">{stats.accepted}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${stats.totalCandidatures ? (stats.accepted / stats.totalCandidatures) * 100 : 0}%` }}></div>
                  </div>
                </div>

                <div className="relative">
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5 text-red-500" /> Refusées</span>
                    <span className="text-gray-900">{stats.refused}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${stats.totalCandidatures ? (stats.refused / stats.totalCandidatures) * 100 : 0}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Production de documents */}
            <div className="bg-white/60 backdrop-blur-md p-5 rounded-3xl border border-gray-100 shadow-sm animate-slide-up" style={{ animationDelay: '0.6s' }}>
              <h3 className="text-base font-bold text-gray-900 mb-5">Documents créés</h3>

              <div className="space-y-3.5">
                <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-indigo-200 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">CV générés</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-indigo-600">{stats.totalResumes}</span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Lettres de motiv.</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-blue-600">{stats.totalLetters}</span>
                </div>
              </div>

              <div className="mt-8">
                <Link href="/themes" className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors">
                  Créer un nouveau document
                </Link>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
