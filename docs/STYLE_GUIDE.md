# Guide de Style de Code

Ce document définit les conventions de codage à suivre pour le projet PixelBoard API.

## Principes Généraux

1. **Lisibilité** - Le code doit être facile à lire et à comprendre.
2. **Simplicité** - Préférez des solutions simples et directes.
3. **Cohérence** - Suivez les conventions établies dans tout le codebase.
4. **Documentation** - Documentez le code quand c'est nécessaire, en particulier les APIs.

## Conventions TypeScript

### Nommage

- Utilisez `camelCase` pour les variables, les fonctions et les méthodes.
- Utilisez `PascalCase` pour les classes, les interfaces, les types et les énumérations.
- Utilisez `UPPER_CASE` pour les constantes.
- Préfixez les interfaces avec `I` (ex: `IUser`).
- Préfixez les types avec `T` (ex: `TUserResponse`).
- Préfixez les énumérations avec `E` (ex: `EUserRole`).

### Formatage

- Utilisez 2 espaces pour l'indentation.
- Limitez les lignes à 100 caractères.
- Utilisez des points-virgules à la fin des instructions.
- Utilisez des guillemets simples pour les chaînes.
- Utilisez des virgules finales dans les objets et les tableaux multiligne.

### Types

- Évitez d'utiliser `any` autant que possible.
- Utilisez des types explicites plutôt que l'inférence quand c'est pertinent.
- Utilisez des interfaces pour les objets qui représentent des entités.
- Utilisez des types pour les unions, les intersections et les utilitaires.

## Structure des Fichiers

- Un fichier par classe, sauf pour les petits composants connexes.
- Un fichier d'index par dossier pour exporter les classes publiques.
- Les noms de fichiers doivent être en `kebab-case`.
- Utilisez des suffixes pour indiquer le type de contenu (ex: `.controller.ts`, `.service.ts`).

## Commentaires

- Utilisez JSDoc pour documenter les fonctions et les classes publiques.
- Commentez le code complexe ou contre-intuitif.
- Évitez les commentaires évidents qui répètent simplement le code.
- Préférez du code auto-explicatif aux commentaires quand c'est possible.

## Exemples

### Bonne Pratique

```typescript
/**
 * Représente un utilisateur du système.
 */
interface IUser {
  id: string;
  username: string;
  email: string;
  role: EUserRole;
  createdAt: Date;
}

/**
 * Énumération des rôles d'utilisateur possibles.
 */
enum EUserRole {
  USER = "USER",
  PREMIUM_USER = "PREMIUM_USER",
  ADMIN = "ADMIN",
}

/**
 * Récupère un utilisateur par son ID.
 * @param id - L'ID de l'utilisateur à récupérer
 * @returns L'utilisateur correspondant ou null si non trouvé
 */
async function getUserById(id: string): Promise<IUser | null> {
  // Implémentation...
}
```

### Mauvaise Pratique

```typescript
// Ne pas faire
async function getUser(id) {
  let userData = await db.query("SELECT * FROM users WHERE id = " + id);
  return userData;
}
```
