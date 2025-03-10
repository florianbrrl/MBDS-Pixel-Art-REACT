# PixelBoard Backend - Developer Guide

Ce document contient toutes les instructions nécessaires pour configurer, exécuter et maintenir l'application backend du projet PixelBoard.

## Prérequis

- Node.js (v18 ou supérieur)
- PostgreSQL (v14 ou supérieur)
- npm ou yarn

## Installation

1. Cloner le dépôt et naviguer vers le dossier backend :
   ```bash
   git clone https://github.com/florianbrrl/MBDS-Pixel-Art-REACT.git
   cd MBDS-Pixel-Art-REACT/backend
   ```

2. Installer les dépendances :
   ```bash
   npm install
   ```

3. Créer un fichier `.env` à la racine du dossier backend avec les variables suivantes :
   ```
   # Base de données
   DATABASE_URL="postgresql://username:password@localhost:5432/pixelboard?schema=public"
   
   # JWT
   JWT_SECRET="votre_secret_jwt_complexe"
   JWT_EXPIRES_IN="90d"
   
   # Server
   PORT=3000
   NODE_ENV=development
   ```

## Configuration de la base de données

1. Créer une base de données PostgreSQL nommée "pixelboard" :
   ```bash
   psql -U postgres -c "CREATE DATABASE pixelboard;"
   ```

2. Exécuter les migrations Prisma pour créer les tables :
   ```bash
   npm run prisma:migrate
   ```

3. Générer le client Prisma :
   ```bash
   npm run prisma:generate
   ```

4. (Optionnel) Pour visualiser et manipuler les données :
   ```bash
   npm run prisma:studio
   ```

## Lancement de l'application

### En mode développement
```bash
npm run dev
```
Le serveur sera accessible à l'adresse http://localhost:3000/api avec rechargement à chaud.

### En mode production
```bash
npm run build
npm run start
```

## Commandes utiles

- **Build** : `npm run build` - Compile le code TypeScript
- **Dev** : `npm run dev` - Lance en mode développement avec ts-node-dev
- **Format** : `npm run format` - Formate le code avec Prettier
- **Lint** : `npm run lint` - Vérifie le code avec ESLint
- **Lint & Fix** : `npm run lint:fix` - Corrige automatiquement les problèmes de lint
- **Test** : `npm run test` - Exécute les tests Jest
- **DB** :
  - `npm run prisma:migrate` - Exécute les migrations en dev
  - `npm run prisma:deploy` - Déploie les migrations en production
  - `npm run prisma:generate` - Génère le client Prisma
  - `npm run prisma:studio` - Ouvre l'interface Prisma Studio

## Résolution des problèmes courants

### Erreur "Connection refused" avec PostgreSQL
- Vérifiez que PostgreSQL est bien en cours d'exécution
- Vérifiez les informations de connexion dans votre fichier `.env`
- Vérifiez les droits d'accès de l'utilisateur PostgreSQL

### Erreur Prisma Client non généré
```
Error: Cannot find module '.prisma/client/index'
```
Solution : Exécutez `npm run prisma:generate`

### Erreur de longueur pour theme_preference
Si vous rencontrez une erreur concernant la longueur de la colonne `theme_preference` :
- Vérifiez que les migrations ont bien été appliquées  
- Utilisez uniquement des valeurs de 5 caractères maximum (ex: "sys", "dark", "light")

### Port déjà utilisé (EADDRINUSE)
```
Error: listen EADDRINUSE: address already in use :::3000
```
Solutions :
- Arrêtez l'autre processus qui utilise le port 3000
- Modifiez le port dans le fichier `.env` (ex: PORT=3001)
- Utilisez `pkill -f "ts-node-dev"` pour tuer tous les processus en cours

### Les modifications du fichier .env ne sont pas prises en compte
- Redémarrez complètement le serveur (arrêt + relance)
- Vérifiez que les variables d'environnement sont bien chargées dans `config/index.ts`

## Architecture du projet

```
backend/
├── prisma/                  # Schéma et migrations Prisma
├── src/
│   ├── config/              # Configuration de l'application
│   ├── controllers/         # Contrôleurs Express
│   ├── db/                  # Clients et utilitaires de base de données
│   ├── middleware/          # Middleware Express
│   ├── models/              # Modèles de données
│   ├── routes/              # Définitions des routes API
│   ├── services/            # Logique métier
│   ├── utils/               # Utilitaires (sécurité, formatage, etc.)
│   ├── app.ts               # Configuration Express
│   └── server.ts            # Point d'entrée du serveur
├── .env                     # Variables d'environnement (non versionné)
├── package.json             # Dépendances et scripts npm
└── tsconfig.json            # Configuration TypeScript
```

## Conseils de développement

1. **Patterns de commit** : Suivez la convention de nommage des commits selon le fichier `/commit_convention.md`.

2. **Tests** : Écrivez des tests pour toutes les nouvelles fonctionnalités et corrections de bugs.

3. **Sécurité** : Ne stockez jamais de secrets dans le code. Utilisez les variables d'environnement.

4. **API** : Respectez la structure de réponse API cohérente (status, data, message).