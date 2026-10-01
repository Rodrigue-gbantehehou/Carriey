/**
 * generate-templates.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Rôle : Génère automatiquement les fichiers `registry.ts` pour chaque type
 *        de template (CV, Lettre, Page publique).
 *
 * Pourquoi : Les templates sont des composants React dans des sous-dossiers.
 *            Au lieu d'importer chaque template manuellement, un registre
 *            `registry.ts` est généré avec des `React.lazy()` pour chacun.
 *            Cela permet l'ajout d'un nouveau template sans modifier de code.
 *
 * Ce script est exécuté automatiquement avant `npm run dev` et `npm run build`
 * via les hooks `predev` et `prebuild` du package.json.
 *
 * Registres générés :
 *   - components/app/cv/templates/registry.ts         → CV_TEMPLATE_REGISTRY
 *   - components/app/letter/templates/registry.ts     → LETTER_TEMPLATE_REGISTRY
 *   - components/app/public-page/templates/registry.ts→ PUBLIC_PAGE_TEMPLATE_REGISTRY
 *
 * Convention : Chaque dossier de template doit contenir un fichier `Template.tsx`.
 *
 * En cas d'échec : Les templates ne sont pas trouvés, les CV/lettres ne s'affichent pas.
 *                  Le fichier registry.ts existant est conservé tel quel.
 * ─────────────────────────────────────────────────────────────────────────────
 */
const fs = require('fs');

const path = require('path');

const FRONTEND_DIR = path.resolve(__dirname, '..');

const generateRegistry = (type, templatesDirRelativePath) => {
  const templatesDir = path.join(FRONTEND_DIR, templatesDirRelativePath);
  
  if (!fs.existsSync(templatesDir)) {
    console.log(`Directory ${templatesDir} does not exist, skipping...`);
    return;
  }

  // Find all subdirectories that contain a Template.tsx or Template.jsx
  const templateFolders = fs.readdirSync(templatesDir).filter(item => {
    const itemPath = path.join(templatesDir, item);
    if (!fs.statSync(itemPath).isDirectory()) return false;
    
    return fs.existsSync(path.join(itemPath, 'Template.tsx')) || 
           fs.existsSync(path.join(itemPath, 'Template.jsx'));
  });

  console.log(`Found ${templateFolders.length} ${type} templates: ${templateFolders.join(', ')}`);

  const registryContent = `// Fichier généré automatiquement. NE PAS MODIFIER !
// Pour mettre à jour ce fichier, lancez: npm run generate-templates
import { lazy } from 'react';

export const ${type}_TEMPLATE_REGISTRY: Record<string, any> = {
${templateFolders.map(folder => `  "${folder}": lazy(() => import('./${folder}/Template'))`).join(',\n')}
};
`;

  const registryPath = path.join(templatesDir, 'registry.ts');
  fs.writeFileSync(registryPath, registryContent, 'utf-8');
  console.log(`Successfully generated ${registryPath}`);
};

// Generate CV Templates
generateRegistry('CV', 'components/app/cv/templates');

// Generate Letter Templates
generateRegistry('LETTER', 'components/app/letter/templates');

// Generate Public Page Templates (if applicable)
generateRegistry('PUBLIC_PAGE', 'components/app/public-page/templates');
