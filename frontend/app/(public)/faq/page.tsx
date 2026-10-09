'use client';

import Link from 'next/link';

const faqs = [
  {
    question: "Qu'est-ce que le Profil Professionnel Central ?",
    answer: "C'est le cœur de Carriey. Au lieu de refaire votre CV à chaque fois, vous remplissez une seule fois votre profil complet (expériences, compétences, réalisations). Carriey comprend votre parcours et s'en sert pour générer sur-mesure n'importe quel document : CV ciblé, lettre de motivation, ou page publique."
  },
  {
    question: "Comment l'IA adapte-t-elle mes documents ?",
    answer: "Notre IA analyse l'offre d'emploi que vous visez et votre profil central. Elle sélectionne les expériences les plus pertinentes, reformule si besoin pour faire ressortir vos atouts, et génère un CV et une lettre de motivation parfaitement alignés avec les attentes du recruteur."
  },
  {
    question: "Est-ce que je peux modifier les documents générés ?",
    answer: "Oui, absolument. Tous les documents générés (CV, lettres, pages publiques) sont entièrement modifiables. Vous gardez le contrôle total sur le design, le contenu et la mise en page avant de les exporter ou de les publier."
  },
  {
    question: "Les documents sont-ils téléchargeables en PDF ?",
    answer: "Oui, tous vos CV et lettres de motivation sont exportables au format PDF haute définition, optimisés pour passer les filtres ATS des recruteurs et prêts à être envoyés."
  },
  {
    question: "Quels sont les moyens de paiement acceptés ?",
    answer: "Nous acceptons les paiements via Mobile Money (Orange Money, MTN MoMo, Moov Money et Wave) ainsi que les cartes bancaires via nos partenaires sécurisés (KkiaPay)."
  }
];

export default function FAQPage() {
  return (
    <div className="w-full bg-white">

      {/* Decorative Header Background */}
      <div className="relative overflow-hidden bg-gray-50/50 border-b border-gray-100 pt-16 pb-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-indigo-50 rounded-[100%] blur-3xl opacity-50 -z-10"></div>
        <div className="max-w-public mx-auto px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight mb-4">
            Questions <span className="text-indigo-600">Fréquentes</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Tout ce que vous devez savoir pour exploiter pleinement le potentiel de la plateforme.
          </p>
        </div>
      </div>

      <main className="pb-24 -mt-12 relative z-20">
        <div className="max-w-column mx-auto px-6 lg:px-8">

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200/60 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-500 leading-relaxed text-sm">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-20 bg-gray-900 rounded-3xl p-10 sm:p-12 text-center text-white relative overflow-hidden shadow-2xl shadow-gray-900/10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 opacity-20 blur-3xl rounded-full -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 opacity-10 blur-3xl rounded-full -ml-20 -mb-20"></div>

            <h2 className="text-2xl sm:text-3xl font-bold mb-4 relative z-10 tracking-tight">Vous avez d&apos;autres questions ?</h2>
            <p className="text-gray-400 mb-8 relative z-10 max-w-lg mx-auto text-lg">
              Notre équipe est là pour vous accompagner dans votre recherche d&apos;emploi.
            </p>
            <Link
              href="/contact"
              className="inline-block px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-all relative z-10 shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5"
            >
              Nous contacter
            </Link>
          </div>

        </div>
      </main>

    </div>
  );
}
