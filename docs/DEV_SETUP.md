# Configuration de l'Environnement de Développement

Ce guide explique comment configurer votre environnement de développement pour contribuer au projet PixelBoard API.

## Prérequis

- Node.js (v14 ou supérieur)
- npm (v6 ou supérieur)
- VS Code (recommandé)

## Installation

1. Clonez le dépôt:

   ```bash
   git clone <url>
   cd <repo>
   ```

2. Installez les dépendances:

   ```bash
   npm install # dans front & dans back
   ```

3. Configurez les variables d'environnement: pour front & back
   ```bash
   cp .env.example .env
   # Modifiez .env selon vos besoins
   ```

## Configuration de l'Éditeur

### VS Code

Nous recommandons d'utiliser VS Code avec les extensions suivantes (elles seront suggérées automatiquement):

- ESLint
- Prettier
- EditorConfig
- TypeScript Next
- DotENV

Les paramètres recommandés sont déjà configurés dans `.vscode/settings.json`.

### Autres Éditeurs

Si vous utilisez un autre éditeur, assurez-vous de:

1. Configurer l'intégration avec ESLint
2. Configurer l'intégration avec Prettier
3. Configurer le support pour EditorConfig
4. Activer le formatage automatique à la sauvegarde

## Commandes Disponibles pour le back !

- `npm run dev`: Lance le serveur de développement avec rechargement à chaud
- `npm run lint`: Vérifie le code avec ESLint
- `npm run lint:fix`: Corrige automatiquement les problèmes détectés par ESLint
- `npm run format`: Formate le code avec Prettier
- `npm run format:check`: Vérifie si le code est correctement formaté
- `npm run check`: Vérifie à la fois le linting et le formatage
- `npm run fix`: Corrige à la fois les problèmes de linting et de formatage

## Workflow de Développement

1. Créez une branche pour votre fonctionnalité ou correction:

   ```bash
   git checkout -b feature/nom-de-la-fonctionnalite
   ```

2. Développez votre fonctionnalité en suivant les conventions de code.

3. Vérifiez votre code avant de commiter:

   ```bash
   npm run check
   ```

4. Corrigez les problèmes si nécessaire:

   ```bash
   npm run fix
   ```

5. Commitez vos changements en suivant les conventions de commit:

   ```bash
   git commit -m "feat(scope): description"
   ```

6. Poussez votre branche et créez une Pull Request.
