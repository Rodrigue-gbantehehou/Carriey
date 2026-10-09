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
import { PageHeader } from '@/components/ui/PageHeader';

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
    <div className={`bg-white/60 backdrop-blur-md p-5 rounded-3xl border border-border shadow-sm hover:shadow-xl transition-all animate-slide-up group`} style={{ animationDelay: `${delay}s` }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-text-secondary">{title}</p>
          <h3 className="text-2xl font-bold text-text-primary mt-1.5 tracking-tight group-hover:scale-105 transition-transform origin-left">{value}</h3>
        </div>
        <div className={`w-10 h-10 rounded-panel flex items-center justify-center ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <TrendingUp className="w-3.5 h-3.5 text-green-500" />
          <span className="font-semibold text-green-600">{trend}</span>
          <span className="text-text-muted">ce mois-ci</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="animate-fade-in pb-12">
      <PageHeader
        title="Vos Statistiques"
        description="Analysez l'impact de vos candidatures et l'attractivité de votre profil."
        className="animate-slide-up mb-8"
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-text-secondary font-medium">Analyse de vos données...</p>
        </div>
      ) : (
        <div className="space-y-6">

          {/* Top KPI row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title="Candidatures envoyées"
              value={stats.totalCandidatures}
              icon={Send}
              colorClass="bg-primary-subtle text-primary border border-primary/20"
              delay={0.1}
            />
            <StatCard
              title="Entretiens obtenus"
              value={stats.interview}
              icon={Target}
              colorClass="bg-warning-bg text-warning-text border border-warning-text/20"
              delay={0.2}
            />
            <StatCard
              title="Vues du profil public"
              value={stats.publicViews}
              icon={Eye}
              colorClass="bg-background-subtle text-text-secondary border border-border"
              delay={0.3}
            />
            <div className="bg-white p-5 rounded-3xl border border-border shadow-sm animate-slide-up relative overflow-hidden" style={{ animationDelay: '0.4s' }}>
              <div className="absolute top-0 right-0 p-3 text-text-muted opacity-20">
                <BarChart3 className="w-16 h-16 transform translate-x-2 -translate-y-2" />
              </div>
              <p className="text-text-secondary font-medium text-xs">Complétion du profil</p>
              <h3 className="text-3xl font-bold mt-1 text-text-primary">{completionRate}%</h3>

              <div className="w-full bg-background-subtle rounded-full h-1.5 mt-3 overflow-hidden border border-border/50">
                <div className="bg-primary h-1.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${completionRate}%` }}></div>
              </div>

              <p className="text-[10px] text-text-muted mt-2">
                {completionRate === 100 ? "Parfait ! Votre profil est complet." : "Complétez votre profil pour plus de visibilité."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Funnel de conversion */}
            <div className="lg:col-span-2 bg-white/60 backdrop-blur-md p-5 rounded-3xl border border-border shadow-sm animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-text-primary">Entonnoir de conversion</h3>
                <Link href="/candidatures" className="text-xs font-semibold text-primary hover:text-primary-hover">Voir tout</Link>
              </div>

              <div className="space-y-5">
                <div className="relative">
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="flex items-center gap-1.5"><Send className="w-3.5 h-3.5 text-primary" /> Envoyées</span>
                    <span className="text-text-primary">{stats.sent}</span>
                  </div>
                  <div className="w-full bg-background-subtle border border-border/50 rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${stats.totalCandidatures ? (stats.sent / stats.totalCandidatures) * 100 : 0}%` }}></div>
                  </div>
                </div>

                <div className="relative">
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-warning-text" /> En attente / Entretien</span>
                    <span className="text-text-primary">{stats.interview}</span>
                  </div>
                  <div className="w-full bg-background-subtle border border-border/50 rounded-full h-2.5">
                    <div className="bg-warning-text h-2.5 rounded-full" style={{ width: `${stats.totalCandidatures ? (stats.interview / stats.totalCandidatures) * 100 : 0}%` }}></div>
                  </div>
                </div>

                <div className="relative">
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-success-text" /> Acceptées</span>
                    <span className="text-text-primary">{stats.accepted}</span>
                  </div>
                  <div className="w-full bg-background-subtle border border-border/50 rounded-full h-2.5">
                    <div className="bg-success-text h-2.5 rounded-full" style={{ width: `${stats.totalCandidatures ? (stats.accepted / stats.totalCandidatures) * 100 : 0}%` }}></div>
                  </div>
                </div>

                <div className="relative">
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5 text-danger-text" /> Refusées</span>
                    <span className="text-text-primary">{stats.refused}</span>
                  </div>
                  <div className="w-full bg-background-subtle border border-border/50 rounded-full h-2.5">
                    <div className="bg-danger-text h-2.5 rounded-full" style={{ width: `${stats.totalCandidatures ? (stats.refused / stats.totalCandidatures) * 100 : 0}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Production de documents */}
            <div className="bg-white/60 backdrop-blur-md p-5 rounded-3xl border border-border shadow-sm animate-slide-up" style={{ animationDelay: '0.6s' }}>
              <h3 className="text-base font-bold text-text-primary mb-5">Documents créés</h3>

              <div className="space-y-3.5">
                <div className="flex items-center justify-between p-3.5 bg-background-subtle rounded-panel border border-border hover:border-primary/20 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-panel bg-primary-subtle text-primary flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-text-primary">CV générés</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-primary">{stats.totalResumes}</span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-background-subtle rounded-panel border border-border hover:border-primary/20 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-panel bg-primary-subtle text-primary flex items-center justify-center">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-text-primary">Lettres de motiv.</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-primary">{stats.totalLetters}</span>
                </div>
              </div>

              <div className="mt-8">
                <Link href="/themes" className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white font-bold rounded-button hover:bg-primary-hover transition-colors">
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
