#!/usr/bin/env node
const express = require('express');
const path = require('path');
const open = require('open');
const fs = require('fs');

const app = express();
const PORT = 3500;

// Déterminer le bon chemin pour les fichiers statiques
// Si on est dans un exe pkg, les assets sont à côté de l'exe
let distPath;
if (process.pkg) {
  // Mode exécutable pkg
  distPath = path.join(path.dirname(process.execPath), 'dist');
} else {
  // Mode développement
  distPath = path.join(__dirname, 'dist');
}

console.log(`📁 Chemin dist: ${distPath}`);

// Vérifier que le dossier existe
if (!fs.existsSync(distPath)) {
  console.error(`❌ ERREUR: Le dossier dist n'existe pas: ${distPath}`);
  console.error(`   Veuillez vous assurer que le build a été fait avant de créer l'exe.`);
  process.exit(1);
}

// Servir les fichiers statiques depuis le dossier dist
app.use(express.static(distPath));

// Fallback pour Angular routing (SPA)
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error(`❌ ERREUR: index.html introuvable: ${indexPath}`);
    return res.status(500).send('Fichiers de l\'application introuvables');
  }
  res.sendFile(indexPath);
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`✓ Serveur démarré sur http://localhost:${PORT}`);
  console.log(`✓ Ouverture du navigateur...`);
  
  // Ouvrir automatiquement le navigateur
  open(`http://localhost:${PORT}`).catch(err => {
    console.log('⚠ Impossible d\'ouvrir le navigateur automatiquement.');
    console.log(`   Ouvrez manuellement : http://localhost:${PORT}`);
  });
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  Générateur de Factures - Application Locale');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log('  Démarrage en cours...');
console.log('');

