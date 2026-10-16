/**
 * Utilitaires partagés du profil CARIEY.
 * Ne jamais dupliquer ces fonctions dans les pages — importer depuis ici.
 */

/**
 * Calcule le pourcentage de complétion du profil sur la base de 9 critères structurels.
 * Ce score est un indicateur de progression, PAS un score IA.
 */
export function getProfileCompletion(profile: any, bio?: string): number {
  if (!profile) return 0;
  const checks = [
    !!profile.title,
    !!profile.username,
    !!profile.contact_email,
    !!(bio || profile.bio),
    (profile.experiences?.length || 0) > 0,
    (profile.educations?.length || 0) > 0,
    (profile.skills?.length || 0) > 0,
    (profile.projects?.length || 0) > 0,
    (profile.certifications?.length || 0) > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

/**
 * Retourne un label textuel selon le score de complétion.
 */
export function getCompletionLabel(score: number): string {
  if (score >= 90) return 'Profil complet';
  if (score >= 70) return 'Très bien renseigné';
  if (score >= 40) return 'En cours de complétion';
  return 'Profil à compléter';
}
