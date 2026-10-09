'use client';

import Link from 'next/link';
import { PageContainer } from '@/components/ui/PageContainer';
import { Button } from '@/components/ui/Button';

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
    <div className="w-full bg-background min-h-screen">
      <div className="border-b border-border bg-background-subtle pt-16 pb-16">
        <PageContainer variant="public" className="text-center">
          <h1 className="text-ui-4xl font-bold text-text-primary mb-4">
            Questions Fréquentes
          </h1>
          <p className="text-ui-base text-text-secondary max-w-column mx-auto">
            Tout ce que vous devez savoir pour exploiter pleinement le potentiel de la plateforme.
          </p>
        </PageContainer>
      </div>

      <main className="py-16">
        <PageContainer variant="form-long">
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-background rounded-panel p-6 border border-border"
              >
                <h3 className="text-ui-lg font-bold text-text-primary mb-2">
                  {faq.question}
                </h3>
                <p className="text-ui-base text-text-secondary leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-background-subtle rounded-panel p-8 sm:p-12 text-center border border-border">
            <h2 className="text-ui-2xl font-bold mb-4 text-text-primary">Vous avez d'autres questions ?</h2>
            <p className="text-text-secondary mb-8 max-w-column mx-auto text-ui-base">
              Notre équipe est là pour vous accompagner dans votre recherche d'emploi.
            </p>
            <Link href="/contact" passHref>
              <Button size="lg" variant="primary">
                Nous contacter
              </Button>
            </Link>
          </div>
        </PageContainer>
      </main>
    </div>
  );
}
