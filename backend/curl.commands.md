# Commandes curl pour tester l'API d'authentification avec rôles

## Mise en place des utilisateurs de test

Si vous rencontrez des problèmes avec le script TypeScript, vous pouvez utiliser directement SQL pour ajouter les utilisateurs de test:

```bash
# Se connecter à PostgreSQL
psql -U postgres -d pixelboard

# Exécuter le script SQL
\i /chemin/vers/backend/src/scripts/add_test_users.sql
```

Ou directement depuis le terminal:

```bash
psql -U postgres -d pixelboard -f /chemin/vers/backend/src/scripts/add_test_users.sql
```

## Enregistrer un nouvel utilisateur (rôle par défaut: 'user')
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "testuser@example.com", "password": "password123"}'
```

## Se connecter avec un utilisateur
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "testuser@example.com", "password": "password123"}'
```
La réponse contiendra un token JWT. Copiez ce token pour l'utiliser dans les requêtes suivantes.

## Accéder au profil (nécessite 'user', 'premium' ou 'admin')
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEzNTJkODY5LThiMjUtNDExZS04NmFmLWRiMTQ0YmFkMmE3ZiIsImlhdCI6MTc0MTY5NjM2MywiZXhwIjoxNzQ5NDcyMzYzfQ.plQwKByd00OMf_dzxOnMLl8Ptc2jrnByTLKJHjI4hrw"
```

## Accéder à la route admin (nécessite 'admin')
```bash
curl -X GET http://localhost:3000/api/admin \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

## Test avec les utilisateurs générés

Après avoir ajouté les utilisateurs de test (par SQL ou script), vous pouvez tester avec les utilisateurs suivants:

### Connexion avec utilisateur guest
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "guest@example.com", "password": "password123"}'
```

### Connexion avec utilisateur standard
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

### Connexion avec utilisateur premium
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "premium@example.com", "password": "password123"}'
```

### Connexion avec utilisateur admin
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password123"}'
```

## Résultats attendus

1. L'utilisateur `guest` ne devrait pas pouvoir accéder à `/api/auth/profile` ni à `/api/admin`
2. L'utilisateur `user` devrait pouvoir accéder à `/api/auth/profile` mais pas à `/api/admin`
3. L'utilisateur `premium` devrait pouvoir accéder à `/api/auth/profile` mais pas à `/api/admin`
4. L'utilisateur `admin` devrait pouvoir accéder à `/api/auth/profile` et à `/api/admin`
