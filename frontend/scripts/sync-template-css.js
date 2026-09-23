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
