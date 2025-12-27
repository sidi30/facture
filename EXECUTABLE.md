# Générateur de Factures - Exécutable Standalone

## 🚀 Création de l'exécutable Windows

### Installation des dépendances

```bash
npm install
```

### Génération de l'exécutable

```bash
npm run package
```

Cela va :
1. Builder l'application Angular en mode production
2. Préparer les fichiers dans `/dist`
3. Créer `facture-app.exe` (environ 50-60 Mo)

## 📦 Utilisation de l'exécutable

1. Double-cliquez sur `facture-app.exe`
2. Un serveur local démarre automatiquement
3. Votre navigateur s'ouvre sur `http://localhost:3500`
4. L'application fonctionne complètement offline !

## ⚙️ Fonctionnalités

- ✅ **Aucune installation requise** : un seul fichier .exe
- ✅ **Fonctionne offline** : pas besoin d'internet
- ✅ **Données locales** : localStorage du navigateur
- ✅ **PDF génération** : export direct en PDF
- ✅ **Portable** : copiez l'exe sur n'importe quel PC Windows

## 🛑 Arrêt du serveur

- Fermez simplement le terminal/console
- Ou appuyez sur `Ctrl+C` dans la console

## 📝 Notes techniques

- **Port** : 3500 (changeable dans `server.js`)
- **Node version** : 18.x embarqué
- **Taille** : ~50-60 Mo (tout inclus)
- **Compatibilité** : Windows 64-bit

## 🔧 Personnalisation

### Changer le port

Éditez `server.js` ligne 6 :
```javascript
const PORT = 3500; // Changez cette valeur
```

Puis recréez l'exe avec `npm run package`.

### Tester le serveur sans compiler

```bash
npm run build:standalone
npm run start:server
```

## 📋 Commandes disponibles

| Commande | Description |
|----------|-------------|
| `npm run build:standalone` | Build Angular + prépare /dist |
| `npm run start:server` | Lance le serveur (test) |
| `npm run package` | Crée facture-app.exe |

## ⚠️ Résolution de problèmes

**L'exe ne démarre pas :**
- Vérifiez l'antivirus (peut bloquer)
- Exécutez en tant qu'administrateur

**Le navigateur ne s'ouvre pas :**
- Ouvrez manuellement `http://localhost:3500`

**Port déjà utilisé :**
- Un autre programme utilise le port 3500
- Changez le port dans `server.js`

## 📦 Distribution

L'exécutable `facture-app.exe` peut être :
- Copié sur clé USB
- Envoyé par email (si < 25 Mo, sinon WeTransfer)
- Partagé sur réseau local
- Exécuté depuis n'importe quel dossier

**Aucune installation n'est nécessaire !**

