'use client';

import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { useState } from 'react';
import toast from 'react-hot-toast';

import config from '@/lib/config';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    honeypot: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch(`${config.apiBaseUrl}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Erreur lors de l\'envoi du message');
      }
      
      toast.success('Message envoyé avec succès ! Notre équipe vous répondra sous 24h.');
      setFormData({ name: '', email: '', subject: '', message: '', honeypot: '' });
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      toast.error(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">


      <main className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto shadow-2xl shadow-black/5 rounded-[40px] overflow-hidden bg-white flex flex-col md:flex-row border border-gray-100">

          {/* Info Side */}
          <div className="md:w-2/5 bg-indigo-600 p-12 text-white relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 opacity-20 blur-[100px] rounded-full -mr-32 -mt-32"></div>

            <div className="relative z-10">
              <h1 className="text-4xl font-bold mb-6">Parlons</h1>
              <p className="text-white font-relative leading-relaxed mb-12">
                Une question sur la configuration de votre profil central, la génération d'un document ou l'IA ? Notre équipe est à votre écoute pour vous accompagner.
              </p>
              {/*
              <div className="space-y-8">
                <div className="flex items-center gap-5 group">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-brand-cta transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Email</p>
                    <p className="font-bold">contact@cvtor.pro</p>
                  </div>
                </div>

                <div className="flex items-center gap-5 group">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-brand-cta transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Siège social</p>
                    <p className="font-bold">Abidjan, Côte d&apos;Ivoire</p>
                  </div>
                </div>
              </div>
*/}
            </div>

            <div className="relative z-10 pt-12 border-t border-white/10 mt-12">
              <p className="text-sm font-medium text-white">Suivez-nous sur les réseaux pour des conseils carrière hebdomadaires.</p>
            </div>
          </div>

          {/* Form Side */}
          <div className="md:w-3/5 p-12 sm:p-16">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-900 uppercase tracking-widest">Nom complet</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Jean Kouassi"
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-900 uppercase tracking-widest">Email</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="jean@exemple.ci"
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium text-gray-900"
                  />
                </div>
              </div>

              {/* Anti-spam Honeypot */}
              <div style={{ display: 'none' }} aria-hidden="true">
                <label>Ne pas remplir ce champ si vous êtes humain :</label>
                <input
                  type="text"
                  tabIndex={-1}
                  value={formData.honeypot}
                  onChange={e => setFormData({...formData, honeypot: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-900 uppercase tracking-widest">Sujet</label>
                <input
                  required
                  type="text"
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                  placeholder="Comment adapter mon profil pour..."
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-900 uppercase tracking-widest">Votre message</label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  placeholder="Dites-nous comment nous pouvons vous aider..."
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium text-gray-900 resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
              >
                {loading ? 'Envoi en cours...' : 'Envoyer le message'}
              </button>
            </form>
          </div>
        </div>
      </main>


    </div>
  );
}
