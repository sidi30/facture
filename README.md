# Générateur de Facture Angular

Une application Angular 17 standalone pour créer et générer des factures professionnelles en PDF avec toutes les fonctionnalités nécessaires pour la facturation française.

## 🚀 Fonctionnalités

### ✨ Fonctionnalités principales
- **Génération PDF haute qualité** avec html2canvas + jsPDF
- **Numérotation automatique** des factures (FACT-YYYY-###)
- **Formulaires réactifs** avec validations complètes
- **Sauvegarde automatique** des brouillons dans localStorage
- **Import/Export JSON** pour sauvegarder et partager les factures
- **Upload de logo** personnalisé
- **Sélecteur de période** (mois/année) avec mise à jour automatique
- **Presets de clients** (Synanto, Nouveau client)
- **Calculs TVA** automatiques (franchise, 20%, 10%, 5.5%)
- **Validation IBAN/BIC** française
- **Design responsive** et accessible
- **Impression navigateur** optimisée

### 📋 Gestion des factures
- **Lignes multiples** : Ajout/suppression de lignes de facturation
- **Calculs automatiques** : Total HT, TVA, Total TTC
- **Remises** par ligne
- **Échéances** personnalisables
- **Informations légales** conformes au droit français

### 🎨 Interface utilisateur
- **Design moderne** et professionnel
- **Aperçu en temps réel** de la facture
- **Messages d'erreur** clairs en français
- **Notifications** de succès/erreur
- **Navigation clavier** optimisée
- **Contraste** respecté pour l'accessibilité

## 🛠️ Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Angular CLI 17+

### Installation des dépendances
```bash
npm install
```

### Démarrage en développement
```bash
npm start
```
L'application sera accessible sur `http://localhost:4200`

### Build de production
```bash
npm run build
```

### Tests unitaires
```bash
npm test
```

## 📁 Structure du projet

```
src/
├── app/
│   ├── models/
│   │   └── invoice.ts              # Interfaces TypeScript
│   ├── services/
│   │   ├── invoice.service.ts       # Service principal
│   │   └── invoice.service.spec.ts  # Tests du service
│   ├── validators/
│   │   ├── custom.validators.ts     # Validateurs personnalisés
│   │   └── custom.validators.spec.ts # Tests des validateurs
│   ├── app.component.ts             # Composant principal
│   ├── app.component.html          # Template
│   └── app.component.css           # Styles du composant
├── styles.css                      # Styles globaux
└── main.ts                         # Point d'entrée
```

## 🔧 Configuration

### Valeurs par défaut
L'application démarre avec des valeurs préconfigurées :

**Émetteur :**
- Nom : Ramzi SIDI IBRAHIM
- Statut : Micro-entreprise
- Adresse : 343 Rue Simone Weil, villa 8, 84100 ORANGE, FRANCE
- Email : rsidiibrahim@gmail.com
- Téléphone : 06 50 31 47 22

**Client par défaut :**
- Nom : Synanto Montpellier
- Adresse : 610 Rue Alfred Nobel, 34000 MONTPELLIER, FRANCE
- Email : contact@synanto.fr

**Prestation :**
- Description : Prestation de développement / consulting (septembre)
- Quantité : 7 jours
- Prix unitaire : 465 €
- TVA : Franchise (art. 293 B)

### Personnalisation
Vous pouvez modifier les valeurs par défaut dans `src/app/models/invoice.ts` :

```typescript
export const DEFAULT_INVOICE: Invoice = {
  seller: {
    name: 'Votre Nom',
    // ... autres champs
  },
  // ...
};
```

## 📄 Génération PDF

### Qualité et format
- **Format** : A4 (210mm × 297mm)
- **Résolution** : Scale 3x pour une netteté optimale
- **Couleurs** : Fidèles à l'aperçu écran
- **Marges** : 18mm sur tous les côtés
- **Pagination** : Automatique si le contenu dépasse une page

### Configuration PDF
La génération PDF utilise :
- **html2canvas** : Rendu haute qualité (scale: 3)
- **jsPDF** : Création du PDF avec pagination
- **Nom de fichier** : `{numéro_facture}.pdf`

### Styles d'impression
Les styles CSS `@media print` optimisent l'impression navigateur :
- Masquage des contrôles de formulaire
- Conservation de la mise en page A4
- Couleurs et polices optimisées

## 💾 Stockage et données

### Sauvegarde automatique
- **localStorage** : Sauvegarde automatique des modifications
- **Clé** : `invoice-draft`
- **Format** : JSON complet de la facture

### Import/Export
- **Export JSON** : Sauvegarde complète de la facture
- **Import JSON** : Chargement d'une facture existante
- **Validation** : Vérification de la structure lors de l'import

### Numérotation automatique
- **Format** : `FACT-YYYY-###` (ex: FACT-2024-001)
- **Persistance** : Compteur sauvé dans localStorage par année
- **Incrément** : Automatique à chaque génération

## ✅ Validations

### Champs obligatoires
- Nom émetteur/client
- Adresse émetteur/client  
- Numéro de facture
- Date de facture
- Description des prestations
- Quantité et prix unitaire

### Validations spécialisées
- **IBAN français** : Algorithme mod97 complet
- **BIC** : Format 8 ou 11 caractères
- **Email** : Format standard RFC
- **Téléphone** : Format français (06 XX XX XX XX)
- **Nombres** : Positifs ou zéro uniquement

## 🎯 Utilisation

### Création d'une facture
1. **Remplir les informations** émetteur/client
2. **Sélectionner la période** (mois/année)
3. **Ajouter les prestations** (lignes multiples)
4. **Configurer la TVA** selon votre statut
5. **Générer le PDF** ou imprimer

### Presets clients
- **Synanto** : Client par défaut préconfiguré
- **Nouveau client** : Formulaire vide

### Gestion des lignes
- **Ajouter** : Bouton "➕ Ajouter une ligne"
- **Supprimer** : Bouton "🗑️ Supprimer" (minimum 1 ligne)
- **Calculs** : Automatiques en temps réel

## 🔍 Tests

### Tests unitaires inclus
- **Validateurs** : IBAN, BIC, email, téléphone, nombres
- **Service** : Calculs, numérotation, import/export
- **Calculs** : Totaux HT/TVA/TTC avec différents taux

### Exécution des tests
```bash
# Tests en mode watch
npm test

# Tests une seule fois
npm test -- --watch=false
```

## 📱 Responsive Design

### Breakpoints
- **Desktop** : Layout 2 colonnes (formulaire + aperçu)
- **Mobile** : Layout 1 colonne (formulaire au-dessus)

### Optimisations mobile
- Boutons d'action empilés verticalement
- Grilles adaptatives (2→1 colonne)
- Aperçu facture redimensionné
- Navigation tactile optimisée

## 🎨 Personnalisation

### Couleurs et thème
Modifiez les variables CSS dans `src/styles.css` :

```css
:root {
  --brand: #0ea5e9;    /* Couleur principale */
  --accent: #22c55e;   /* Couleur d'accent */
  --error: #ef4444;    /* Couleur d'erreur */
  --success: #22c55e;  /* Couleur de succès */
}
```

### Logo personnalisé
- **Formats acceptés** : PNG, JPG, SVG
- **Taille max** : 2MB
- **Stockage** : DataURL dans localStorage
- **Affichage** : 46×46px dans l'en-tête

## 🚨 Dépannage

### Problèmes courants

**PDF ne se génère pas :**
- Vérifiez que tous les champs obligatoires sont remplis
- Assurez-vous que le navigateur autorise les téléchargements

**Données perdues :**
- Vérifiez que localStorage est activé
- Utilisez l'export JSON pour sauvegarder

**Erreurs de validation :**
- Vérifiez le format IBAN (FR + 2 chiffres + 23 caractères)
- Vérifiez le format BIC (8 ou 11 caractères)

### Logs de débogage
Ouvrez la console développeur (F12) pour voir les logs détaillés.

## 📋 Notes TVA

### Franchise en base (art. 293 B)
- **Condition** : Chiffre d'affaires < seuils légaux
- **Mention** : "TVA non applicable – art. 293 B du CGI"
- **Calcul** : Aucune TVA ajoutée

### Taux de TVA applicables
- **20%** : Taux normal (majorité des prestations)
- **10%** : Taux réduit (certaines prestations)
- **5,5%** : Taux super-réduit (très spécifique)

### Mentions légales obligatoires
- Taux de TVA appliqué
- Article de référence du CGI
- Conditions de paiement

## 🤝 Contribution

### Structure recommandée
- **Modèles** : `src/app/models/`
- **Services** : `src/app/services/`
- **Validateurs** : `src/app/validators/`
- **Tests** : Fichiers `.spec.ts` associés

### Standards de code
- **TypeScript strict** activé
- **Angular standalone** components
- **Reactive Forms** pour les formulaires
- **Tests unitaires** pour toute nouvelle fonctionnalité

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

## 👨‍💻 Auteur

**Ramzi SIDI IBRAHIM**
- Email : rsidiibrahim@gmail.com
- Téléphone : 06 50 31 47 22

---

*Application développée avec Angular 17, html2canvas et jsPDF pour une génération PDF professionnelle.*
