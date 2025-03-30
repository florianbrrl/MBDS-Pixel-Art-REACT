# Rapport Technique du Projet PixelBoard

## 1. Présentation

Le projet PixelBoard est une plateforme collaborative d'art pixelisé permettant aux utilisateurs de créer et de modifier des tableaux d'art en temps réel. L'application suit une architecture client-serveur avec un frontend React et un backend Node.js/Express, connecté à une base de données PostgreSQL.

## 1.1 Exécution du Projet

### Prérequis

- Node.js (v18 ou supérieur recommandé)
- npm (v6 ou supérieur)
- Docker et Docker Compose
- Git

### Configuration et Lancement du Backend

1. **Clonage du dépôt** :
   ```bash
   git clone https://github.com/florianbrrl/MBDS-Pixel-Art-REACT.git
   cd MBDS-Pixel-Art-REACT/backend
   ```

2. **Installation des dépendances** :
   ```bash
   npm install
   ```

3. **Configuration des variables d'environnement** :
   ```bash
   # Créer un fichier .env à la racine du dossier backend avec les variables suivantes
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pixelboard?schema=public"
   JWT_SECRET="votre_secret_jwt_complexe"
   JWT_EXPIRES_IN="90d"
   PORT=3000
   NODE_ENV=development
   ```

4. **Lancement de la base de données** :
   ```bash
   # Démarrer PostgreSQL via Docker
   docker-compose up -d
   ```

5. **Configuration de la base de données** :
   ```bash
   # Exécuter les migrations Prisma
   npm run prisma:migrate

   # Générer le client Prisma
   npm run prisma:generate

   # Initialiser des données de test (optionnel)
   npx ts-node src/scripts/seed.ts
   ```

6. **Lancement du serveur backend** :
   ```bash
   npm run dev
   ```
   Le serveur sera accessible à l'adresse http://localhost:3000/api avec rechargement à chaud. La documentation Swagger est disponible à http://localhost:3000/api-docs.

### Configuration et Lancement du Frontend

1. **Navigation vers le dossier frontend** :
   ```bash
   cd ../frontend
   ```

2. **Installation des dépendances** :
   ```bash
   npm install
   ```

3. **Lancement du serveur de développement** :
   ```bash
   npm run dev
   ```
   L'application frontend sera accessible à l'adresse affichée dans le terminal (généralement http://localhost:5173).

### Utilisateurs de Test

Le script de démarrage crée les utilisateurs suivants (tous avec le mot de passe `password123`) :
- guest@example.com (rôle: guest)
- user@example.com (rôle: user)
- premium@example.com (rôle: premium)
- admin@example.com (rôle: admin)

## 1.2 Réponse aux Attendus

### Structure Monorepo et Organisation du Code

L'architecture backend présente une structure rigoureusement organisée, conformément aux exigences. Le code est méticuleusement réparti en dossiers distincts comprenant :
- **Contrôleurs** : Gérant les requêtes HTTP avec rigueur
- **Services** : Encapsulant la logique métier avec élégance
- **Modèles** : Orchestrant l'accès aux données via Prisma
- **Routes** : Définissant les points d'entrée API avec précision

Cette séparation des préoccupations démontre un souci d'excellence dans l'organisation du code, facilitant ainsi sa maintenance future.

### Technologie Serveur Node.js

Le backend est implémenté avec Node.js et Express.js, enrichi par TypeScript, offrant ainsi une robustesse et une sécurité type accrues. Cette architecture moderne permet une gestion efficace des requêtes asynchrones, particulièrement adaptée aux applications temps réel.

### Conteneurisation Docker

L'utilisation de Docker est manifeste, notamment pour la base de données PostgreSQL, comme l'indique le fichier docker-compose.yml présent dans le dossier backend. Cette conteneurisation assure la portabilité et la reproductibilité de l'environnement, facilitant ainsi le déploiement.

### Gestion des Requêtes et Erreurs

Le middleware d'erreur (`errorHandler.middleware.ts`) témoigne d'une gestion élaborée des exceptions. Les contrôleurs implémentent une validation rigoureuse des entrées, garantissant une réponse appropriée aux requêtes malformées ou non autorisées.

### Validation des Données

La validation des données est effectuée à plusieurs niveaux :
- Validation des entrées au niveau des contrôleurs
- Contraintes d'intégrité au niveau de la base de données
- Schémas Prisma définissant strictement les structures de données

### TypeScript

L'utilisation de TypeScript confère au projet une robustesse accrue grâce au typage statique, permettant ainsi de prévenir de nombreuses erreurs à la compilation plutôt qu'à l'exécution.

### Fonctionnalités WebSockets

L'implémentation des WebSockets (`websocket.service.ts` et `websocket.controller.ts`) permet une communication bidirectionnelle en temps réel, offrant ainsi aux utilisateurs une expérience collaborative synchronisée lors de la modification des tableaux pixelisés.

### SuperPixelBoard

La fonctionnalité bonus du SuperPixelBoard est implémentée, permettant de visualiser l'ensemble des créations sur un tableau unifié, comme en témoignent les routes et contrôleurs dédiés.

### Heatmap

La visualisation des zones les plus utilisées via une heatmap est également implémentée, comme le montre l'existence d'endpoints dédiés (`/pixelboards/:id/heatmap`), offrant ainsi une analyse visuelle des interactions utilisateurs.

### Authentification et Autorisation

Le système d'authentification JWT est minutieusement implémenté (`auth.middleware.ts`, `auth.service.ts`), permettant une gestion fine des rôles utilisateurs (invité, utilisateur standard, premium, administrateur) et un contrôle d'accès précis aux fonctionnalités.

### Linting

L'utilisation d'outils de linting est confirmée par les commandes disponibles (`npm run lint`, `npm run lint:fix`), assurant ainsi une cohérence stylistique et une qualité de code homogène.

Cette architecture backend témoigne d'une conception soignée, alliant rigueur technique et élégance structurelle, répondant ainsi pleinement aux exigences du projet tout en intégrant les fonctionnalités bonus avec brio.

### Pages de Connexion et d'Inscription

Le système d'authentification frontend propose des interfaces utilisateur intuitives et élégantes pour la connexion et l'inscription. Les formulaires incluent une validation robuste des entrées qui guide l'utilisateur en temps réel, renforçant ainsi la sécurité et améliorant l'expérience utilisateur.

### Gestion du Profil Utilisateur

Les utilisateurs authentifiés bénéficient d'une interface de gestion de profil complète, leur permettant de modifier leurs informations personnelles, changer leur mot de passe et consulter leurs statistiques de contribution. Cette centralisation des paramètres utilisateur facilite la personnalisation de l'expérience.

### Système de Thème (Light/Dark)

Le projet implémente un système de thème flexible offrant aux utilisateurs le choix entre un affichage clair, sombre ou automatique suivant les préférences système. Cette personnalisation visuelle améliore le confort d'utilisation et l'accessibilité dans différentes conditions d'éclairage.

### Composant de Canevas PixelBoard Interactif

L'interface de dessin constitue le cœur de l'application avec un canevas interactif permettant la manipulation pixel par pixel. Les fonctionnalités avancées incluent le zoom, la navigation fluide et la prévisualisation des modifications, offrant ainsi une expérience créative optimale.

### Système de Cooldown et Indicateurs

Un mécanisme sophistiqué de cooldown est implémenté, affichant un minuteur visuel indiquant le temps d'attente entre chaque placement de pixel. Les utilisateurs premium bénéficient d'un statut privilégié clairement signalé, renforçant ainsi l'aspect stratégique de la contribution.

### Historique et Statistiques des Contributions

L'application offre une visualisation détaillée de l'historique des contributions par utilisateur et par tableau, avec des graphiques temporels et des indicateurs de performance. Ces données permettent aux utilisateurs de suivre leur impact sur l'œuvre collective.

### Export de PixelBoard en Image

Une fonctionnalité d'exportation permet aux utilisateurs de télécharger les tableaux aux formats SVG (vectoriel) ou PNG (raster), facilitant ainsi le partage et l'utilisation externe des créations collaboratives.

### Notifications en Temps Réel

Un système d'alertes contextuel informe les utilisateurs des événements importants, du résultat de leurs actions et des interactions d'autres utilisateurs, créant ainsi une expérience interactive et réactive.

### Optimisation des Performances

Des techniques avancées d'optimisation ont été mises en œuvre pour garantir une expérience fluide même avec de nombreux utilisateurs simultanés. Le rendu conditionnel, la mise en cache et le chargement différé contribuent à maintenir des performances élevées.

### Replay/Timelapse des PixelBoard

La fonctionnalité de timelapse offre une dimension temporelle fascinante au projet, permettant de visualiser l'évolution chronologique complète d'un PixelBoard depuis sa création. Les utilisateurs peuvent naviguer dans l'historique des modifications, régler la vitesse de lecture et observer la construction collaborative des œuvres pixel par pixel, transformant ainsi l'art statique en une narration visuelle dynamique.

### Responsive Design

L'interface adaptative assure une expérience utilisateur optimale sur tous types d'appareils, des grands écrans de bureau aux smartphones. Les composants se réorganisent intelligemment selon l'espace disponible, préservant ainsi l'accès à toutes les fonctionnalités.
