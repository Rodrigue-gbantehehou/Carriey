export const metadata = {
  title: 'Mentions Légales - carriey',
  description: 'Mentions légales de carriey',
};

export default function MentionsLegalesPage() {
  return (
    <>
      <h1>Mentions Légales</h1>
      
      <h2>1. Éditeur du site</h2>
      <p>
        Le site <strong>carriey</strong> est édité par :<br />
        <strong>carriey SAS</strong><br />
        Société par Actions Simplifiée<br />
        Siège social : [Adresse de l'entreprise]<br />
        Immatriculée au Registre du Commerce et du Crédit Mobilier sous le numéro [Numéro RCCM].
      </p>

      <h2>2. Directeur de la publication</h2>
      <p>
        Le directeur de la publication est [Nom du Directeur].
      </p>

      <h2>3. Hébergement</h2>
      <p>
        L'infrastructure serveur et la base de données de <strong>carriey</strong> sont hébergées par :<br />
        <strong>[Nom de l'hébergeur, ex: AWS / Vercel / OVH]</strong><br />
        [Adresse de l'hébergeur]
      </p>

      <h2>4. Contact</h2>
      <p>
        Pour toute demande, vous pouvez nous contacter par email à l'adresse suivante : <strong>contact@carriey.com</strong>.
      </p>
    </>
  );
}
