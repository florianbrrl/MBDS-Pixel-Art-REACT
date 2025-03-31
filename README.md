# MBDS-Pixel-Art-REACT

## Pixel Art APP

## Authors
- [ROCAMORA Enzo - uncyzer](https://github.com/uncyzer)
- [LAFAIRE Dylan - dragun06](https://github.com/dragun06)
- [BARRALI Florian - florianbrrl](https://github.com/florianbrrl)

## Sommaire
1. [Sujet de projet](#sujet-de-projet)
   - [Fonctionnalités](#fonctionnalités)
   - [Contraintes](#contrantes)
   - [Bonus](#bonus)
2. [Rapport Technique](#rapport-technique-du-projet-pixelboard)
   - [Présentation](#1-présentation)
   - [Exécution du Projet](#11-exécution-du-projet)
   - [Réponse aux Attendus](#12-réponse-aux-attendus)
3. [Contributions individuelles](#contribution-de-dylan-lafaire-dragun06)
   - [Dylan Lafaire](#contribution-de-dylan-lafaire-dragun06)
   - [Florian Barrali](#contribution-de-florian-barrali-florianbrrl)
   - [Enzo Rocamora](#contribution-denzo-rocamora-uncyzer)

## Sujet de projet
### FONCTIONNALITÉS
### Homepage
Une page d'accueil publique, qui permet aux utilisateurs de se connecter ou de s'inscrire.
Sur cette page on retrouve :

- Le nombre d'utilisateur inscrits
- Le nombre de PixelBoard créés.
- La prévisualisation des dernières PixelBoard en cours de création
- La prévisualisation des dernières PixelBoard terminés

### Administrateurs
- Créer un PixelBoard en spécifiant les propriétés dans un formulaire
- Modifier, Supprimer un PixelBoard
- Afficher, trier, filtrer tous les PixelBoards

### PixelBoard
- Sur la page du PixelBoard les propriétés sont affichées
- Temps restant avant fermeture
- Titre, taille, délai entre deux participations
- Possibilité ou pas de dessiner par dessus un pixel déjà dessiné

## Visiteurs (utilisateurs non inscrits)
- S'inscrire
- Optionnel dessiner sur un PixelBoard
  (trouver une solution pour les restrictions)

### Utilisateurs
- Se connecter
- Authentification simple (Basic auth ou jwt) login / mot de passe pour accéder à l'application
  (ne pas perdre de temps sur cette partie)
- Voir leur profil et modifier leurs informations et le thème
- Voir leurs contributions
  - Les PixelBoard
  - Le nombre total de pixel ajoutés
- Thème : Possibilité pour l'utilisateur de changer le thème de l'application
  Deux thèmes possible (un light et un dark)
  Le choix sera sauvegardé dans le navigateur, si je recharge la page le thème est le même.
  Si le thème du système d'exploitation de l'utilisateur et que le navigateur supporte l'API (match-media prefers-color-scheme) est en mode dark, le site sera automatiquement proposé en mode dark

## CONTRANTES

- **MonoRepo**
  Vous pouvez (devez?) utiliser notre architecture :
  **https://github.com/53js/mbds-project-skeleton-2025**
  _dans le packages/api :_
  _pensez à bien structurer votre code_
  _dossier routes, services, models_
- **React client Side et node.js Server Side ;)**
- **Docker (compose) obligatoire pour la base de données**
- Responsive (l'affichage et les fonctionnalités s'adaptent au différentes tailles d'écran)
- Typescript si vous le souhaitez
- Gestion des requêtes (erreurs, loading: spinners)
- Une Single Page App avec un routeur pour la gestion des différentes pages
  (exemple react-router ou équivalent)
- Validation des champs des éventuels formulaires côté client
  par exemple sur le formulaire de contact si l'email est incorrect, le signaler et empêcher la soumission du formulaire.
- Utilisation d'un linter de code

## BONUS

- Utilisation des WebSockets pour visualiser en temps réel l'avancement du dessin
- SuperPixelBoard un PixelBoard qui affiche toutes les créations
- Export un PixelBoard en image (SVG si possible ou png)
- Heatmap montrant les zones (pixels) les plus utilisés
- Déployer le projet en ligne (AWS, Google Cloud, Azure propose des "free" tiers)


## Rapport Technique du Projet PixelBoard

### 1. Présentation

Le projet PixelBoard est une plateforme collaborative d'art pixelisé permettant aux utilisateurs de créer et de modifier des tableaux d'art en temps réel. L'application suit une architecture client-serveur avec un frontend React et un backend Node.js/Express, connecté à une base de données PostgreSQL.

### 1.1 Exécution du Projet

#### Prérequis

- Node.js (v18 ou supérieur recommandé)
- npm (v6 ou supérieur)
- Docker et Docker Compose
- Git

#### Configuration et Lancement du Backend

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
   ## Créer un fichier .env à la racine du dossier backend avec les variables suivantes
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pixelboard?schema=public"
   JWT_SECRET="votre_secret_jwt_complexe"
   JWT_EXPIRES_IN="90d"
   PORT=3000
   NODE_ENV=development
   ```

4. **Lancement de la base de données** :
   ```bash
   ## Démarrer PostgreSQL via Docker
   docker-compose up -d
   ```

5. **Configuration de la base de données** :
   ```bash
   ## Exécuter les migrations Prisma
   npm run prisma:migrate

   ## Générer le client Prisma
   npm run prisma:generate

   ## Initialiser des données de test (optionnel)
   npx ts-node src/scripts/seed.ts
   ```

6. **Lancement du serveur backend** :
   ```bash
   npm run dev
   ```
   Le serveur sera accessible à l'adresse http://localhost:3000/api avec rechargement à chaud. La documentation Swagger est disponible à http://localhost:3000/api-docs.

#### Configuration et Lancement du Frontend

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

   L'application est aussi disponible sur le site http://uncyzer.fr

#### Utilisateurs de Test

Le script de démarrage crée les utilisateurs suivants (tous avec le mot de passe `password123`) :
- guest@example.com (rôle: guest)
- user@example.com (rôle: user)
- premium@example.com (rôle: premium)
- admin@example.com (rôle: admin)

### 1.2 Réponse aux Attendus

#### Structure Monorepo et Organisation du Code

L'architecture backend présente une structure rigoureusement organisée, conformément aux exigences. Le code est méticuleusement réparti en dossiers distincts comprenant :
- **Contrôleurs** : Gérant les requêtes HTTP avec rigueur
- **Services** : Encapsulant la logique métier avec élégance
- **Modèles** : Orchestrant l'accès aux données via Prisma
- **Routes** : Définissant les points d'entrée API avec précision

Cette séparation des préoccupations démontre un souci d'excellence dans l'organisation du code, facilitant ainsi sa maintenance future.

#### Technologie Serveur Node.js

Le backend est implémenté avec Node.js et Express.js, enrichi par TypeScript, offrant ainsi une robustesse et une sécurité type accrues. Cette architecture moderne permet une gestion efficace des requêtes asynchrones, particulièrement adaptée aux applications temps réel.

#### Conteneurisation Docker

L'utilisation de Docker est manifeste, notamment pour la base de données PostgreSQL, comme l'indique le fichier docker-compose.yml présent dans le dossier backend. Cette conteneurisation assure la portabilité et la reproductibilité de l'environnement, facilitant ainsi le déploiement.

#### Gestion des Requêtes et Erreurs

Le middleware d'erreur (`errorHandler.middleware.ts`) témoigne d'une gestion élaborée des exceptions. Les contrôleurs implémentent une validation rigoureuse des entrées, garantissant une réponse appropriée aux requêtes malformées ou non autorisées.

#### Validation des Données

La validation des données est effectuée à plusieurs niveaux :
- Validation des entrées au niveau des contrôleurs
- Contraintes d'intégrité au niveau de la base de données
- Schémas Prisma définissant strictement les structures de données

#### TypeScript

L'utilisation de TypeScript confère au projet une robustesse accrue grâce au typage statique, permettant ainsi de prévenir de nombreuses erreurs à la compilation plutôt qu'à l'exécution.

#### Fonctionnalités WebSockets

L'implémentation des WebSockets (`websocket.service.ts` et `websocket.controller.ts`) permet une communication bidirectionnelle en temps réel, offrant ainsi aux utilisateurs une expérience collaborative synchronisée lors de la modification des tableaux pixelisés.

#### SuperPixelBoard

La fonctionnalité bonus du SuperPixelBoard est implémentée, permettant de visualiser l'ensemble des créations sur un tableau unifié, comme en témoignent les routes et contrôleurs dédiés.

#### Heatmap

La visualisation des zones les plus utilisées via une heatmap est également implémentée, comme le montre l'existence d'endpoints dédiés (`/pixelboards/:id/heatmap`), offrant ainsi une analyse visuelle des interactions utilisateurs.

#### Authentification et Autorisation

Le système d'authentification JWT est minutieusement implémenté (`auth.middleware.ts`, `auth.service.ts`), permettant une gestion fine des rôles utilisateurs (invité, utilisateur standard, premium, administrateur) et un contrôle d'accès précis aux fonctionnalités.

#### Linting

L'utilisation d'outils de linting est confirmée par les commandes disponibles (`npm run lint`, `npm run lint:fix`), assurant ainsi une cohérence stylistique et une qualité de code homogène.

Cette architecture backend témoigne d'une conception soignée, alliant rigueur technique et élégance structurelle, répondant ainsi pleinement aux exigences du projet tout en intégrant les fonctionnalités bonus avec brio.

#### Pages de Connexion et d'Inscription

Le système d'authentification frontend propose des interfaces utilisateur intuitives et élégantes pour la connexion et l'inscription. Les formulaires incluent une validation robuste des entrées qui guide l'utilisateur en temps réel, renforçant ainsi la sécurité et améliorant l'expérience utilisateur.

#### Gestion du Profil Utilisateur

Les utilisateurs authentifiés bénéficient d'une interface de gestion de profil complète, leur permettant de modifier leurs informations personnelles, changer leur mot de passe et consulter leurs statistiques de contribution. Cette centralisation des paramètres utilisateur facilite la personnalisation de l'expérience.

#### Système de Thème (Light/Dark)

Le projet implémente un système de thème flexible offrant aux utilisateurs le choix entre un affichage clair, sombre ou automatique suivant les préférences système. Cette personnalisation visuelle améliore le confort d'utilisation et l'accessibilité dans différentes conditions d'éclairage.

#### Composant de Canevas PixelBoard Interactif

L'interface de dessin constitue le cœur de l'application avec un canevas interactif permettant la manipulation pixel par pixel. Les fonctionnalités avancées incluent le zoom, la navigation fluide et la prévisualisation des modifications, offrant ainsi une expérience créative optimale.

#### Système de Cooldown et Indicateurs

Un mécanisme sophistiqué de cooldown est implémenté, affichant un minuteur visuel indiquant le temps d'attente entre chaque placement de pixel. Les utilisateurs premium bénéficient d'un statut privilégié clairement signalé, renforçant ainsi l'aspect stratégique de la contribution.

#### Historique et Statistiques des Contributions

L'application offre une visualisation détaillée de l'historique des contributions par utilisateur et par tableau, avec des graphiques temporels et des indicateurs de performance. Ces données permettent aux utilisateurs de suivre leur impact sur l'œuvre collective.

#### Export de PixelBoard en Image

Une fonctionnalité d'exportation permet aux utilisateurs de télécharger les tableaux aux formats SVG (vectoriel) ou PNG (raster), facilitant ainsi le partage et l'utilisation externe des créations collaboratives.

#### Notifications en Temps Réel

Un système d'alertes contextuel informe les utilisateurs des événements importants, du résultat de leurs actions et des interactions d'autres utilisateurs, créant ainsi une expérience interactive et réactive.

#### Optimisation des Performances

Des techniques avancées d'optimisation ont été mises en œuvre pour garantir une expérience fluide même avec de nombreux utilisateurs simultanés. Le rendu conditionnel, la mise en cache et le chargement différé contribuent à maintenir des performances élevées.

#### Replay/Timelapse des PixelBoard

La fonctionnalité de timelapse offre une dimension temporelle fascinante au projet, permettant de visualiser l'évolution chronologique complète d'un PixelBoard depuis sa création. Les utilisateurs peuvent naviguer dans l'historique des modifications, régler la vitesse de lecture et observer la construction collaborative des œuvres pixel par pixel, transformant ainsi l'art statique en une narration visuelle dynamique.

#### Responsive Design

L'interface adaptative assure une expérience utilisateur optimale sur tous types d'appareils, des grands écrans de bureau aux smartphones. Les composants se réorganisent intelligemment selon l'espace disponible, préservant ainsi l'accès à toutes les fonctionnalités.

#### Création de PixelBoard à partir d'Image

Le système intègre une fonctionnalité innovante permettant aux administrateurs et utilisateurs autorisés de générer automatiquement des PixelBoards à partir d'images existantes. Cette fonctionnalité transforme l'importation d'art pixelisé en un processus fluide et intuitif.

## Contribution de Dylan Lafaire (dragun06)

### Fonctionnalités développées

#### Corrections et améliorations
- FIX : Utilisateur (#104)
- FIX : Visiteur (#103)
- FIX : Administration (#101)
- FIX : Homepage (#100)

#### Optimisation et responsivité
- Responsive design et compatibilité multi-appareils (#49)
- Optimisation des performances du front-end (#47)

#### Visualisation et expérience utilisateur
- Heatmap des pixels (#46)
- Export de PixelBoard en image (#45)
- SuperPixelBoard (#43)
- Notifications et activité en temps réel (#42)
- Intégration WebSocket pour mise à jour en temps réel (#41)
- Système de cooldown et indicateurs (#38)
- Système de Timelapse/Replay des pixelboards
- Ajout de la fonction de création de pixelboard d'après une image

#### Gestion et interface
- Gestion des PixelBoards (CRUD) (#36)
- Interface de visualisation des PixelBoards (#33)
- Contexte d'authentification et gestion de l'état utilisateur (#29)
- Système de thème (light/dark) (#27)

#### Mise en place des fondations front-end
- Structure du projet et configuration TypeScript (#24)

#### Contributions back-end
- Mécanisme de recharge (cooldown) (#13)
- Opérations CRUD pour PixelBoard (#10)

### Résumé
Contribution centrée sur le développement front-end avec une attention particulière aux fonctionnalités interactives (placement de pixels, temps réel), à l'expérience utilisateur (thèmes, responsive design) et aux fonctionnalités visuelles (heatmap, export d'images). Participation également à plusieurs corrections de bugs pour assurer le bon fonctionnement de l'application pour différents types d'utilisateurs.

## Contribution de Florian Barrali (florianbrrl)

### Fonctionnalités développées

#### Corrections et améliorations
- FIX : PixelBoard (#102)

#### Frontend et visualisation des données
- Page d'accueil avec statistiques et prévisualisations (#44)
- Historique et statistiques des contributions (#39)

#### Composants interactifs et canevas
- Composant interactif de canevas PixelBoard (#37)
- Composant de canevas PixelBoard (vue simple) (#34)

#### Structure et navigation
- Mise en page principale et navigation (#32)
- Gestion du profil utilisateur (#31)
- Création des maquettes de pages avec données fictives (#28)
- Configuration du routeur et gestion des pages (#25)

#### Backend et optimisation
- Optimisation de la base de données (#22) - [wontfix]
- Liste et filtrage des PixelBoards (#11)
- Endpoints de profil utilisateur (#8)

### Résumé
Contribution équilibrée entre le développement frontend et backend, avec un focus particulier sur les composants graphiques (canevas PixelBoard), la visualisation des données et l'architecture de l'application. A également travaillé sur l'aspect structurel du projet en établissant la navigation et le routage, ainsi que sur la création des maquettes initiales. Responsable de plusieurs éléments fondamentaux du profil utilisateur et des statistiques.

## Contribution d'Enzo Rocamora (uncyzer)

### Fonctionnalités développées

#### Administration et gestion utilisateurs
- Gestion des utilisateurs (#40)
- Tableau de bord d'administration (#35)
- Pages de connexion et d'inscription (#30)

#### Backend temps réel et statistiques
- Routes d'API pour les statistiques (#20)
- Services d'agrégation (#18)
- Routes d'API en temps réel (#17)
- Système d'événements (#16)
- Implémentation WebSocket (#15)

#### Gestion des PixelBoards et pixels
- Suivi de l'historique des pixels (#14)
- Transactions de placement de pixels (#12)
- Modèles et schéma de PixelBoard (#9)

#### Authentification et sécurité
- Middleware d'autorisation (#7)
- Endpoints d'enregistrement et d'authentification des utilisateurs (#6)
- Modèles de base de données et conception du schéma (#5)

#### Infrastructure et configuration
- Configuration de la qualité du code et du linting (#4)
- Système de configuration d'environnement (#3)
- Configuration du serveur Express et des middlewares (#2)
- Structure du projet et configuration TypeScript (#1)

#### Optimisation (complétée)
- Stratégie de mise en cache (#21)

#### Non réalisé
- Tests de charge et mise à l'échelle (#23) - [Not planned / skipped]

### Résumé
Contribution majeure sur le backend de l'application, notamment sur la mise en place de l'infrastructure, la configuration, l'authentification et la sécurité. A également développé les fonctionnalités en temps réel (WebSocket) et les API statistiques. Responsable de l'implémentation du modèle de données et des opérations de base pour les PixelBoards. A travaillé aussi sur certaines fonctionnalités frontend liées à l'administration et la gestion des utilisateurs.
