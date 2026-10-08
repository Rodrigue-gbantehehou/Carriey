'use client';

import { useState, useEffect } from 'react';
import { Briefcase, Search, Plus, Building2, MapPin, Calendar, ExternalLink, Trash2, Edit2, X, Loader2, CheckCircle2, XCircle, Clock, LayoutGrid, LayoutList } from 'lucide-react';
import { candidaturesApi } from '@/lib/candidature-api';
import { AIAssistant } from '@/components/app/shared/AIAssistant';
import config from '@/lib/config';
import { useSession } from 'next-auth/react';

type Status = 'envoyee' | 'entretien' | 'acceptee' | 'refusee';

interface Application {
  id: string;
  company: string;
  role: string;
  location: string;
  status: Status;
  applied_date: string;
  url?: string;
  logo_url?: string;
}

export default function CandidaturesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<Status | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('kanban');

  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    location: '',
    status: 'envoyee' as Status,
    url: '',
    applied_date: new Date().toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCandidatures();
  }, []);

  const fetchCandidatures = async () => {
    try {
      setIsLoading(true);
      const data = await candidaturesApi.list();
      setApplications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredApps = applications.filter(app => {
    const matchesSearch = app.company?.toLowerCase().includes(searchTerm.toLowerCase()) || app.role?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || app.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusConfig = (status: Status) => {
    switch (status) {
      case 'envoyee': return { label: 'Envoyée', className: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'entretien': return { label: 'Entretien', className: 'bg-orange-50 text-orange-700 border-orange-200' };
      case 'acceptee': return { label: 'Acceptée', className: 'bg-green-50 text-green-700 border-green-200' };
      case 'refusee': return { label: 'Refusée', className: 'bg-red-50 text-red-700 border-red-200' };
      default: return { label: 'Inconnu', className: 'bg-gray-50 text-gray-700 border-gray-200' };
    }
  };

  const openAddModal = () => {
    setEditingApp(null);
    setFormData({
      company: '',
      role: '',
      location: '',
      status: 'envoyee',
      url: '',
      applied_date: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const openEditModal = (app: Application) => {
    setEditingApp(app);
    setFormData({
      company: app.company,
      role: app.role,
      location: app.location || '',
      status: app.status,
      url: app.url || '',
      applied_date: app.applied_date ? new Date(app.applied_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const { data: session } = useSession();

  const handleDelete = async (id: string) => {
    if (confirm("Supprimer cette candidature ?")) {
      try {
        await candidaturesApi.delete(id);
        setApplications(prev => prev.filter(a => a.id !== id));
      } catch (e) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: Status) => {
    try {
      const app = applications.find(a => a.id === id);
      if (!app) return;
      const updated = await candidaturesApi.update(id, { ...app, status: newStatus });
      setApplications(prev => prev.map(a => a.id === updated.id ? updated : a));
    } catch (e) {
      alert("Erreur lors de la mise à jour du statut");
    }
  };

  const handleExtractJob = async (prompt: string) => {
    if (!session?.user?.accessToken) return;
    const res = await fetch(`${config.apiBaseUrl}/ai/extract-job`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.accessToken}`
      },
      body: JSON.stringify({ job_text: prompt })
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Erreur de l'IA");
    }

    const data = await res.json();
    setFormData(prev => ({
      ...prev,
      company: data.companyName && data.companyName !== 'Non précisé' ? data.companyName : prev.company,
      role: data.jobTitle && data.jobTitle !== 'Non précisé' ? data.jobTitle : prev.role,
      location: data.location && data.location !== 'Non précisé' ? data.location : prev.location,
    }));
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('appId', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: Status) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData('appId');
    if (appId) {
      handleUpdateStatus(appId, newStatus);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingApp) {
        const updated = await candidaturesApi.update(editingApp.id, formData);
        setApplications(prev => prev.map(a => a.id === updated.id ? updated : a));
      } else {
        const created = await candidaturesApi.create(formData);
        setApplications(prev => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (e) {
      alert("Erreur de sauvegarde");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCard = (app: Application) => {
    const statusConfig = getStatusConfig(app.status);
    return (
      <div
        key={app.id}
        draggable
        onDragStart={(e) => handleDragStart(e, app.id)}
        className="bg-white border border-gray-200/80 rounded-lg md:rounded-xl p-1.5 md:p-2.5 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200 group flex flex-col cursor-grab active:cursor-grabbing relative"
      >
        {/* Actions (on hover) */}
        <div className="absolute top-1 right-1 flex items-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-md rounded shadow-sm border border-gray-100 z-10">
          <button onClick={() => openEditModal(app)} className="p-1 text-gray-500 hover:text-indigo-600 transition-colors" title="Modifier">
            <Edit2 className="w-2.5 h-2.5 md:w-3 md:h-3" />
          </button>
          <button onClick={() => handleDelete(app.id)} className="p-1 text-gray-500 hover:text-red-600 transition-colors" title="Supprimer">
            <Trash2 className="w-2.5 h-2.5 md:w-3 md:h-3" />
          </button>
        </div>

        {/* Small color indicator for Grid View */}
        {viewMode === 'grid' && (
          <div className="mb-1 md:mb-2">
            <span className={`inline-block w-6 md:w-auto h-1 md:h-auto md:px-1.5 md:py-0.5 rounded text-[0px] md:text-[9px] uppercase tracking-wider font-bold border ${statusConfig.className}`}>
              {statusConfig.label}
            </span>
          </div>
        )}

        <h3 className="font-bold text-gray-900 text-[10px] md:text-sm truncate pr-4 md:pr-10 mb-0 md:mb-1">{app.company}</h3>
        <p className="text-[9px] md:text-xs text-gray-600 font-medium truncate md:line-clamp-2 mb-0 md:mb-3 hidden md:block">{app.role}</p>

        <div className="hidden md:flex flex-wrap items-center gap-x-3 gap-y-1 mt-auto">
          {app.location && (
            <div className="flex items-center gap-1 text-gray-400">
              <MapPin className="w-3 h-3" />
              <p className="text-[10px] truncate max-w-[80px]">{app.location}</p>
            </div>
          )}
          {app.applied_date && (
            <div className="flex items-center gap-1 text-gray-400">
              <Calendar className="w-3 h-3" />
              <p className="text-[10px]">
                {new Date(app.applied_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              </p>
            </div>
          )}
          {app.url && (
            <a href={app.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-indigo-400 hover:text-indigo-600 ml-auto transition-colors" onDragStart={(e) => e.preventDefault()}>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    );
  };

  const columns: { id: Status; label: string; color: string }[] = [
    { id: 'envoyee', label: 'Envoyées', color: 'bg-blue-50/50 border-blue-100' },
    { id: 'entretien', label: 'Entretiens', color: 'bg-orange-50/50 border-orange-100' },
    { id: 'acceptee', label: 'Acceptées', color: 'bg-green-50/50 border-green-100' },
    { id: 'refusee', label: 'Refusées', color: 'bg-red-50/50 border-red-100' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-fade-in pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Mes candidatures</h1>
          <p className="text-base text-gray-500 mt-1">
            Suivez l'avancement de vos postulations en un coup d'œil.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Nouvelle candidature
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>

        {/* Status tabs (Grid only) */}
        <div className={`flex items-center gap-1 bg-white/60 backdrop-blur-md border border-gray-200/60 p-1.5 rounded-2xl overflow-x-auto hide-scrollbar shadow-sm w-full md:w-auto ${viewMode === 'kanban' ? 'opacity-50 pointer-events-none' : ''}`}>
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${filter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}>Toutes</button>
          <button onClick={() => setFilter('envoyee')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${filter === 'envoyee' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}>Envoyées</button>
          <button onClick={() => setFilter('entretien')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${filter === 'entretien' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}>Entretiens</button>
          <button onClick={() => setFilter('acceptee')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${filter === 'acceptee' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}>Acceptées</button>
        </div>

        {/* View Mode Toggle & Search */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center bg-white/60 backdrop-blur-md border border-gray-200/60 p-1.5 rounded-2xl shadow-sm">
            <button onClick={() => setViewMode('kanban')} className={`p-2 rounded-xl transition-all ${viewMode === 'kanban' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
              <LayoutList className="w-4 h-4 rotate-90" />
            </button>
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/60 backdrop-blur-md border border-gray-200/60 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-20 bg-white/50 border border-gray-100 rounded-3xl backdrop-blur-sm">
          <p className="text-gray-500 font-medium">Aucune candidature trouvée.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          {filteredApps.map(renderCard)}
        </div>
      ) : (
        <div className="flex w-full gap-2 md:gap-4 animate-slide-up h-[calc(100vh-260px)]" style={{ animationDelay: '0.3s' }}>
          {columns.map(col => {
            const colApps = applications.filter(a => a.status === col.id && (a.company?.toLowerCase().includes(searchTerm.toLowerCase()) || a.role?.toLowerCase().includes(searchTerm.toLowerCase())));
            return (
              <div
                key={col.id}
                className={`flex-1 min-w-0 flex flex-col rounded-xl border p-2 md:p-3 ${col.color}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                <div className="flex items-center justify-between mb-3 px-1 md:px-2">
                  <h3 className="font-bold text-gray-900 text-xs md:text-sm truncate">{col.label}</h3>
                  <span className="bg-white/80 backdrop-blur-sm px-1.5 md:px-2 py-0.5 md:py-1 rounded-lg text-[10px] md:text-xs font-bold text-gray-600 border border-gray-200/50 shadow-sm flex-shrink-0">
                    {colApps.length}
                  </span>
                </div>
                <div className="flex flex-col gap-2 md:gap-3 overflow-y-auto hide-scrollbar flex-1 pb-2 px-1">
                  {colApps.map(renderCard)}
                  {colApps.length === 0 && (
                    <div className="border-2 border-dashed border-gray-200/50 rounded-xl h-20 flex items-center justify-center text-gray-400 text-xs font-medium">
                      Glissez ici
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>

          <div className="relative bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl z-10 flex flex-col max-h-[90vh] animate-slide-up sm:animate-scale-in">
            {/* Drag handle (mobile only) */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            <div className="flex justify-between items-center p-5 sm:p-6 border-b border-gray-100 shrink-0">
              <h2 className="text-xl font-bold text-gray-900">
                {editingApp ? "Modifier la candidature" : "Nouvelle candidature"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto overflow-x-hidden hide-scrollbar">

              {!editingApp && (
                <div className="px-5 sm:px-6 pt-5 border-b border-gray-100 pb-5 bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
                  <AIAssistant
                    onGenerate={handleExtractJob}
                    placeholder="Collez l'annonce ou l'offre d'emploi ici. L'IA va extraire l'entreprise, le poste et la localisation automatiquement..."
                    buttonText="Extraire les infos"
                    loadingText="Analyse de l'offre..."
                  />
                </div>
              )}

              <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Entreprise *</label>
                  <input required type="text" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Poste *</label>
                  <input required type="text" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Localisation</label>
                  <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Statut</label>
                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as Status })} className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer">
                      <option value="envoyee">Envoyée</option>
                      <option value="entretien">Entretien</option>
                      <option value="acceptee">Acceptée</option>
                      <option value="refusee">Refusée</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date d'envoi</label>
                    <input type="date" value={formData.applied_date} onChange={e => setFormData({ ...formData, applied_date: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Lien de l'offre</label>
                  <input type="url" placeholder="https://..." value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                </div>

                <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-3 sm:py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl w-full sm:w-auto text-center transition-colors">Annuler</button>
                  <button type="submit" disabled={isSubmitting} className="px-5 py-3 sm:py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-50 w-full sm:w-auto flex justify-center transition-all">
                    {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
