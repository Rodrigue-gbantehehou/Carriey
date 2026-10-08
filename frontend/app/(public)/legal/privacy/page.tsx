export const metadata = {
  title: 'Politique de Confidentialité - carriey',
  description: 'Politique de confidentialité de carriey',
};

export default function PrivacyPage() {
  return (
    <>
      <h1>Politique de Confidentialité</h1>
      <p>Dernière mise à jour : Octobre 2026</p>
      
      <h2>1. Collecte des Données</h2>
      <p>
        Dans le cadre de l'utilisation de <strong>carriey</strong>, nous sommes amenés à collecter les données suivantes :
      </p>
      <ul>
        <li><strong>Données de compte :</strong> Email, mot de passe hashé, nom, prénom.</li>
        <li><strong>Données professionnelles :</strong> Expériences, formations, compétences, loisirs (saisies ou importées).</li>
        <li><strong>Données générées :</strong> Textes IA, brouillons, lettres de motivation.</li>
        <li><strong>Données de paiement :</strong> Gérées exclusivement par nos prestataires de paiement (FedaPay / Kkiapay). Nous ne stockons aucune coordonnée bancaire.</li>
      </ul>

      <h2>2. Utilisation des Données</h2>
      <p>
        Vos données sont utilisées dans le but unique de vous fournir le service carriey :
      </p>
      <ul>
        <li>Génération et export de vos CV et lettres.</li>
        <li>Hébergement de votre profil public (si vous l'activez).</li>
        <li>Amélioration de nos modèles d'assistance textuelle.</li>
      </ul>

      <h2>3. Partage avec des Tiers</h2>
      <p>
        Nous ne vendons, ni ne louons vos données personnelles. 
        Pour la génération de texte par IA, vos données (profil strict) sont envoyées à nos fournisseurs de modèles d'Intelligence Artificielle de manière sécurisée et anonymisée.
      </p>

      <h2>4. Sécurité</h2>
      <p>
        Les mots de passe sont hashés avec des algorithmes standards de l'industrie. Vos données sont hébergées sur des serveurs sécurisés avec un accès restreint au personnel habilité.
      </p>

      <h2>5. Vos Droits</h2>
      <p>
        Conformément aux réglementations sur la protection des données, vous disposez d'un droit d'accès, de rectification, de portabilité et de suppression de vos données. 
        Vous pouvez exercer ces droits directement depuis les paramètres de votre compte ou en nous contactant.
      </p>
    </>
  );
}
