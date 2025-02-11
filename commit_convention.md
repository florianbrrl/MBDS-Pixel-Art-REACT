# Convention de Nommage des Commits

## Format du message de commit
Le message de commit doit suivre le format suivant :

```
<type>(<scope*>): <message>

<informations supplémentaires>
```

### `<type>`
Le type de commit peut être l'un des suivants :
- **fix** : pour les corrections de bugs.
- **feat** : pour les nouvelles fonctionnalités.
- **build** : pour les modifications liées à la construction du projet (ex: scripts, dépendances).
- **refactor** : pour les refactorisations de code (sans ajout de fonctionnalité ni correction de bug).
- **perfs** : pour les améliorations de performance.
- **docs** : pour les modifications de documentation.
- **style** : pour les modifications de style de code (pas pour le CSS, mais pour le style du code).

### `<scope*>`
Le scope est pertinent dans un monorepo contenant plusieurs sous-packages. Il faut lister tous les packages modifiés dans le commit.  
Exemple : `fix(front,api): format du nom d'utilisateur incorrect`.

### `<message>`
Le message doit être concis et ne pas dépasser 80 caractères.

### `<informations supplémentaires>`
Cette section est optionnelle et permet de fournir des détails supplémentaires sur le commit.

---

## Exemples de commits
- `feat(api): ajout de l'API utilisateur`
- `fix(client, api): problème d'email lorsque CC est un tableau vide`
  - `due to empty string on array : voir l'issue n°13 pour plus d'informations`
- `style(client): suppression des console.log`
- `build(api): ajout d'un script pour le déploiement automatique`

---

## Règles supplémentaires
- Un commit doit refléter une seule modification.
- Le code correspondant à chaque commit doit compiler correctement.
- Les dépendances requises doivent être listées dans le `package.json`.
- Ne pas committer des fichiers inutiles ou des configurations personnelles (utiliser `.env.development.local` pour les variables d'environnement en développement).

