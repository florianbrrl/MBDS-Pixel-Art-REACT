# Module de Configuration

Ce module gère la configuration de l'application en utilisant des variables d'environnement typées et validées.

## Utilisation

```typescript
import config from './config';

// Utilisation des paramètres de configuration
console.log(`Le serveur fonctionne en environnement ${config.server.env}`);
console.log(`Application disponible sur le port ${config.server.port}`);
```

## Structure de Configuration

Le module exporte un objet de configuration avec les sections suivantes:

- `server`: Configuration du serveur (environnement, port, préfixe API)
- `logging`: Configuration de la journalisation (niveau, format)
- `cors`: Configuration CORS (origine)
- `db`: Configuration de la base de données (hôte, port, nom, utilisateur, mot de passe)
- `jwt`: Configuration JWT (secret, durée de validité)

## Variables d'Environnement

Les variables d'environnement sont chargées à partir d'un fichier `.env` et validées avec `envalid`.

### Création d'un fichier .env

Copiez le fichier `.env.example` en `.env` et personnalisez les valeurs:

```bash
cp .env.example .env
```

### Variables Requises

- `NODE_ENV`: Environnement d'exécution ('development', 'test', 'production')
- `PORT`: Port du serveur

### Variables Optionnelles

Toutes les autres variables ont des valeurs par défaut (voir `.env.example`).

## Validation

Les variables d'environnement sont validées au démarrage de l'application. Si des variables requises sont manquantes ou invalides, l'application s'arrêtera avec une erreur explicite.