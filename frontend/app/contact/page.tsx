'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simuler un envoi
    setTimeout(() => {
      setLoading(false);
      toast.success('Message envoyé avec succès ! Notre équipe vous répondra sous 24h.');
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Navbar />

      <main className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto shadow-2xl shadow-black/5 rounded-[40px] overflow-hidden bg-white flex flex-col md:flex-row border border-gray-100">
          
          {/* Info Side */}
          <div className="md:w-2/5 bg-brand-text p-12 text-white relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cta opacity-20 blur-[100px] rounded-full -mr-32 -mt-32"></div>
            
            <div className="relative z-10">
              <h1 className="text-4xl font-black mb-6">Parlons de votre <span className="text-brand-cta">futur</span>.</h1>
              <p className="text-gray-400 font-medium leading-relaxed mb-12">
                Vous avez une question, une suggestion ou besoin d'aide ? Notre équipe ivoirienne est à votre écoute.
              </p>

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
                    <p className="font-bold">Abidjan, Côte d'Ivoire</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-12 border-t border-white/10 mt-12">
              <p className="text-sm font-medium text-gray-400">Suivez-nous sur les réseaux pour des conseils carrière hebdomadaires.</p>
            </div>
          </div>

          {/* Form Side */}
          <div className="md:w-3/5 p-12 sm:p-16">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-text uppercase tracking-widest">Nom complet</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Jean Kouassi"
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-brand-cta focus:bg-white transition-all font-medium text-brand-text"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-text uppercase tracking-widest">Email</label>
                  <input 
                    required
                    type="email" 
                    placeholder="jean@exemple.ci"
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-brand-cta focus:bg-white transition-all font-medium text-brand-text"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-text uppercase tracking-widest">Sujet</label>
                <input 
                  required
                  type="text" 
                  placeholder="Comment booster mon CV..."
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-brand-cta focus:bg-white transition-all font-medium text-brand-text"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-text uppercase tracking-widest">Votre message</label>
                <textarea 
                  required
                  rows={5}
                  placeholder="Dites-nous comment nous pouvons vous aider..."
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-brand-cta focus:bg-white transition-all font-medium text-brand-text resize-none"
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-brand-cta text-white font-black rounded-2xl hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
              >
                {loading ? 'Envoi en cours...' : 'Envoyer le message'}
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
