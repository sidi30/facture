const fs = require('fs-extra');
const path = require('path');

console.log('📦 Création du package de distribution...');

const releaseDir = path.join(__dirname, 'release');
const distDir = path.join(__dirname, 'dist');
const exePath = path.join(__dirname, 'facture-app.exe');

// Nettoyer le dossier release s'il existe
if (fs.existsSync(releaseDir)) {
  console.log('  → Nettoyage du dossier release...');
  fs.removeSync(releaseDir);
}

// Créer le dossier release
fs.ensureDirSync(releaseDir);

// Copier l'exe
if (fs.existsSync(exePath)) {
  console.log('  → Copie de facture-app.exe...');
  fs.copyFileSync(exePath, path.join(releaseDir, 'facture-app.exe'));
} else {
  console.error('❌ ERREUR: facture-app.exe introuvable !');
  process.exit(1);
}

// Copier le dossier dist
if (fs.existsSync(distDir)) {
  console.log('  → Copie du dossier dist...');
  fs.copySync(distDir, path.join(releaseDir, 'dist'));
} else {
  console.error('❌ ERREUR: Le dossier dist introuvable !');
  process.exit(1);
}

// Copier le fichier LISEZMOI
const readmePath = path.join(__dirname, 'LISEZMOI-EXE.txt');
if (fs.existsSync(readmePath)) {
  console.log('  → Copie de LISEZMOI-EXE.txt...');
  fs.copyFileSync(readmePath, path.join(releaseDir, 'LISEZMOI.txt'));
}

console.log('');
console.log('✅ Package créé dans le dossier /release');
console.log('');
console.log('📂 Contenu:');
console.log('   - facture-app.exe (exécutable)');
console.log('   - dist/ (fichiers de l\'application)');
console.log('   - LISEZMOI.txt (instructions)');
console.log('');
console.log('💡 Pour distribuer: zipper le dossier /release complet');

