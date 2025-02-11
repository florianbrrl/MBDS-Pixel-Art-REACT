# MBDS-Pixel-Art-REACT
## Authors
- [ROCAMORA Enzo - uncyzer](https://github.com/uncyzer)
- [LAFAIRE Dylan - dragun06](https://github.com/dragun06)
- [BARRALI Florian - florianbrrl](https://github.com/florianbrrl)

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
