# CARIEY — Règles UI/UX et Design System

**Version :** 1.0  
**Statut :** référentiel proposé pour validation et application progressive  
**Stack connue :** Next.js App Router, TypeScript, Tailwind CSS, API FastAPI, service d'export PDF  
**Principe directeur :** une interface sobre, dense sans être étouffante, lisible, cohérente et orientée accomplissement des tâches.

> Ces règles gouvernent l'interface applicative. Les CV générés, les lettres et les exports imprimables possèdent leur propre système de mise en page : ils ne doivent pas hériter aveuglément des tailles et espacements du tableau de bord.

---

## 1. Principes non négociables

1. **Le contenu prime sur la décoration.** Pas de dégradé, ombre, illustration, carte ou animation sans fonction claire.
2. **Une même fonction, un même composant.** Un bouton principal ou un champ identique ne doit pas avoir un style différent selon la page.
3. **Pas d'espace vide artificiel.** Chaque marge doit séparer des éléments ou améliorer la lecture ; elle ne doit pas servir à donner artificiellement une impression de luxe.
4. **Compact ne signifie pas minuscule.** Le tableau de bord peut utiliser une base de 14 px ; les textes de lecture, les explications importantes et le contenu public doivent rester confortables.
5. **Une structure par type de tâche.** Landing page, tableau de bord, formulaire, éditeur de CV et document imprimable n'ont pas la même grille.
6. **Le responsive est conçu, pas ajouté à la fin.** Les colonnes peuvent se réorganiser ; le contenu ne doit pas simplement être rétréci.
7. **Aucune réussite simulée.** Une action ne doit jamais afficher « enregistré », « envoyé », « payé » ou « terminé » avant confirmation réelle de l'opération.
8. **Pas de régression métier pour une amélioration visuelle.** L'interface ne doit pas casser les routes, API, droits, paiements, génération ou export.
9. **Les exceptions sont explicites.** Une valeur non standard est autorisée seulement si elle répond à un besoin documenté : éditeur, impression, donnée dynamique, accessibilité ou cas responsive réellement nécessaire.
10. **Le navigateur tranche.** Le code qui compile ne prouve pas que le rendu est bon ; les écrans doivent être inspectés aux largeurs prescrites plus bas.

## 2. Direction visuelle

CARIEY doit évoquer un outil professionnel fiable, et non un template SaaS générique rempli de cartes et de grands espaces.

- Base neutre : fonds blancs ou gris très clair.
- Une seule couleur d'action dominante : bleu.
- Texte sombre et contrastes suffisants.
- Bordures discrètes ; ombres réservées surtout aux menus, fenêtres modales et surfaces réellement superposées.
- Rayons modestes et cohérents ; éviter les éléments en forme de pilule partout.
- Icônes provenant de la bibliothèque déjà installée. Ne pas mélanger emojis, SVG maison et plusieurs bibliothèques sans motif.
- Pas de témoignage, de compteur, de logo client ou de promesse non vérifiés.
- Les éléments de différenciation réellement pris en charge — par exemple les prix en XOF ou les moyens de paiement disponibles — peuvent être montrés ; ne jamais promettre une fonctionnalité seulement envisagée.

## 3. Typographie de l'application

### 3.1 Police

- Famille principale : **Inter** pour l'interface, si elle n'est pas déjà chargée avec une police de qualité équivalente.
- La charger via `next/font` (Google auto-hébergée au build ou fichier local), et non par un `@import` externe dans le CSS.
- Définir la police une seule fois dans le layout racine ou dans le layout approprié.
- Ne pas charger plusieurs familles uniquement pour décorer l'interface.
- Utiliser une graisse variable ou les graisses 400, 500 et 600. Le 700 est réservé à de rares emphases.

### 3.2 Échelle typographique fixe

Les valeurs ci-dessous sont les tokens officiels de l'interface. Les tailles Tailwind doivent correspondre à ces tokens, même si les noms de classes diffèrent selon la version de Tailwind.

| Token | Taille / interligne | Usage obligatoire |
|---|---:|---|
| `ui-xs` | 12 / 16 px | Métadonnées secondaires uniquement ; jamais pour une instruction importante |
| `ui-sm` | 14 / 20 px | Interface applicative, boutons, labels, tableaux, navigation |
| `ui-base` | 16 / 24 px | Paragraphes de lecture, aide importante, formulaires publics et onboarding |
| `ui-lg` | 18 / 26 px | Titre de section ou sous-titre important |
| `ui-xl` | 20 / 28 px | Sous-titre principal, seulement si la hiérarchie le justifie |
| `ui-2xl` | 24 / 32 px | Titre principal des pages du tableau de bord |
| `ui-3xl` | 30 / 38 px | Sous-titres de pages marketing ou vues spéciales |
| `ui-4xl` | 40 / 48 px | Titre principal marketing sur grand écran uniquement |

Règles supplémentaires :

- Le texte courant du tableau de bord est `ui-sm` (14/20 px), sauf contenu long ou difficulté de lecture justifiant `ui-base`.
- Les contenus marketing et les explications longues utilisent `ui-base` (16/24 px) par défaut.
- Label de champ : `ui-sm`, graisse 500 ; message d'aide : `ui-xs` ou `ui-sm` selon son importance.
- Titre de page de l'application : `ui-2xl`, graisse 600. Titre de section : `ui-lg`, graisse 600.
- Ne pas choisir des tailles au cas par cas pour « équilibrer » visuellement une page ; corriger d'abord la structure, la largeur et l'espacement.
- Pas de texte inférieur à 12 px dans l'interface standard. Les exceptions éventuelles appartiennent à la typographie interne d'un document exporté, pas au chrome de l'application.
- Pas de texte entièrement en majuscules pour les longs titres ou labels. Les majuscules sont réservées aux sigles et à quelques badges courts.

## 4. Couleurs officielles

| Token | Valeur | Usage |
|---|---|---|
| `background` | `#FFFFFF` | Fond principal des pages et surfaces |
| `background-subtle` | `#F8FAFC` | Fond discret des zones secondaires |
| `text-primary` | `#0F172A` | Texte principal |
| `text-secondary` | `#475569` | Texte secondaire qui reste lisible |
| `text-muted` | `#64748B` | Métadonnées et aide non essentielle |
| `border` | `#E2E8F0` | Bordures standards et séparateurs |
| `primary` | `#1D4ED8` | Action principale, lien important, focus |
| `primary-hover` | `#1E40AF` | Survol de l'action principale |
| `success-text` | `#166534` | Texte d'état positif |
| `success-bg` | `#F0FDF4` | Fond d'état positif |
| `warning-text` | `#92400E` | Texte d'avertissement |
| `warning-bg` | `#FFFBEB` | Fond d'avertissement |
| `danger-text` | `#B91C1C` | Texte d'erreur et action destructive |
| `danger-bg` | `#FEF2F2` | Fond d'erreur |

Règles :

- Les couleurs doivent être centralisées dans le thème, pas répétées dans des centaines de fichiers.
- Pas de nouvelles nuances de bleu ou de gris créées au hasard.
- Ne jamais communiquer un état uniquement par la couleur : ajouter un libellé, une icône ou un autre indice.
- Les couleurs d'état sont réservées à leur sens fonctionnel ; elles ne servent pas à décorer les cartes.
- Contrôler les contrastes réels des combinaisons utilisées ; les valeurs ci-dessus ne dispensent pas d'un contrôle des composants complets.

## 5. Système d'espacement

La grille de base est de **4 px**. Utiliser prioritairement les valeurs correspondantes aux classes Tailwind suivantes :

| Valeur | Classes de référence | Usage typique |
|---:|---|---|
| 4 px | `1` | Écart très court à l'intérieur d'un composant |
| 8 px | `2` | Icône + libellé, label + aide compacte |
| 12 px | `3` | Espacement de petits groupes et champs rapprochés |
| 16 px | `4` | Padding standard d'un panneau, séparation entre champs |
| 20 px | `5` | Exception intermédiaire si 16 ou 24 ne conviennent pas |
| 24 px | `6` | Séparation entre blocs liés ou sections compactes |
| 32 px | `8` | Séparation d'une section majeure |
| 40 px | `10` | Grande séparation justifiée, surtout pages publiques |
| 48 px | `12` | Usage rare, section marketing ou composition particulière |

Politique stricte :

- L'échelle officielle n'interdit pas toute autre valeur Tailwind du système, mais les valeurs ci-dessus sont les choix par défaut.
- Ne pas ajouter `p-6` à un panneau contenant déjà plusieurs niveaux d'éléments en `p-6`. Éviter les paddings imbriqués.
- Ne pas mettre une marge verticale identique sur tous les éléments. Utiliser l'espacement du groupe parent (`gap`) et distinguer les groupes des sections.
- Les éléments liés doivent être visuellement proches ; les éléments appartenant à des groupes différents doivent être séparés.
- N'ajouter aucune marge pour « remplir » une page. Si elle semble vide, vérifier d'abord l'ordre, la largeur et la pertinence du contenu.
- Les valeurs arbitraires comme `mt-[37px]`, `gap-[29px]` ou `p-[23px]` sont interdites sauf exception documentée.

## 6. Conteneurs et structure générale

Les limites sont fixes ; la largeur réelle s'adapte à l'espace disponible.

| Contexte | Valeur de référence |
|---|---|
| Contenu des pages publiques | `max-width: 1200px`, centré |
| Zone de travail du dashboard | `max-width: 1280px` à l'intérieur de la zone disponible |
| Formulaire courant | `max-width: 640px` |
| Formulaire long ou complexe | `max-width: 720px` |
| Colonne de lecture | `max-width: 720px` |
| Padding horizontal mobile | 16 px |
| Padding horizontal tablette | 24 px |
| Padding horizontal desktop | 32 px |

- Utiliser un composant partagé de conteneur (`PageContainer` ou équivalent) pour les pages d'une même famille.
- Les valeurs de largeur maximale doivent être des tokens nommés, implémentés dans la version de Tailwind réellement installée.
- Le contenu doit pouvoir occuper la largeur disponible en dessous du maximum (`width: 100%`, `min-width: 0` lorsque pertinent).
- Les formulaires ne doivent pas s'étendre sur tout l'écran desktop ; les tableaux et éditeurs peuvent utiliser plus de largeur lorsque les données le demandent.
- Ne pas appliquer un conteneur public de 1200 px à la prévisualisation d'un CV ou à une modale.
- Éviter les hauteurs fixes autour de contenus variables. Utiliser des hauteurs fixes seulement pour les composants dont la fonction l'exige (barre, champ, bouton, panneau d'édition).

## 7. Dimensions des composants

| Composant | Valeur officielle | Règle |
|---|---|---|
| Navigation publique | 64 px de haut | Une seule ligne sur desktop |
| Barre supérieure de l'app | 56 px de haut | Actions globales, sans titre de page dupliqué |
| Sidebar desktop | 240 px de large | Réductible à 72 px si un mode compact existe déjà ou est justifié |
| Bouton compact | 32 px min. | Actions secondaires denses ; ne pas l'utiliser pour tous les CTA |
| Bouton standard | 40 px min. | Taille courante |
| Bouton principal mobile | 44 px min. | Pour les actions principales et les zones tactiles fréquentes |
| Champ texte / select | 40 px min. | Hauteur uniforme dans un même formulaire |
| Zone de texte | 96 px min. | Peut grandir avec son contenu |
| Icône dans un bouton | 16 px | 20 px si l'action est centrale ou le contrôle plus grand |
| Badge | 22–24 px | Court, textuellement compréhensible |
| Rayon bouton/champ | 6 px | Même forme sur toutes les pages |
| Rayon panneau | 8 px | Panneaux qui ont une vraie fonction de regroupement |
| Rayon modale/popover | 12 px | Surfaces superposées seulement |
| Bordure standard | 1 px | Couleur `border` |

- Les dimensions tactiles doivent respecter l'accessibilité ; 40–44 px est la cible pratique pour les contrôles importants. Ne pas réduire une cible à 16 px sous prétexte que son icône mesure 16 px.
- Tous les composants de même variante partagent les mêmes dimensions.
- Les contrôles doivent s'aligner et ne pas changer de hauteur en fonction de la longueur du libellé, sauf besoin explicite d'un bouton multilignes.
- Une carte n'est pas un composant obligatoire : listes, séparateurs, titres de section ou simple espacement sont souvent meilleurs.

## 8. Règles par famille de pages

### 8.1 Site public : accueil, concept, tarifs, modèles, FAQ, contact

- Navigation de 64 px ; conteneur public de 1200 px maximum ; padding latéral selon le breakpoint.
- Un titre principal (`h1`) par page, un CTA primaire par zone dominante et une hiérarchie de titres logique.
- Le premier écran doit expliquer rapidement ce que CARIEY apporte et montrer le vrai produit ou un exemple fiable, pas un squelette décoratif qui ressemble à une capture finale.
- Organiser l'information selon les questions de l'utilisateur : bénéfice, fonctionnement, exemple/résultat, tarifs et objections fréquentes.
- Éviter l'accumulation de sections répétitives. N'ajouter une section que si elle répond à une question, apporte une preuve ou permet une action.
- Ne jamais inventer de statistiques, avis, logos de partenaires ou résultats de candidature.
- Tarifs, conditions, devises et moyens de paiement doivent provenir d'une source cohérente ; ne pas recopier des valeurs en dur dans plusieurs pages.
- Les liens sociaux ne sont affichés que s'ils fonctionnent réellement. Le formulaire de contact ne doit pas prétendre avoir envoyé un message si l'API n'a pas confirmé la soumission.

### 8.2 Tableau de bord et pages d'outil

- Chaque page commence par un `PageHeader` réutilisable : titre, description facultative et action principale si nécessaire.
- Titre du dashboard : 24/32 px ; description : 14/20 ou 16/24 selon son importance.
- Présenter d'abord l'action ou l'information la plus utile. Les statistiques ne sont affichées que si elles aident à décider ou agir.
- Préférer une liste ou un tableau aux cartes répétées pour les documents, candidatures et éléments qui partagent la même structure.
- Les cartes sont réservées aux groupes autonomes : aperçu statistique utile, formulaire distinct, résultat d'analyse ou action qui doit être visuellement séparée.
- Ne pas répéter dans la page un titre déjà visible dans l'en-tête global.
- Un document récent doit être réellement cliquable s'il semble interactif. Ne pas utiliser `cursor-pointer` sans comportement.
- Les états vides doivent expliquer ce qui manque et fournir une action pertinente.

### 8.3 Profil maître et formulaires

- Un seul modèle de champ partagé avec : label visible, contrôle, aide facultative et erreur directement associée.
- Largeur maximale 640 px pour les formulaires courants, 720 px pour un formulaire long ; les écrans complexes peuvent être divisés en sections cohérentes.
- Label à 14/20 px, graisse 500 ; aide à 12/16 ou 14/20 selon l'importance ; erreur lisible et associée au champ.
- Espacement label/contrôle : 8 px maximum ; séparation entre champs : 16 px ; séparation entre groupes : 24 px.
- Indiquer les champs obligatoires et le format attendu. Ne pas se fier uniquement à un placeholder pour expliquer un champ.
- Pour les formulaires longs, montrer la progression seulement si les étapes correspondent à de vraies étapes utilisateur.
- L'enregistrement automatique doit indiquer honnêtement `Enregistrement…`, `Enregistré` ou `Échec de l'enregistrement`. Ne jamais afficher `Enregistré` avant confirmation.
- En cas d'erreur de validation FastAPI, convertir l'erreur en message compréhensible ; ne pas exposer les tracebacks ou détails internes du serveur.

### 8.4 Analyse d'offre et parcours de candidature

- Garder une même hiérarchie de données entre les points d'entrée vers l'analyse, l'adaptation de CV, la lettre et le suivi.
- Présenter les résultats en sections scannables : correspondances, compétences à renforcer, mots-clés pertinents et recommandations.
- Un score ne doit pas être présenté comme une probabilité garantie d'obtenir un emploi. Donner son sens et ses limites.
- Les états `chargement`, `aucun résultat`, `erreur`, `résultat partiel` et `succès` sont tous prévus.
- Après une action de l'utilisateur, conserver le contexte utile (offre analysée, CV choisi, résultats) ; ne pas lui demander de ressaisir les mêmes informations sans raison.
- Ne jamais faire croire qu'un résultat d'IA a été sauvegardé ou appliqué au CV si ce n'est pas confirmé.

### 8.5 Éditeur de CV et documents

L'éditeur est un outil spécialisé, pas une page dashboard standard.

- Sur grand écran : panneau d'édition à gauche, prévisualisation au centre ; panneau de réglages à droite uniquement si l'espace disponible le permet.
- Valeurs desktop indicatives : panneau d'édition 320 px ; panneau de réglages 280 px ; centre flexible avec largeur minimale utile. Ne pas forcer les trois panneaux sur un écran trop étroit.
- Sous environ 1280 px, rabattre les réglages dans un tiroir/panneau secondaire si nécessaire ; sur mobile, adopter un parcours par étapes ou un affichage édition/aperçu alterné.
- La page A4 conserve le ratio 210:297. La prévisualisation à l'écran peut être mise à l'échelle ; le document exporté doit utiliser son propre système de dimensions et de typographie.
- Ne pas appliquer globalement la police de l'interface, les styles `h1`, les marges ou les contraintes du dashboard au contenu du CV rendu.
- Les réglages d'un document ne doivent pas modifier le profil maître sauf si l'action le dit explicitement. Distinguer clairement les données du profil et les adaptations propres au document.
- Les actions `Enregistrer`, `Aperçu` et `Exporter` doivent être distinctes, leurs états visibles et leur résultat vérifié.
- Toute modification UI de l'éditeur doit être testée avec l'export PDF et, si présent, DOCX. Un aperçu correct à l'écran ne suffit pas.

## 9. Responsive et breakpoints

- Utiliser les breakpoints par défaut de Tailwind tant que le produit n'a pas de besoin démontré de les modifier : `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536 px.
- Tester au minimum les largeurs de viewport 320, 360, 390, 768, 1024, 1280 et 1440 px.
- 320 px est un test de reflow/accessibilité ; 360–390 px représentent les téléphones usuels à vérifier.
- Le padding horizontal est 16 px sur mobile, 24 px sur tablette et 32 px sur desktop, sauf éditeur ou tableau utilisant un modèle spécifique.
- À chaque breakpoint, décider explicitement : empilement, réduction du nombre de colonnes, déplacement d'une action, transformation en tiroir ou tableau à défilement contrôlé.
- Aucun scroll horizontal global sur les pages standards. Un tableau large peut disposer d'un défilement horizontal propre à son conteneur, avec les colonnes importantes identifiées.
- Utiliser `min-w-0` dans les éléments flex/grid lorsque du texte risque d'élargir la page ; gérer les longs noms de fichiers et les URL.
- Ne pas cacher une information essentielle seulement sur mobile. Adapter son emplacement ou sa présentation.
- Respecter le zoom navigateur jusqu'à 200 % et vérifier qu'aucun contenu ni contrôle important ne devient inaccessible.

## 10. Accessibilité

Référence : **WCAG 2.2 niveau AA**.

- Contraste du texte courant d'au moins 4,5:1 ; texte de grande taille d'au moins 3:1.
- Les contrôles interactifs ont un nom accessible, un label et un état compréhensible.
- Toute interaction est utilisable au clavier ; le focus est clairement visible et n'est pas masqué par un en-tête ou une fenêtre.
- Les erreurs sont décrites par du texte et reliées au champ concerné ; l'état ne repose pas uniquement sur le rouge ou le vert.
- Les modales gèrent le focus, la fermeture et le retour du focus à l'élément déclencheur.
- Les icônes qui sont seules dans un bouton doivent posséder un nom accessible ; les icônes purement décoratives sont ignorées par les technologies d'assistance.
- Les zones tactiles importantes visent 40–44 px. La référence WCAG 2.2 AA de taille minimale de cible est un critère différent, avec des exceptions : ne pas considérer 24 px comme la taille recommandée pour tous les boutons.
- Respecter `prefers-reduced-motion`; les transitions courantes restent discrètes (environ 150–200 ms) et ne sont jamais nécessaires pour comprendre une action.
- Ne jamais supprimer l'indicateur de focus sans alternative visible.

## 11. États fonctionnels obligatoires

Chaque composant interactif doit définir les états qui s'appliquent à son rôle :

- **Default** : état normal.
- **Hover** : retour visuel subtil, non indispensable à l'usage tactile.
- **Focus-visible** : contour visible pour la navigation clavier.
- **Active/pressed** : confirmation discrète de l'interaction.
- **Disabled** : aspect et comportement réellement désactivés, avec une raison expliquée si elle n'est pas évidente.
- **Loading** : progression visible ; éviter de bloquer toute la page si seule une zone travaille.
- **Error** : message utile et action de récupération lorsque possible.
- **Empty** : explication et action suivante pertinente.
- **Success** : affiché uniquement après confirmation de l'opération.

Ne pas fabriquer un état visuel qui n'est pas connecté au comportement réel. Pour les appels FastAPI, séparer les erreurs réseau, validation, authentification/autorisation, quota et erreurs serveur lorsque l'utilisateur peut agir différemment selon le cas.

## 12. Règles d'implémentation Next.js / Tailwind

- Avant de modifier le style, lire `package.json`, le fichier CSS global, la configuration Tailwind et le layout racine.
- **Ne pas supposer Tailwind v3 ou v4.** Tailwind v4 utilise les variables `@theme`; Tailwind v3 configure les extensions dans `tailwind.config.*`. Implémenter les tokens selon la version installée, sans mélanger les deux syntaxes et sans migrer de version dans une tâche de design.
- Centraliser couleur, police, typographie, rayons, conteneurs et espacements dans le thème et des composants partagés.
- Réutiliser la bibliothèque de composants déjà installée. Ne pas introduire shadcn/ui, Radix, MUI ou une autre bibliothèque sans vérifier ce qui existe et justifier le coût de migration.
- Privilégier des composants partagés : `PageContainer`, `PageHeader`, `Button`, `Input`, `Field`, `Select`, `Textarea`, `Alert`, `EmptyState`, `Skeleton`, `Dialog`, `DataTable` et composants de l'éditeur si nécessaires.
- Garder les styles métier spécifiques près de la fonctionnalité correspondante ; garder les primitives génériques dans leur dossier partagé.
- Les Server Components restent le choix par défaut quand une interaction navigateur n'est pas nécessaire. Utiliser les Client Components de façon ciblée.
- Éviter les styles inline pour les valeurs fixes. Ils sont acceptables pour les dimensions réellement calculées/dynamiques (zoom de prévisualisation, barre de progression, coordonnées d'un document), avec validation des données.
- Pas de `!important`, de patch CSS contradictoire en fin de fichier, ni de refonte globale de classes pour corriger une seule page.
- Ne pas modifier l'API FastAPI ou les contrats de données dans une tâche strictement visuelle, sauf si un vrai défaut de contrat est découvert et documenté.
- Aucun secret, token, détail interne ou stack trace ne doit être exposé dans le rendu frontend.

## 13. Structure suggérée des composants

À adapter à la structure actuelle ; ne pas déplacer arbitrairement tous les fichiers pendant une correction UI.

- `components/ui/` : primitives partagées et variantes visuelles.
- `components/layout/` : conteneur, navigation, sidebar, en-tête de page.
- `features/profile/` : interface du profil maître.
- `features/documents/` : listes, création et édition des documents.
- `features/applications/` : analyse et suivi de candidature.
- `features/ai/` : résultats et états des fonctionnalités IA.
- `styles/` ou le CSS global existant : tokens et styles globaux, selon l'organisation déjà présente.

Si un composant existe déjà et fait correctement le travail, le conserver plutôt que d'en créer un doublon.

## 14. Validation obligatoire avant de terminer une tâche UI

1. Inspecter les fichiers et la version des dépendances avant de coder.
2. Identifier le problème visible, les pages affectées et le comportement actuel.
3. Faire une correction minimale et réutilisable ; ne pas réécrire une fonctionnalité entière pour obtenir un espacement différent.
4. Lancer les contrôles disponibles : lint, TypeScript, tests pertinents et build si raisonnable dans l'environnement.
5. Ouvrir la page dans un vrai navigateur ou utiliser Playwright pour capturer les largeurs prescrites.
6. Vérifier la densité, l'alignement, les retours à la ligne, les menus, les modales, les messages d'erreur et l'absence de débordement.
7. Vérifier le clavier et les contrastes ; utiliser les outils d'accessibilité déjà présents s'il y en a.
8. Si la page touche l'éditeur/export, vérifier également le PDF/DOCX produit.
9. Comparer le résultat avant/après lorsqu'une capture existe.
10. Rapporter les fichiers modifiés, les tests réellement exécutés, les résultats observés et les contrôles non réalisés.

### Critères d'acceptation

- Les tokens et composants partagés sont utilisés.
- Les espacements et tailles correspondent à ce référentiel ou les exceptions sont justifiées.
- Il n'existe aucun débordement non intentionnel aux largeurs testées.
- Les états de chargement, erreur, vide et succès sont cohérents avec le vrai comportement.
- Les fonctionnalités métier, liens, API et exports ne régressent pas.
- Les contrôles ne sont pas seulement « beaux » : ils restent compréhensibles, accessibles et utilisables.

## 15. Prompt à utiliser avec l'agent de développement

> Lis `DESIGN_RULES.md` avant toute tâche qui modifie l'interface CARIEY. Inspecte d'abord les versions et composants réellement présents. Respecte les tokens et les layouts définis ; ne crée pas de style concurrent et n'ajoute pas de valeurs arbitraires sans justification. Distingue l'interface de l'application du rendu des documents exportés. Effectue la plus petite correction réutilisable, inspecte le résultat réel à plusieurs largeurs, lance les vérifications disponibles et rapporte honnêtement les tests exécutés. Ne déclare jamais la tâche terminée sur la seule base d'un build réussi.

## 16. Limites du présent référentiel

- Ces règles standardisent l'interface ; elles ne prouvent pas à elles seules la conformité complète WCAG ni la sécurité de l'application.
- La cohérence visuelle ne corrige pas les défauts de paiement, d'autorisations, de protection des données ou de quotas IA. Les bloqueurs de lancement et de sécurité identifiés dans l'audit du projet doivent être traités séparément et priorisés.
- Les dimensions ci-dessus sont des décisions produit propres à CARIEY, pas des exigences universelles imposées par les standards web.

## Références techniques

- Tailwind CSS — Theme variables : https://tailwindcss.com/docs/theme
- Next.js — Font optimization : https://nextjs.org/docs/app/getting-started/fonts
- W3C — WCAG 2.2 en français : https://www.w3.org/Translations/WCAG22-fr/
