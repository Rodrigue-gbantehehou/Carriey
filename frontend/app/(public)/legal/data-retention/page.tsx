export const metadata = {
  title: 'Politique de Conservation des Données - carriey',
  description: 'Politique de conservation des données de carriey',
};

export default function DataRetentionPage() {
  return (
    <>
      <h1>Politique de Conservation des Données</h1>
      <p>Dernière mise à jour : Octobre 2026</p>
      
      <h2>1. Principe de base</h2>
      <p>
        <strong>carriey</strong> s'engage à ne conserver vos données personnelles que pour la durée strictement 
        nécessaire à la réalisation des finalités pour lesquelles elles ont été collectées.
      </p>

      <h2>2. Données de compte (Utilisateurs Actifs)</h2>
      <p>
        Les données liées à votre compte (profil, expériences, formations, CV générés) sont conservées 
        pendant toute la durée de vie de votre compte pour vous permettre d'y accéder à tout moment.
      </p>

      <h2>3. Données des Utilisateurs Inactifs</h2>
      <p>
        Si vous ne vous connectez pas à votre compte carriey pendant une période continue de <strong>3 ans</strong>, 
        votre compte sera considéré comme inactif. Avant la suppression définitive de vos données, nous vous 
        enverrons une notification par email (au moins 30 jours à l'avance) pour vous prévenir.
      </p>

      <h2>4. Données de paiement et facturation</h2>
      <p>
        Conformément à nos obligations légales et fiscales, les informations relatives aux transactions et à la facturation 
        (historique des paiements, factures) sont conservées pendant une durée légale de <strong>10 ans</strong>.
      </p>

      <h2>5. Logs de sécurité et d'audit</h2>
      <p>
        Les journaux de connexion et d'activité (logs IP, requêtes IA) utilisés pour la sécurité du système 
        et l'analyse des coûts sont conservés pour une durée glissante de <strong>12 mois</strong>.
      </p>
    </>
  );
}
