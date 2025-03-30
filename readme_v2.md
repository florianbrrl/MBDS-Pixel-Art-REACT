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