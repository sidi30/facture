# Instructions de débogage - Application Angular Invoice

## Problème actuel
L'application ne s'affiche pas dans le navigateur.

## Étapes de débogage

### 1. Vérifier la console du navigateur
1. Ouvrez **http://localhost:4200** dans Chrome/Edge
2. Appuyez sur **F12** pour ouvrir les outils de développement
3. Allez dans l'onglet **Console**
4. Recherchez les erreurs JavaScript (en rouge)
5. Notez le message d'erreur exact

### 2. Erreurs courantes et solutions

#### Erreur : "Cannot find module" ou "Module not found"
- **Cause** : Import invalide
- **Solution** : Vérifier tous les imports dans les fichiers TypeScript

#### Erreur : "Property does not exist"
- **Cause** : Propriété ou méthode introuvable
- **Solution** : Vérifier les noms de propriétés dans le template HTML

#### Erreur : "Provider not found"
- **Cause** : Service non fourni
- **Solution** : Vérifier que le service a `@Injectable({ providedIn: 'root' })`

#### Erreur : "Cannot read property of undefined"
- **Cause** : Accès à une propriété d'un objet non initialisé
- **Solution** : Ajouter des vérifications `*ngIf` dans le template

### 3. Si l'application ne compile pas
1. Arrêtez le serveur (Ctrl+C dans le terminal)
2. Exécutez : `npm install`
3. Exécutez : `npm start`
4. Vérifiez les erreurs de compilation dans le terminal

### 4. Si l'application est blanche
1. Vérifiez que le serveur tourne (le terminal devrait afficher "Compiled successfully")
2. Vérifiez la console du navigateur pour les erreurs
3. Essayez de recharger la page (Ctrl+R ou F5)
4. Essayez de vider le cache (Ctrl+Shift+R)

### 5. Solution de contournement temporaire
Si rien ne fonctionne, j'ai créé une version ultra-simple du composant dans `app.component.ts`.

Vérifiez qu'il contient :
```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  template: `
    <div style="background: red; color: white; padding: 20px; margin: 20px;">
      <h1>TEST ULTRA SIMPLE - L'application fonctionne !</h1>
      <p>Titre: {{ title }}</p>
    </div>
  `
})
export class AppComponent {
  title = 'Générateur de Facture – Angular';
}
```

Si cette version s'affiche, cela signifie que le problème vient des imports ou du service.

### 6. Prochaines étapes
Une fois que cette version simple fonctionne, nous pourrons :
1. Réintroduire progressivement le service
2. Réintroduire le template HTML
3. Réintroduire les formulaires réactifs
4. Tester à chaque étape

## Besoin d'aide ?
Envoyez-moi :
1. Le message d'erreur exact de la console du navigateur
2. Le contenu du terminal Angular
3. Une capture d'écran si possible


