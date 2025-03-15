# Commandes CURL pour tester le système de placement de pixels

## Authentification (requis pour placer des pixels)

Obtenir un token JWT (à utiliser dans les autres commandes):

```bash
curl -X POST \
  http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "user@example.com",
    "password": "password123"
}'
```

Copier le token JWT depuis la réponse et remplacer `<JWT_TOKEN>` dans les commandes suivantes.

## Opérations sur les pixels

### Placer un pixel

```bash
curl -X POST \
  http://localhost:3000/api/pixels/<BOARD_ID> \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <JWT_TOKEN>' \
  -d '{
    "x": 5,
    "y": 10,
    "color": "#FF5733"
}'
```

Remplacer `<BOARD_ID>` par l'ID d'un tableau de pixels existant.

### Obtenir l'état actuel d'un pixel

```bash
curl -X GET \
  http://localhost:3000/api/pixels/<BOARD_ID>/<X>/<Y> \
  -H 'Content-Type: application/json'
```

Remplacer `<BOARD_ID>` par l'ID du tableau, et `<X>` et `<Y>` par les coordonnées du pixel.

### Obtenir l'historique d'un pixel

```bash
curl -X GET \
  http://localhost:3000/api/pixels/<BOARD_ID>/<X>/<Y>/history \
  -H 'Content-Type: application/json'
```

Remplacer `<BOARD_ID>` par l'ID du tableau, et `<X>` et `<Y>` par les coordonnées du pixel.

## Tests de cas limites

### Test de cooldown (devrait échouer si le cooldown n'est pas écoulé)

Exécuter deux fois de suite la commande de placement de pixel:

```bash
curl -X POST \
  http://localhost:3000/api/pixels/<BOARD_ID> \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <JWT_TOKEN>' \
  -d '{
    "x": 5,
    "y": 10,
    "color": "#FF5733"
}'
```

### Test de protection contre l'écrasement (pour les tableaux avec allow_overwrite=false)

```bash
# Premier placement
curl -X POST \
  http://localhost:3000/api/pixels/<BOARD_ID> \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <JWT_TOKEN>' \
  -d '{
    "x": 5,
    "y": 10,
    "color": "#FF5733"
}'

# Tentative d'écrasement (devrait échouer si allow_overwrite=false)
curl -X POST \
  http://localhost:3000/api/pixels/<BOARD_ID> \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <JWT_TOKEN>' \
  -d '{
    "x": 5,
    "y": 10,
    "color": "#00FF00"
}'
```

### Test de validation de coordonnées (hors limites)

```bash
# Coordonnées négatives
curl -X POST \
  http://localhost:3000/api/pixels/<BOARD_ID> \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <JWT_TOKEN>' \
  -d '{
    "x": -1,
    "y": 10,
    "color": "#FF5733"
}'

# Coordonnées hors de la grille (supérieures à width/height)
curl -X POST \
  http://localhost:3000/api/pixels/<BOARD_ID> \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <JWT_TOKEN>' \
  -d '{
    "x": 9999,
    "y": 10,
    "color": "#FF5733"
}'
```

### Test de validation de couleur (format invalide)

```bash
curl -X POST \
  http://localhost:3000/api/pixels/<BOARD_ID> \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <JWT_TOKEN>' \
  -d '{
    "x": 5,
    "y": 10,
    "color": "invalid-color"
}'
```