/**
 * sync-template-css.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Rôle : Copie les fichiers `style.css` de chaque thème CV dans `public/template-assets/`
 *        pour qu'ils soient accessibles en tant qu'assets statiques.
 *
 * Pourquoi : Les templates React importent leur CSS via une URL relative au serveur
 *            (`/template-assets/<theme>/style.css`). Next.js ne peut pas servir
 *            des fichiers hors du dossier `public/` directement depuis `components/`.
 *
 * Ce script est exécuté automatiquement avant `npm run dev` et `npm run build`
 * via les hooks `predev` et `prebuild` du package.json.
 *
 * Source : components/app/cv/templates/<theme>/style.css
 * Destination : public/template-assets/<theme>/style.css
 *
 * En cas d'échec : Les styles des templates CV ne s'appliquent pas —
 *                  les CV s'affichent sans mise en forme.
 * ─────────────────────────────────────────────────────────────────────────────
 */
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'components', 'app', 'cv', 'templates');
const dest = path.join(__dirname, '..', 'public', 'template-assets');

// Auto-découverte : on scanne le dossier des templates
const templates = fs.readdirSync(src).filter(name => {
  const templateDir = path.join(src, name);
  return fs.statSync(templateDir).isDirectory() && fs.existsSync(path.join(templateDir, 'style.css'));
});

let synced = 0;
for (const tmpl of templates) {
  const srcFile = path.join(src, tmpl, 'style.css');
  const destDir = path.join(dest, tmpl);
  const destFile = path.join(destDir, 'style.css');
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(srcFile, destFile);
  synced++;
}
console.log(`✓ ${synced} template CSS synced to public/template-assets/ [${templates.join(', ')}]`);
