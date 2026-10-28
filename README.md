# Film Match

Application de gestion de films construite avec React et Ionic. Chaque personne peut créer son compte, gérer ses favoris et découvrir les autres utilisateurs qui partagent ses goûts.

## Comment ça marche ?

- Un utilisateur s’inscrit avec son prénom, son nom, son âge et une photo prise avec l’appareil photo. Il se connecte ensuite avec son email et son mot de passe.
- Le catalogue propose des films et chaque utilisateur possède sa propre liste de favoris.
- L’administrateur peut ajouter un film manuellement ou l’importer depuis TMDB. Il peut aussi désactiver ou réactiver un compte sans le supprimer.
- La page **Matching** compare les favoris, les genres, les acteurs, les années et les décennies. Les vrais matchs dépassent strictement 75 %. Si aucun profil ne franchit ce seuil, l’application peut afficher les trois profils les plus proches comme suggestions, clairement séparées des matchs.
- Les pages Films, Favoris, Matching et administration rechargent leurs données à l’ouverture et au retour sur leur onglet.

## Technologies

| Partie | Technologies et rôle |
| --- | --- |
| Interface | React, TypeScript, Ionic React 8 et Ionicons |
| Navigation | Ionic React Router et React Router |
| Développement web | Vite, avec un proxy `/api` vers le backend |
| Appareil photo | Capacitor Camera |
| API | Node.js et Express |
| Données | SQLite, dans `backend/data/film-match.db` |
| Connexion | Mots de passe hachés avec bcryptjs et sessions JWT |
| Catalogue externe | TMDB, optionnel et utilisé uniquement par le backend |

Les données sont stockées dans SQLite et accessibles via l’API Express. Firebase n’est pas utilisé dans cette version.

## Organisation du code

```text
backend/
  src/
    index.js       Routes HTTP, favoris, administration et matching
    db.js          Tables SQLite, données de démonstration et conversion des données
    auth.js        Création et vérification des jetons JWT, droits admin
    matching.js    Profil de goûts et calcul des scores
    tmdb.js        Recherche et import de films TMDB
    env.js         Chargement du fichier .env
frontend/
  src/
    App.tsx        Application Ionic et routes principales
    context/       État de connexion partagé dans l’interface
    pages/         Connexion, inscription, films, favoris, matching et administration
    services/api.ts Appels HTTP avec le jeton de connexion
    theme/         Couleurs et styles Ionic
```

### Matching

Le backend construit un profil à partir des films favoris de chaque utilisateur. Chaque critère utilise le coefficient de Dice, qui compare les éléments communs aux deux profils. Le score final combine ces résultats :

| Critère | Poids |
| --- | ---: |
| Films favoris identiques | 28 % |
| Genres | 30 % |
| Acteurs | 24 % |
| Années de sortie | 8 % |
| Décennies | 10 % |

Un résultat affiché comme match a un score **strictement supérieur à 75 %**. Les suggestions sous le seuil ne sont pas présentées comme des matchs.

## Prérequis

- Node.js 24 recommandé (`node:sqlite` est utilisé par le backend).
- npm, inclus avec Node.js.
- Une clé TMDB uniquement pour activer la recherche et l’import externes.

## Démarrer en local

Ouvrez deux terminaux PowerShell à la racine du projet.

**1. Démarrer l’API**

```powershell
cd backend
npm install
npm start
```

L’API écoute sur `http://localhost:3001`.

**2. Démarrer l’interface**

```powershell
cd frontend
npm install
npm run dev -- --port 8101
```

Ouvrez [http://localhost:8101](http://localhost:8101). Vite transmet les appels `/api` au backend sur le port 3001. Si le port 8101 est occupé, choisissez un autre port en remplaçant `8101`.

La base de démonstration est créée au premier démarrage. Les données restent dans `backend/data/film-match.db` entre les redémarrages.

## Comptes de démonstration

| Rôle | Email | Mot de passe |
| --- | --- | --- |
| Utilisateur (goûts Nolan) | `alice@filmmatch.app` | `Alice123!` |
| Utilisateur proche d’Alice | `bob@filmmatch.app` | `Bob123!` |
| Utilisateur romance | `charlie@filmmatch.app` | `Charlie123!` |
| Administrateur | `admin@filmmatch.app` | `Admin123!` |

Pour vérifier le matching, connectez-vous avec Alice puis ouvrez **Matching** : Bob doit apparaître au-dessus de 75 %. Charlie ne doit pas être présenté comme un match.

## Activer TMDB (facultatif)

Sans clé, le catalogue de démonstration et l’ajout manuel restent disponibles. Pour utiliser la recherche TMDB :

1. Créez un compte et une clé API depuis [The Movie Database](https://www.themoviedb.org/settings/api).
2. À la racine du projet, copiez le modèle :

   ```powershell
   Copy-Item .env.example .env
   ```

3. Ouvrez `.env` et renseignez `TMDB_API_KEY=votre_cle`.
4. Redémarrez l’API. Le backend charge `.env` à la racine du projet ou dans `backend/`.

Ne partagez pas `.env` et ne le commitez pas : il est exclu par `.gitignore`. L’écran d’administration indique si TMDB est activé. `JWT_SECRET` peut également être défini dans `.env` ; utilisez une valeur privée en production.

## Routes API principales

Les routes de films, favoris et matching nécessitent une connexion. Les routes `/api/admin/*` nécessitent en plus le rôle administrateur.

| Méthode et route | Utilisation |
| --- | --- |
| `GET /api/health` | Vérifie l’API et indique si TMDB est activé |
| `POST /api/auth/register` | Crée un compte |
| `POST /api/auth/login` | Connecte un utilisateur et renvoie un JWT |
| `GET /api/movies` | Liste et recherche les films |
| `GET /api/favorites` | Récupère les favoris de l’utilisateur connecté |
| `POST /api/favorites/:movieId` | Ajoute un favori |
| `DELETE /api/favorites/:movieId` | Retire un favori |
| `GET /api/matching` | Calcule les matchs et suggestions |
| `POST /api/movies` | Ajoute un film manuellement (admin) |
| `GET /api/admin/users` | Liste les comptes (admin) |
| `PATCH /api/admin/users/:id/active` | Active ou désactive un compte (admin) |

Les routes TMDB d’administration sont `GET /api/admin/tmdb/search` et `POST /api/admin/movies/import`.
