#!/usr/bin/env node
const express = require('express');
const path = require('path');
const open = require('open');

const app = express();
const PORT = 3500;

// Servir les fichiers statiques depuis le dossier dist
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback pour Angular routing (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
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

