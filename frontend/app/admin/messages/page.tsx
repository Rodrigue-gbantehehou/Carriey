"use client";

import { useState, useEffect } from 'react';
import { Mail, Search, Trash2, Calendar, User, Info } from 'lucide-react';
import config from '@/lib/config';
import toast from 'react-hot-toast';

export default function AdminMessagesPage() {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchMessages = async () => {
        try {
            const res = await fetch(`${config.apiBaseUrl}/admin/messages`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (error) {
            console.error("Erreur", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Voulez-vous vraiment supprimer ce message ?")) return;
        try {
            const res = await fetch(`${config.apiBaseUrl}/admin/messages/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (res.ok) {
                toast.success('Message supprimé');
                fetchMessages();
            } else {
                toast.error('Erreur lors de la suppression');
            }
        } catch (err) {
            toast.error('Erreur réseau');
        }
    };

    const filtered = messages.filter(m => 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-8 max-w-dashboard mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Mail className="w-6 h-6 text-indigo-600" />
                        Messages de Contact
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Gérez les demandes issues du formulaire public.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4 bg-gray-50/50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                            type="text" 
                            placeholder="Rechercher par nom, email ou sujet..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Sujet / Message</th>
                                <th className="px-6 py-4 w-40">Date</th>
                                <th className="px-6 py-4 w-24 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                            <span>Chargement...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <Mail className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 font-medium">Aucun message trouvé.</p>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map(m => (
                                    <tr key={m.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4 align-top">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                                    {m.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{m.name}</p>
                                                    <a href={`mailto:${m.email}`} className="text-indigo-600 hover:underline text-xs">{m.email}</a>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <p className="font-semibold text-gray-900 mb-1">{m.subject}</p>
                                            <p className="text-gray-500 whitespace-pre-wrap text-sm line-clamp-3 group-hover:line-clamp-none transition-all">{m.message}</p>
                                        </td>
                                        <td className="px-6 py-4 align-top text-xs text-gray-500">
                                            {new Date(m.created_at).toLocaleDateString('fr-FR', {
                                                day: 'numeric', month: 'short', year: 'numeric',
                                                hour: '2-digit', minute:'2-digit'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 align-top text-right">
                                            <button 
                                                onClick={() => handleDelete(m.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                title="Supprimer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
