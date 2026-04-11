'use client';

import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const faqs = [
  {
    question: "Quels sont les moyens de paiement acceptés ?",
    answer: "Nous acceptons les paiements via Mobile Money (Orange Money, MTN MoMo, Moov Money et Wave) ainsi que les cartes bancaires via nos partenaires sécurisés (KkiaPay)."
  },
  {
    question: "Est-ce que je peux modifier mon CV après l'avoir payé ?",
    answer: "Oui, une fois que vous avez débloqué un modèle ou pris un abonnement, vous pouvez modifier votre CV autant de fois que vous le souhaitez pendant la durée de validité de votre accès."
  },
  {
    question: "Le CV est-il téléchargeable en PDF ?",
    answer: "Absolument. Tous nos modèles sont exportables au format PDF haute définition, prêt à être envoyé par email ou imprimé."
  },
  {
    question: "Comment fonctionne l'IA de rédaction ?",
    answer: "Notre IA analyse votre secteur d'activité et vos expériences pour vous suggérer les meilleurs mots-clés et descriptions de postes afin de maximiser vos chances face aux recruteurs."
  },
  {
    question: "Puis-je utiliser CVTor sur mon téléphone ?",
    answer: "Oui, CVTor est entièrement 'responsive'. Vous pouvez créer, éditer et télécharger votre CV directement depuis votre smartphone."
  }
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Navbar />
      
      <main className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-black text-brand-text mb-4">
            Questions <span className="text-brand-cta">Fréquentes</span>
          </h1>
          <p className="text-lg text-brand-muted max-w-xl mx-auto font-medium">
            Tout ce que vous devez savoir pour booster votre carrière avec CVTor.
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-bold text-brand-text mb-3">
                {faq.question}
              </h3>
              <p className="text-brand-muted leading-relaxed font-medium">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-20 bg-brand-text rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cta opacity-10 blur-3xl rounded-full -mr-20 -mt-20"></div>
          <h2 className="text-3xl font-bold mb-4 relative z-10">Vous avez d&apos;autres questions ?</h2>
          <p className="text-white/70 mb-8 relative z-10 max-w-lg mx-auto">
            Notre équipe est là pour vous accompagner dans votre recherche d&apos;emploi.
          </p>
          <Link 
            href="/contact"
            className="inline-block px-8 py-4 bg-brand-cta text-white font-bold rounded-full hover:bg-emerald-600 transition-all relative z-10 shadow-lg shadow-emerald-500/20"
          >
            Nous contacter
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
