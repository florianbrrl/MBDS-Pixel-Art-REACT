#!/bin/bash

# Script de test complet pour toutes les routes de l'API PixelBoard
# Ce script teste chaque endpoint API avec différents niveaux d'utilisateurs
# et vérifie les codes de réponse attendus.

# Configuration
API_URL="http://localhost:3000/api"
OUTPUT_DIR="./test_results"
GUEST_EMAIL="guest@example.com"
USER_EMAIL="user@example.com"
PREMIUM_EMAIL="premium@example.com"
ADMIN_EMAIL="admin@example.com"
PASSWORD="password123"

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Créer le répertoire de sortie s'il n'existe pas
mkdir -p $OUTPUT_DIR

# Fonction pour afficher un test réussi
success() {
  echo -e "${GREEN}✓ SUCCÈS${NC}: $1"
}

# Fonction pour afficher un test échoué
failure() {
  echo -e "${RED}✗ ÉCHEC${NC}: $1"
}

# Fonction pour afficher un titre de section
section() {
  echo -e "\n${BLUE}==== $1 ====${NC}"
}

# Fonction pour afficher un avertissement
warning() {
  echo -e "${YELLOW}⚠ ATTENTION${NC}: $1"
}

# Fonction pour effectuer une requête et vérifier le code de retour
# Usage: test_endpoint "description" "méthode" "endpoint" "code_attendu" [data] [token]
test_endpoint() {
  local description=$1
  local method=$2
  local endpoint=$3
  local expected_code=$4
  local data=$5
  local token=$6
  local output_file="${OUTPUT_DIR}/$(echo $endpoint | tr '/' '_')_${method}.json"
  
  echo -n "Test: $description... "
  
  # Construction de la commande curl
  cmd="curl -s -X $method \"${API_URL}${endpoint}\" -w \"%{http_code}\" -o \"$output_file\""
  
  # Ajout des headers
  cmd="$cmd -H \"Content-Type: application/json\""
  if [ ! -z "$token" ]; then
    cmd="$cmd -H \"Authorization: Bearer $token\""
  fi
  
  # Ajout du body si nécessaire
  if [ ! -z "$data" ]; then
    cmd="$cmd -d '$data'"
  fi
  
  # Exécution de la commande
  http_code=$(eval $cmd)
  
  # Vérification du code de retour
  if [ "$http_code" -eq "$expected_code" ]; then
    success "Code retour $http_code correspond au code attendu $expected_code"
    return 0
  else
    failure "Code retour $http_code ne correspond pas au code attendu $expected_code"
    echo "Commande: $cmd"
    echo "Réponse:"
    cat "$output_file"
    return 1
  fi
}

# Fonction pour récupérer un token JWT à partir des identifiants
get_token() {
  local email=$1
  local password=$2
  local token_file="${OUTPUT_DIR}/token_${email}.txt"
  
  echo -n "Récupération du token pour $email... "
  
  response=$(curl -s -X POST "${API_URL}/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$password\"}" \
    -o "$token_file")
  
  # Extraire le token de la réponse JSON
  token=$(cat "$token_file" | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
  
  if [ -z "$token" ]; then
    failure "Impossible de récupérer le token"
    echo "Réponse:"
    cat "$token_file"
    return 1
  else
    success "Token récupéré"
    echo $token > "$token_file"
    echo $token
    return 0
  fi
}

# Fonction pour récupérer un ID de PixelBoard
get_pixelboard_id() {
  local token=$1
  local status=$2  # "active" ou "completed" ou "all"
  local pb_file="${OUTPUT_DIR}/pixelboard_${status}.json"
  
  echo -n "Récupération d'un ID de PixelBoard $status... "
  
  if [ "$status" == "active" ]; then
    curl -s "${API_URL}/pixelboards/active" -H "Authorization: Bearer $token" -o "$pb_file"
  elif [ "$status" == "completed" ]; then
    curl -s "${API_URL}/pixelboards/completed" -H "Authorization: Bearer $token" -o "$pb_file"
  else
    curl -s "${API_URL}/pixelboards" -H "Authorization: Bearer $token" -o "$pb_file"
  fi
  
  # Extraire le premier ID de PixelBoard
  id=$(cat "$pb_file" | grep -o '"id":"[^"]*' | head -1 | grep -o '[^"]*$')
  
  if [ -z "$id" ]; then
    failure "Impossible de récupérer un ID de PixelBoard"
    echo "Réponse:"
    cat "$pb_file"
    return 1
  else
    success "ID récupéré: $id"
    echo $id
    return 0
  fi
}

# Fonction pour attendre que le serveur soit prêt
wait_for_server() {
  echo "Attente du démarrage du serveur..."
  local max_attempts=30
  local attempt=1
  
  while [ $attempt -le $max_attempts ]; do
    if curl -s "${API_URL}" > /dev/null; then
      echo "Serveur prêt!"
      return 0
    fi
    
    echo "Tentative $attempt/$max_attempts - Le serveur n'est pas encore prêt."
    sleep 2
    attempt=$((attempt + 1))
  done
  
  echo "Échec: Le serveur n'est pas devenu disponible après $max_attempts tentatives."
  return 1
}

# Début des tests
echo "==================================================================="
echo "         TESTS AUTOMATISÉS DE L'API PIXELBOARD"
echo "==================================================================="
date
echo ""

# S'assurer que le serveur est prêt
wait_for_server

# Récupérer les tokens pour chaque type d'utilisateur
section "Authentification"
GUEST_TOKEN=$(get_token "$GUEST_EMAIL" "$PASSWORD")
USER_TOKEN=$(get_token "$USER_EMAIL" "$PASSWORD")
PREMIUM_TOKEN=$(get_token "$PREMIUM_EMAIL" "$PASSWORD")
ADMIN_TOKEN=$(get_token "$ADMIN_EMAIL" "$PASSWORD")

# Tests des endpoints d'information
section "Informations API"
test_endpoint "GET / - Info API" "GET" "" 200

# Tests des endpoints d'authentification
section "Routes d'authentification"
test_endpoint "POST /auth/login - Valid" "POST" "/auth/login" 200 "{\"email\":\"$USER_EMAIL\",\"password\":\"$PASSWORD\"}"
test_endpoint "POST /auth/login - Invalid" "POST" "/auth/login" 401 "{\"email\":\"invalid@example.com\",\"password\":\"wrongpass\"}"
test_endpoint "POST /auth/register - New User" "POST" "/auth/register" 201 "{\"email\":\"newuser_$(date +%s)@example.com\",\"password\":\"password123\"}"
test_endpoint "POST /auth/register - Existing Email" "POST" "/auth/register" 400 "{\"email\":\"$USER_EMAIL\",\"password\":\"password123\"}"

# Tests des endpoints utilisateur
section "Routes utilisateur"
test_endpoint "GET /users/me - Guest" "GET" "/users/me" 200 "" "$GUEST_TOKEN"
test_endpoint "GET /users/me - User" "GET" "/users/me" 200 "" "$USER_TOKEN"
test_endpoint "GET /users/me - No Token" "GET" "/users/me" 401
test_endpoint "PATCH /users/me - Update Theme" "PATCH" "/users/me" 200 "{\"theme_preference\":\"dark\"}" "$USER_TOKEN"
test_endpoint "PATCH /users/me - Invalid Theme" "PATCH" "/users/me" 400 "{\"theme_preference\":\"invalid\"}" "$USER_TOKEN"

# Tests des endpoints d'administration
section "Routes d'administration"
test_endpoint "GET /admin - Admin Access" "GET" "/admin" 200 "" "$ADMIN_TOKEN"
test_endpoint "GET /admin - Non-Admin Access" "GET" "/admin" 403 "" "$USER_TOKEN"
test_endpoint "GET /admin - No Token" "GET" "/admin" 401

# Récupérer des IDs de tableaux de différents types
ACTIVE_BOARD_ID=$(get_pixelboard_id "$USER_TOKEN" "active")
COMPLETED_BOARD_ID=$(get_pixelboard_id "$USER_TOKEN" "completed")
ALLOW_OVERWRITE_BOARD_ID=$(get_pixelboard_id "$USER_TOKEN" "all")

# Tests des endpoints PixelBoard
section "Routes PixelBoard"

# GET endpoints
test_endpoint "GET /pixelboards - All Boards" "GET" "/pixelboards" 200
test_endpoint "GET /pixelboards/active - Active Boards" "GET" "/pixelboards/active" 200
test_endpoint "GET /pixelboards/completed - Completed Boards" "GET" "/pixelboards/completed" 200
test_endpoint "GET /pixelboards/:id - Valid ID" "GET" "/pixelboards/$ACTIVE_BOARD_ID" 200
test_endpoint "GET /pixelboards/:id - Invalid ID" "GET" "/pixelboards/invalid-id" 404

# Filtrage et pagination
test_endpoint "GET /pixelboards with filtering" "GET" "/pixelboards?minWidth=20&maxWidth=100&allowOverwrite=true" 200
test_endpoint "GET /pixelboards with sorting" "GET" "/pixelboards?sortBy=title&sortDirection=asc" 200
test_endpoint "GET /pixelboards with pagination" "GET" "/pixelboards?page=1&limit=3" 200

# POST, PUT, DELETE endpoints (admin only)
NEW_BOARD_TITLE="Test Board $(date +%s)"
test_endpoint "POST /pixelboards - Create Board (Admin)" "POST" "/pixelboards" 201 "{\"title\":\"$NEW_BOARD_TITLE\",\"width\":20,\"height\":20,\"start_time\":\"$(date -d '+1 day' -Iseconds)\",\"end_time\":\"$(date -d '+10 days' -Iseconds)\"}" "$ADMIN_TOKEN"
test_endpoint "POST /pixelboards - Create Board (Non-Admin)" "POST" "/pixelboards" 403 "{\"title\":\"$NEW_BOARD_TITLE\",\"width\":20,\"height\":20,\"start_time\":\"$(date -d '+1 day' -Iseconds)\",\"end_time\":\"$(date -d '+10 days' -Iseconds)\"}" "$USER_TOKEN"

# Obtenir l'ID du nouveau tableau créé
NEW_BOARD_ID=$(curl -s "${API_URL}/pixelboards" -H "Authorization: Bearer $ADMIN_TOKEN" | grep -o "\"id\":\"[^\"]*\"" | grep -o "[^\"]*$" | head -1)
if [ ! -z "$NEW_BOARD_ID" ]; then
  test_endpoint "PUT /pixelboards/:id - Update Board (Admin)" "PUT" "/pixelboards/$NEW_BOARD_ID" 200 "{\"title\":\"$NEW_BOARD_TITLE Updated\",\"cooldown\":45}" "$ADMIN_TOKEN"
  test_endpoint "PUT /pixelboards/:id - Update Board (Non-Admin)" "PUT" "/pixelboards/$NEW_BOARD_ID" 403 "{\"title\":\"$NEW_BOARD_TITLE Updated Again\"}" "$USER_TOKEN"
  test_endpoint "DELETE /pixelboards/:id - Delete Board (Admin)" "DELETE" "/pixelboards/$NEW_BOARD_ID" 204 "" "$ADMIN_TOKEN"
else
  warning "Impossible de récupérer l'ID du nouveau tableau, skip des tests d'update/delete"
fi

# Tests des endpoints Pixel (nouveaux)
section "Routes Pixel (nouvelles routes)"

# POST endpoint - Place pixel
test_endpoint "POST /pixels/:boardId - Place Pixel (Valid)" "POST" "/pixels/$ACTIVE_BOARD_ID" 201 "{\"x\":5,\"y\":5,\"color\":\"#FF5733\"}" "$USER_TOKEN"
test_endpoint "POST /pixels/:boardId - Place Pixel (No Token)" "POST" "/pixels/$ACTIVE_BOARD_ID" 401 "{\"x\":6,\"y\":6,\"color\":\"#3366FF\"}"
test_endpoint "POST /pixels/:boardId - Invalid Color" "POST" "/pixels/$ACTIVE_BOARD_ID" 400 "{\"x\":7,\"y\":7,\"color\":\"invalid-color\"}" "$USER_TOKEN"
test_endpoint "POST /pixels/:boardId - Out of Bounds" "POST" "/pixels/$ACTIVE_BOARD_ID" 400 "{\"x\":-1,\"y\":5,\"color\":\"#FF5733\"}" "$USER_TOKEN"
test_endpoint "POST /pixels/:boardId - Completed Board" "POST" "/pixels/$COMPLETED_BOARD_ID" 403 "{\"x\":5,\"y\":5,\"color\":\"#FF5733\"}" "$USER_TOKEN"

# Test cooldown (devrait échouer si placé trop rapidement)
echo "Test du cooldown (devrait échouer)..."
test_endpoint "POST /pixels/:boardId - Cooldown Test" "POST" "/pixels/$ACTIVE_BOARD_ID" 429 "{\"x\":8,\"y\":8,\"color\":\"#33FF57\"}" "$USER_TOKEN"

# GET endpoints - Pixel state and history
test_endpoint "GET /pixels/:boardId/:x/:y - Get Pixel State" "GET" "/pixels/$ACTIVE_BOARD_ID/5/5" 200
test_endpoint "GET /pixels/:boardId/:x/:y/history - Get Pixel History" "GET" "/pixels/$ACTIVE_BOARD_ID/5/5/history" 200

# Tester l'écrasement de pixels (succès sur tableau allow_overwrite=true)
test_endpoint "POST /pixels/:boardId - Place Pixel (Allow Overwrite Board)" "POST" "/pixels/$ALLOW_OVERWRITE_BOARD_ID" 201 "{\"x\":10,\"y\":10,\"color\":\"#FF5733\"}" "$USER_TOKEN"
sleep 10  # Attendre que le cooldown soit passé
test_endpoint "POST /pixels/:boardId - Overwrite Pixel (Allow Overwrite Board)" "POST" "/pixels/$ALLOW_OVERWRITE_BOARD_ID" 201 "{\"x\":10,\"y\":10,\"color\":\"#3366FF\"}" "$USER_TOKEN"

# Récapitulatif des tests
section "Récapitulatif"
echo "Tests terminés à $(date)"
echo "Résultats détaillés disponibles dans $OUTPUT_DIR/"

# Nettoyer les fichiers temporaires (optionnel)
# rm -rf $OUTPUT_DIR

exit 0