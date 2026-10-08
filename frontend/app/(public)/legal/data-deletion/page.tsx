export const metadata = {
  title: 'Politique de Suppression - carriey',
  description: 'Politique de suppression des données de carriey',
};

export default function DataDeletionPage() {
  return (
    <>
      <h1>Politique de Suppression (Droit à l'Oubli)</h1>
      <p>Dernière mise à jour : Octobre 2026</p>
      
      <h2>1. Suppression manuelle par l'utilisateur</h2>
      <p>
        En tant qu'utilisateur de <strong>carriey</strong>, vous avez le droit de demander la suppression complète 
        de votre compte et de vos données personnelles à tout moment, directement depuis les paramètres de votre compte (Rubrique "Zone Dangereuse").
      </p>

      <h2>2. Processus de suppression</h2>
      <p>
        Lorsque vous initiez la suppression de votre compte :
      </p>
      <ul>
        <li><strong>Immédiatement :</strong> Votre accès au compte est bloqué, votre profil public (s'il existe) est désactivé, et vos données ne sont plus accessibles par les autres utilisateurs ou recruteurs.</li>
        <li><strong>Sous 7 jours :</strong> Vos données professionnelles (CV, expériences, lettres) sont effacées définitivement de notre base de données principale.</li>
        <li><strong>Sous 30 jours :</strong> Les sauvegardes de sécurité (backups) contenant vos données chiffrées sont écrasées.</li>
      </ul>

      <h2>3. Données résiduelles</h2>
      <p>
        Conformément à nos obligations légales de tenue comptable, vos historiques de paiements (identifiant de transaction, montant, date) 
        seront conservés de manière anonymisée ou rattachés à un identifiant technique afin de ne pas pouvoir vous identifier directement, 
        sauf exigence légale contraire.
      </p>

      <h2>4. Données transmises aux IA tierces</h2>
      <p>
        Les requêtes envoyées à nos fournisseurs de modèles LLM (OpenAI, Anthropic, etc.) ne sont pas utilisées 
        par ces derniers pour entraîner leurs modèles. Ces prestataires appliquent leurs propres politiques de conservation (généralement 30 jours maximum pour des raisons de sécurité).
      </p>

      <h2>5. Demande d'assistance</h2>
      <p>
        Si vous n'arrivez pas à supprimer votre compte via l'interface, vous pouvez formuler une demande de 
        suppression de vos données (droit à l'effacement) en écrivant à : <strong>contact@carriey.com</strong>.
      </p>
    </>
  );
}
