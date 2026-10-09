'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, MapPin, Calendar, ExternalLink, Target, Loader2, ArrowLeft, Zap, FileText, Mail, CheckCircle2 } from 'lucide-react';
import { candidaturesApi } from '@/lib/candidature-api';
import { aiApi } from '@/lib/ai-api';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';

type Status = 'envoyee' | 'entretien' | 'acceptee' | 'refusee';

interface ApplicationDetail {
  id: string;
  company: string;
  role: string;
  location: string;
  status: Status;
  applied_date: string;
  url?: string;
  match_score?: number;
  job_description?: string;
  analysis_result?: any;
  resume_id?: string;
  cover_letter_id?: string;
}

export default function CandidatureDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [app, setApp] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [status, setStatus] = useState<Status>('envoyee');

  useEffect(() => {
    fetchCandidature();
  }, [params.id]);

  const fetchCandidature = async () => {
    try {
      setLoading(true);
      const data = await candidaturesApi.get(params.id, session.user.accessToken);
      setApp(data);
      setStatus(data.status);
    } catch (err) {
      toast.error('Impossible de charger la candidature');
      router.push('/candidatures');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!app?.job_description) return;
    try {
      setAnalyzing(true);
      // Analyze fit requires profile data, we should fetch it or aiApi should handle it if the backend does it.
      // Wait, aiApi.analyzeFit needs profile data!
      // Let's check how `analyser/page.tsx` calls it: `aiApi.analyzeFit(jobText)`
      if (!session?.user?.accessToken) throw new Error("Non autorisé");
      const result = await aiApi.analyzeFit(session.user.accessToken, app.job_description);
      
      // Update candidature with result
      const updated = await candidaturesApi.update(app.id, {
        match_score: result.score,
        analysis_result: result
      }, session.user.accessToken);
      setApp(updated);
      toast.success('Analyse terminée !');
    } catch (err) {
      toast.error("Erreur lors de l'analyse");
    } finally {
      setAnalyzing(false);
    }
  };

  const updateStatus = async (newStatus: Status) => {
    if (!app || !session?.user?.accessToken) return;
    try {
      const updated = await candidaturesApi.update(app.id, { status: newStatus }, session.user.accessToken);
      setApp(updated);
      setStatus(newStatus);
      toast.success('Statut mis à jour');
    } catch (err) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  if (loading) {
    return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
  }

  if (!app) return null;

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans p-6 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.push('/candidatures')} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{app.role}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
              <span className="flex items-center gap-1 font-medium"><Briefcase className="w-4 h-4" /> {app.company}</span>
              {app.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {app.location}</span>}
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Ajoutée le {new Date(app.applied_date).toLocaleDateString()}</span>
            </div>
          </div>
          {app.url && (
            <a href={app.url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-sm font-bold flex items-center gap-2">
              <ExternalLink className="w-4 h-4" /> Voir l'offre
            </a>
          )}
        </div>

        {/* Status Pipeline */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-2">
          {['envoyee', 'entretien', 'acceptee', 'refusee'].map((s) => (
            <button
              key={s}
              onClick={() => updateStatus(s as Status)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all capitalize ${
                status === s 
                  ? s === 'refusee' ? 'bg-red-100 text-red-700' : s === 'acceptee' ? 'bg-green-100 text-green-700' : 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Analysis Section */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" /> Analyse IA & Score
              </h2>
              
              {!app.job_description ? (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500 mb-3">Aucune offre n'a été ajoutée à cette candidature.</p>
                </div>
              ) : !app.analysis_result ? (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500 mb-4">L'offre a été sauvegardée mais n'a pas encore été analysée.</p>
                  <button onClick={handleAnalyze} disabled={analyzing} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 inline-flex items-center gap-2">
                    {analyzing ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyse...</> : <><Zap className="w-4 h-4" /> Analyser maintenant</>}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="54" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                        <circle cx="60" cy="60" r="54" stroke="currentColor" strokeWidth="8" fill="transparent"
                          strokeDasharray={339.292} strokeDashoffset={339.292 - (339.292 * app.match_score! / 100)}
                          className={app.match_score! >= 75 ? "text-green-500" : app.match_score! >= 50 ? "text-orange-500" : "text-red-500"}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-black">{app.match_score}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700 font-medium leading-relaxed">{app.analysis_result.verdict}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-xl p-4">
                      <h4 className="text-xs font-bold text-green-800 uppercase mb-2">Points forts</h4>
                      <ul className="space-y-2 text-sm text-green-700">
                        {app.analysis_result.strengths.map((s: string, i: number) => (
                          <li key={i} className="flex gap-2 leading-tight">
                            <CheckCircle2 className="w-4 h-4 shrink-0 text-green-500" /> <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-4">
                      <h4 className="text-xs font-bold text-orange-800 uppercase mb-2">Points à améliorer</h4>
                      <ul className="space-y-2 text-sm text-orange-700">
                        {app.analysis_result.gaps.map((s: string, i: number) => (
                          <li key={i} className="flex gap-2 leading-tight">
                            <span className="text-orange-400 mt-0.5">•</span> <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Job Description */}
            {app.job_description && (
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Texte de l'offre</h2>
                <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 whitespace-pre-wrap max-h-64 overflow-y-auto">
                  {app.job_description}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar / Documents */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 rounded-2xl text-white shadow-lg">
              <h3 className="font-bold mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-indigo-200" /> Documents</h3>
              
              <div className="space-y-3">
                {/* CV Section */}
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-sm font-medium text-indigo-100 mb-2">CV Adapté</div>
                  {app.resume_id ? (
                    <Link href={`/mes-documents/cv/${app.resume_id}`} className="w-full flex items-center justify-center gap-2 bg-white text-indigo-700 py-2 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors">
                      <ExternalLink className="w-4 h-4" /> Ouvrir le CV
                    </Link>
                  ) : (
                    <Link href={`/analyser`} className="w-full flex items-center justify-center gap-2 bg-indigo-500/50 hover:bg-indigo-500 py-2 rounded-lg text-sm font-bold transition-colors">
                      <Zap className="w-4 h-4" /> Générer un CV
                    </Link>
                  )}
                </div>

                {/* Letter Section */}
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-sm font-medium text-indigo-100 mb-2">Lettre de motivation</div>
                  {app.cover_letter_id ? (
                    <Link href={`/mes-documents/lettre/${app.cover_letter_id}`} className="w-full flex items-center justify-center gap-2 bg-white text-indigo-700 py-2 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors">
                      <ExternalLink className="w-4 h-4" /> Ouvrir la lettre
                    </Link>
                  ) : (
                    <Link href={`/analyser`} className="w-full flex items-center justify-center gap-2 bg-indigo-500/50 hover:bg-indigo-500 py-2 rounded-lg text-sm font-bold transition-colors">
                      <Mail className="w-4 h-4" /> Rédiger une lettre
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
