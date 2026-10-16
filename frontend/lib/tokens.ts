/**
 * CARIEY Design System & Branding Tokens
 * ============================================================================
 * SOURCE UNIQUE DE VÉRITÉ pour l'ensemble de l'identité, du branding
 * et des tokens graphiques de l'application Carriey.
 * 
 * Conforme au référentiel officiel CARIEY_DESIGN_RULES.md.
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// 1. BRAND IDENTITY & PROMISE
// ----------------------------------------------------------------------------
export const brand = {
  name: 'Carriey',
  tagline: 'Your professional profile, everywhere.',
  promise: 'Centralisez votre profil professionnel, créez des CV percutants et gérez vos candidatures en un seul endroit.',
  logo: '/logo.png',
  favicon: '/favicon.ico',
  currency: {
    default: 'XOF',
    symbol: 'FCFA',
  },
} as const;

// ----------------------------------------------------------------------------
// 2. COLOR SYSTEM (Accessible & Semantically Defined)
// ----------------------------------------------------------------------------
export const colors = {
  // Arrière-plans & Surfaces
  background: {
    DEFAULT: '#FFFFFF',
    subtle: '#F8FAFC',
    muted: '#F1F5F9',
    dark: '#0F172A',
  },

  // Hiérarchie de texte (contrastes WCAG AA vérifiés)
  text: {
    primary: '#0F172A',   // Titres et textes dominants
    secondary: '#475569', // Corps de texte d'interface, navigation
    muted: '#64748B',     // Métadonnées, placeholders, labels secondaires
    inverse: '#FFFFFF',   // Sur fond sombre ou bouton primaire
  },

  // Bordures & Séparateurs
  border: {
    DEFAULT: '#E2E8F0',
    subtle: '#F1F5F9',
    focus: '#1D4ED8',
  },

  // Action principale (Bleu institutionnel Carriey)
  primary: {
    DEFAULT: '#1D4ED8',
    hover: '#1E40AF',
    subtle: '#EFF6FF',
    active: '#172554',
  },

  // Couleurs fonctionnelles d'état (Strictement réservées à leur sens fonctionnel)
  info: {
    text: '#1D4ED8',
    bg: '#EFF6FF',
    border: 'rgba(29, 78, 216, 0.2)',
  },
  success: {
    text: '#166534',
    bg: '#F0FDF4',
    border: 'rgba(22, 101, 52, 0.2)',
  },
  warning: {
    text: '#92400E',
    bg: '#FFFBEB',
    border: 'rgba(146, 64, 14, 0.2)',
  },
  danger: {
    text: '#B91C1C',
    bg: '#FEF2F2',
    border: 'rgba(185, 28, 28, 0.2)',
  },
} as const;

// ----------------------------------------------------------------------------
// 3. TYPOGRAPHY SYSTEM
// ----------------------------------------------------------------------------
export const typography = {
  // Familles de polices
  fonts: {
    sans: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    heading: 'var(--font-inter), sans-serif',
    // Polices de templates de documents (CV, lettre)
    templateHeading: 'Marcellus, Georgia, serif',
    templateBody: 'Outfit, sans-serif',
  },

  // Graisses autorisées
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Échelle fixe officielle [font-size, line-height]
  scale: {
    'ui-xs': ['12px', '16px'], // Métadonnées secondaires uniquement (>= 12px)
    'ui-sm': ['14px', '20px'], // Base du tableau de bord, boutons, inputs, tableaux
    'ui-base': ['16px', '24px'], // Textes longs, landing pages, aide explicative
    'ui-lg': ['18px', '26px'], // Titre de section compacte
    'ui-xl': ['20px', '28px'], // Sous-titre majeur
    'ui-2xl': ['24px', '32px'], // Titre principal de page (Dashboard / App)
    'ui-3xl': ['30px', '38px'], // Titres marketing ou scores héro
    'ui-4xl': ['40px', '48px'], // Titre principal marketing grand écran
  },
} as const;

export const fontSizes = typography.scale;

// ----------------------------------------------------------------------------
// 4. RAYONS DE COURBURE (Border Radius)
// ----------------------------------------------------------------------------
export const borderRadius = {
  button: '6px', // Boutons et CTA
  field: '6px',  // Inputs, selects, textareas
  panel: '8px',  // Cartes, conteneurs, widgets
  modal: '12px', // Modales, dialogs, popovers
  badge: '9999px', // Badges et pilules d'état
} as const;

// ----------------------------------------------------------------------------
// 5. GRILLE MODULAIRE D'ESPACEMENT (Grille de base 4px)
// ----------------------------------------------------------------------------
export const spacing = {
  1: '4px',   // Écart interne minimal (icône/texte compact)
  2: '8px',   // Écart icône + libellé, label + aide
  3: '12px',  // Espacement petits groupes et champs proches
  4: '16px',  // Padding standard d'un panneau, marge entre champs
  5: '20px',  // Marge intermédiaire
  6: '24px',  // Séparation entre blocs liés
  8: '32px',  // Séparation d'une section majeure
  10: '40px', // Grande séparation (landing pages)
  12: '48px', // Espace d'aération marketing
} as const;

// ----------------------------------------------------------------------------
// 6. LARGEURS DE CONTENEURS (Max-Widths)
// ----------------------------------------------------------------------------
export const maxWidth = {
  form: '640px',       // Formulaire standard (évite les lignes infinies)
  column: '720px',     // Formulaire complexe ou colonne de lecture
  reading: '720px',    // Articles, CGU, documentation
  public: '1200px',    // Pages publiques / marketing
  dashboard: '1280px', // Zone de travail du tableau de bord
} as const;

// ----------------------------------------------------------------------------
// 7. DIMENSIONS FIXES DES COMPOSANTS
// ----------------------------------------------------------------------------
export const dimensions = {
  navPublicHeight: '64px',
  topbarAppHeight: '56px',
  sidebarWidth: '240px',
  sidebarCollapsedWidth: '72px',
  buttonHeightSm: '32px',
  buttonHeightMd: '40px',
  buttonHeightLg: '44px',
  inputHeight: '40px',
  textareaMinHeight: '96px',
  badgeHeight: '24px',
} as const;

// ----------------------------------------------------------------------------
// 8. OMBRES & ÉLÉVATION (Subtiles et fonctionnelles uniquement)
// ----------------------------------------------------------------------------
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  dropdown: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  modal: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const;

// ----------------------------------------------------------------------------
// 9. BREAKPOINTS RESPONSIVE
// ----------------------------------------------------------------------------
export const breakpoints = {
  xs: '300px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ----------------------------------------------------------------------------
// 10. TRANSITIONS & ANIMATIONS
// ----------------------------------------------------------------------------
export const transitions = {
  fast: '150ms ease-out',
  normal: '200ms ease-out',
  slow: '300ms ease-out',
} as const;

export const animations = {
  fadeIn: 'fadeIn 0.2s ease-out forwards',
  slideUp: 'slideUp 0.3s ease-out forwards',
} as const;

// ----------------------------------------------------------------------------
// 11. MAPPINGS SÉMANTIQUES DES STATUTS
// Centralise l'affichage des badges et libellés d'état métier
// ----------------------------------------------------------------------------
export const statusMappings = {
  // Statuts de candidature
  candidature: {
    BROUILLON: { label: 'Brouillon', variant: 'default' as const },
    ENVOYEE: { label: 'Envoyée', variant: 'info' as const },
    ENTRETIEN: { label: 'Entretien', variant: 'warning' as const },
    OFFRE: { label: 'Offre reçue', variant: 'success' as const },
    REFUSEE: { label: 'Refusée', variant: 'danger' as const },
    ACCEPTEE: { label: 'Acceptée', variant: 'success' as const },
  },

  // Statuts de documents (CV, Lettre)
  document: {
    BROUILLON: { label: 'Brouillon', variant: 'default' as const },
    PUBLIE: { label: 'En ligne', variant: 'success' as const },
    PRIVE: { label: 'Privé', variant: 'neutral' as const },
  },
} as const;

// ----------------------------------------------------------------------------
// EXPORT AGGRÉGÉ DE L'OBJET TOKENS
// ----------------------------------------------------------------------------
export const tokens = {
  brand,
  colors,
  typography,
  fontSizes,
  borderRadius,
  spacing,
  maxWidth,
  dimensions,
  shadows,
  breakpoints,
  transitions,
  animations,
  statusMappings,
} as const;

export type DesignTokens = typeof tokens;
export type BrandTokens = typeof brand;
export type ColorTokens = typeof colors;
export type TypographyTokens = typeof typography;
export type BorderRadiusTokens = typeof borderRadius;
export type MaxWidthTokens = typeof maxWidth;
export type SpacingTokens = typeof spacing;
export type DimensionsTokens = typeof dimensions;

export default tokens;
