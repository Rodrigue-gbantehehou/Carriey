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
