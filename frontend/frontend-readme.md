# PixelArt Frontend - Guide du Développeur

Ce document contient toutes les informations nécessaires pour configurer, exécuter et maintenir l'application frontend du projet PixelBoard.

![PixelArt App](https://via.placeholder.com/800x400?text=PixelArt+App)

## Sommaire

- [Prérequis](#prérequis)
- [Installation](#installation)
- [Démarrage](#démarrage)
- [Structure du Projet](#structure-du-projet)
- [Fonctionnalités Principales](#fonctionnalités-principales)
- [Gestion des Thèmes](#gestion-des-thèmes)
- [Contextes et États Globaux](#contextes-et-états-globaux)
- [WebSockets et Communication en Temps Réel](#websockets-et-communication-en-temps-réel)
- [Gestion des Routes](#gestion-des-routes)
- [Services API](#services-api)
- [Composants Réutilisables](#composants-réutilisables)
- [Optimisation des Performances](#optimisation-des-performances)
- [Guide de Style et Conventions](#guide-de-style-et-conventions)
- [Tests](#tests)
- [Déploiement](#déploiement)
- [Résolution des Problèmes](#résolution-des-problèmes)
- [Collaborateurs](#collaborateurs)

## Prérequis

- Node.js (v18 ou supérieur)
- npm ou yarn
- Un navigateur moderne (Chrome, Firefox, Safari, Edge)

## Installation

1. Cloner le dépôt et naviguer vers le dossier frontend:
   ```bash
   git clone https://github.com/uncyzer/MBDS-Pixel-Art-REACT.git
   cd MBDS-Pixel-Art-REACT/frontend
   ```

2. Installer les dépendances:
   ```bash
   npm install
   # ou
   yarn install
   ```

3. Créer un fichier `.env.local` à la racine du dossier frontend (optionnel):
   ```
   VITE_API_URL=http://localhost:3000/api
   VITE_WS_URL=ws://localhost:3001
   ```

## Démarrage

### En mode développement
```bash
npm run dev
# ou
yarn dev
```
L'application sera accessible à l'adresse http://localhost:5173 avec rechargement à chaud.

### Prévisualisation de la production
```bash
npm run build
npm run preview
# ou
yarn build
yarn preview
```

### Vérification du code
```bash
npm run lint
# ou
yarn lint
```

## Structure du Projet

```
frontend/
├── public/               # Fichiers statiques
├── src/
│   ├── assets/           # Images et ressources statiques
│   ├── components/       # Composants React réutilisables
│   │   ├── common/       # Composants d'UI génériques
│   │   ├── navigation/   # Composants de navigation
│   │   ├── pixel-board/  # Composants spécifiques au PixelBoard
│   │   ├── routing/      # Composants de gestion de routes
│   │   ├── super-board/  # Composants du SuperPixelBoard
│   │   └── export/       # Composants d'exportation
│   ├── contexts/         # Contextes React (auth, thème)
│   ├── hooks/            # Hooks personnalisés
│   ├── layouts/          # Structures de mise en page
│   ├── pages/            # Composants de page
│   ├── services/         # Services d'API et logique métier
│   ├── styles/           # Fichiers CSS globaux et par composant
│   ├── types/            # Types TypeScript
│   ├── utils/            # Fonctions utilitaires
│   ├── App.tsx           # Composant racine
│   ├── Router.tsx        # Configuration du routeur
│   ├── index.tsx         # Point d'entrée
│   └── index.css         # Styles CSS globaux
├── .env.example          # Variables d'environnement d'exemple
├── .eslintrc.json        # Configuration ESLint
├── .prettierrc           # Configuration Prettier
├── index.html            # Fichier HTML principal
├── package.json          # Dépendances et scripts npm
├── tsconfig.json         # Configuration TypeScript
└── vite.config.ts        # Configuration Vite
```

## Fonctionnalités Principales

### Système d'Authentification

L'application utilise un système d'authentification basé sur JWT avec:
- Inscription et connexion des utilisateurs
- Gestion des rôles (invité, utilisateur, premium, administrateur)
- Protection des routes en fonction des rôles
- Gestion du profil utilisateur et préférences

```typescript
// Exemple d'utilisation du contexte d'authentification
import { useAuth } from '@/contexts/AuthContext';

const MyComponent = () => {
  const { isAuthenticated, currentUser, login, logout } = useAuth();
  
  // ...
};
```

### PixelBoard

Le cœur de l'application est le système de PixelBoard qui permet:
- Visualisation des tableaux de pixels
- Placement de pixels avec sélection de couleurs
- Système de cooldown entre les placements
- Limitations en fonction des rôles utilisateur
- Historique des pixels placés

```typescript
// Exemple d'utilisation du composant PixelBoardDisplay
<PixelBoardDisplay
  board={board}
  readOnly={!canPlacePixel()}
  onPixelPlaced={handlePixelPlaced}
  selectedColor={selectedColor}
  canEdit={board.is_active && isAuthenticated}
  onColorSelect={handleColorSelect}
/>
```

### SuperPixelBoard

Le SuperPixelBoard combine tous les tableaux existants en une seule vue:
- Navigation et zoom sur tous les tableaux
- Affichage des détails au survol des pixels
- Filtrage par statut et recherche
- Vue d'ensemble des contributions de la communauté

### Statistiques et Contributions

- Tableau de bord des contributions personnelles
- Visualisations et graphiques temporels
- Heatmaps d'activité par tableau
- Exportation des données au format CSV

### Exportation

- Exportation des PixelBoards en SVG ou PNG
- Options de redimensionnement
- Téléchargement automatique des fichiers

## Gestion des Thèmes

L'application supporte trois modes de thème:
- Clair
- Sombre
- Système (suit les préférences du système d'exploitation)

Le thème est géré via le contexte `ThemeContext` et stocké dans le localStorage pour persistance.

```typescript
// Exemple d'utilisation du contexte de thème
import { useTheme } from '@/contexts/ThemeContext';

const MyComponent = () => {
  const { theme, setTheme, actualTheme, toggleTheme } = useTheme();
  
  // ...
};
```

## Contextes et États Globaux

L'application utilise plusieurs contextes React pour gérer l'état global:

1. **AuthContext**: Gestion de l'authentification et des informations utilisateur
2. **ThemeContext**: Gestion du thème de l'application
3. **WebSocketContext**: Gestion des connexions WebSocket pour les mises à jour en temps réel

## WebSockets et Communication en Temps Réel

L'application utilise WebSockets pour:
- Mise à jour en temps réel des tableaux
- Affichage du nombre d'utilisateurs connectés
- Notifications d'activité

```typescript
// Exemple d'abonnement aux mises à jour de pixels
useEffect(() => {
  if (!id) return;
  
  // S'abonner aux mises à jour de pixels
  const unsubscribe = WebSocketService.onPixelUpdate(handlePixelUpdate);
  
  // Nettoyage à la démonture du composant
  return () => {
    unsubscribe();
  };
}, [id, handlePixelUpdate]);
```

## Gestion des Routes

L'application utilise React Router v6 avec:
- Routes publiques
- Routes protégées par authentification
- Routes protégées par rôle
- Redirection après authentification

```tsx
// Structure simplifiée du routeur
<Routes>
  {/* Routes publiques */}
  <Route element={<PublicRoute />}>
    <Route path="/" element={<Home />} />
    <Route path="/pixel-boards" element={<PixelBoards />} />
  </Route>

  {/* Routes d'authentification */}
  <Route element={<PublicRoute restricted />}>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
  </Route>

  {/* Routes protégées par authentification */}
  <Route element={<PrivateRoute />}>
    <Route path="/profile" element={<Profile />} />
  </Route>

  {/* Routes protégées par rôle */}
  <Route element={<PrivateRoute requiredRoles={['admin']} />}>
    <Route path="/admin" element={<Admin />} />
  </Route>
</Routes>
```

## Services API

Les services API sont organisés par domaine fonctionnel:

1. **ApiClient**: Client Axios de base avec intercepteurs pour la gestion des tokens et des erreurs
2. **AuthService**: Services liés à l'authentification et la gestion des utilisateurs
3. **PixelBoardService**: Services liés aux opérations sur les PixelBoards
4. **WebSocketService**: Gestion des connexions WebSocket et abonnements

```typescript
// Exemple d'utilisation des services
import ApiService from '@/services/api.service';
// ou
import { AuthService, PixelBoardService } from '@/services/api.service';

// Utilisation
const response = await ApiService.getPixelBoardById(id);
```

## Composants Réutilisables

### Composants communs

- **LoadingSpinner**: Indicateur de chargement avec message personnalisable
- **ErrorMessage**: Affichage d'erreur avec option de réessai
- **ThemeToggle**: Bouton de basculement du thème
- **BoardConnectionCounter**: Compteur d'utilisateurs connectés

### Composants PixelBoard

- **PixelBoardDisplay**: Conteneur principal pour l'affichage et l'interaction
- **PixelBoardCanvas**: Canvas interactif pour le dessin des pixels
- **PixelBoardInfo**: Affichage des informations et métadonnées
- **ColorPicker**: Sélecteur de couleurs pour le placement de pixels
- **CooldownIndicator**: Indicateur de temps d'attente entre les placements

## Optimisation des Performances

### Stratégies d'optimisation

1. **Virtualisation du rendu**: Pour les listes et grilles de grande taille
2. **Chargement paresseux des routes**: Via `React.lazy` et `Suspense`
3. **Mémoïsation des composants**: Via `React.memo`, `useMemo` et `useCallback`
4. **Debouncing et throttling**: Pour les événements fréquents comme le redimensionnement

### Exemple de mémoïsation

```typescript
// Mémoïsation d'une fonction de calcul coûteuse
const calculatePixelSize = useCallback(() => {
  // Logique de calcul
}, [dependencies]);
```

## Guide de Style et Conventions

### Standards de code

- Utilisation de TypeScript pour le typage statique
- Formatage automatique avec Prettier
- Linting avec ESLint
- Utilisation de hooks React pour la logique d'état
- Composants fonctionnels avec hooks

### Conventions de nommage

- Components: PascalCase (ex: `PixelBoardDisplay.tsx`)
- Hooks: camelCase avec préfixe "use" (ex: `useCooldown.ts`)
- Contexts: PascalCase avec suffixe "Context" (ex: `AuthContext.tsx`)
- Services: camelCase (ex: `api.service.ts`)
- Styles: kebab-case (ex: `pixel-board.css`)

## Tests

### Exécution des tests

```bash
npm run test
# ou
yarn test
```

### Types de tests

- Tests unitaires pour les fonctions utilitaires
- Tests de composants pour les composants isolés
- Tests d'intégration pour les workflows complets
- Tests end-to-end pour les fonctionnalités critiques

## Déploiement

### Construction pour la production

```bash
npm run build
# ou
yarn build
```

### Variables d'environnement de production

Créez un fichier `.env.production` pour les variables d'environnement de production:

```
VITE_API_URL=https://api.pixelboard-app.com/api
VITE_WS_URL=wss://ws.pixelboard-app.com
```

## Résolution des Problèmes

### Problèmes courants

1. **Erreurs de connexion API**
   - Vérifier que le serveur backend est en cours d'exécution
   - Vérifier les variables d'environnement dans `.env.local`
   - Vérifier la configuration du proxy dans `vite.config.ts`

2. **Problèmes de WebSocket**
   - Vérifier que le service WebSocket est en cours d'exécution
   - Vérifier les logs de console pour les erreurs de connexion
   - Tester la connectivité au port WebSocket

3. **Problèmes de rendu**
   - Vider le cache du navigateur
   - Vérifier les erreurs de console
   - Essayer en mode navigation privée

### Outils de débogage

- Console du navigateur pour les erreurs JavaScript
- Onglet Network pour les requêtes API
- Onglet Application pour vérifier le localStorage
- React DevTools pour inspecter les composants et l'état

## Collaborateurs

- [ROCAMORA Enzo - uncyzer](https://github.com/uncyzer)
- [LAFAIRE Dylan - dragun06](https://github.com/dragun06)
- [BARRALI Florian - florianbrrl](https://github.com/florianbrrl)

---

## Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus d'informations.
