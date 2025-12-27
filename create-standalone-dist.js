const fs = require('fs-extra');
const path = require('path');

const sourceDir = path.join(__dirname, 'dist', 'angular-invoice-app', 'browser');
const targetDir = path.join(__dirname, 'dist');

console.log('📦 Préparation du build standalone...');

// Supprimer le dossier angular-invoice-app
if (fs.existsSync(path.join(targetDir, 'angular-invoice-app'))) {
  console.log('  → Nettoyage de la structure...');
  
  // Copier le contenu de browser à la racine de dist
  fs.copySync(sourceDir, targetDir);
  
  // Supprimer le dossier angular-invoice-app
  fs.removeSync(path.join(targetDir, 'angular-invoice-app'));
  
  console.log('✓ Build standalone prêt dans /dist');
} else {
  console.log('✓ Structure déjà correcte');
}

