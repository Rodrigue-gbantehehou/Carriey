'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import config from '@/lib/config';
import { PageContainer } from '@/components/ui/PageContainer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

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
    } catch (err: any) {
      toast.error(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-subtle flex items-center justify-center py-20">
      <PageContainer variant="form-long">
        <div className="bg-background border border-border rounded-panel overflow-hidden flex flex-col md:flex-row shadow-sm">
          
          {/* Info Side */}
          <div className="md:w-2/5 bg-primary p-12 text-white relative overflow-hidden flex flex-col justify-between">
            <div className="relative z-10">
              <h1 className="text-ui-3xl font-bold mb-6">Parlons</h1>
              <p className="text-white/90 text-ui-base leading-relaxed mb-12">
                Une question sur la configuration de votre profil central, la génération d'un document ou l'IA ? Notre équipe est à votre écoute pour vous accompagner.
              </p>
            </div>

            <div className="relative z-10 pt-12 border-t border-white/10 mt-12">
              <p className="text-ui-sm font-medium text-white/90">Suivez-nous sur les réseaux pour des conseils carrière hebdomadaires.</p>
            </div>
          </div>

          {/* Form Side */}
          <div className="md:w-3/5 p-12 sm:p-16">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input
                  label="Nom complet"
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Jean Kouassi"
                />
                <Input
                  label="Email"
                  required
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="jean@exemple.ci"
                />
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

              <Input
                label="Sujet"
                required
                type="text"
                value={formData.subject}
                onChange={e => setFormData({...formData, subject: e.target.value})}
                placeholder="Comment adapter mon profil pour..."
              />

              <Textarea
                label="Votre message"
                required
                rows={5}
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
                placeholder="Dites-nous comment nous pouvons vous aider..."
              />

              <Button
                type="submit"
                disabled={loading}
                fullWidth
                size="lg"
              >
                {loading ? 'Envoi en cours...' : 'Envoyer le message'}
              </Button>
            </form>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
