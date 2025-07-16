# Édition d'Articles par l'Administration

## Vue d'ensemble

Cette fonctionnalité permet aux administrateurs et modérateurs de modifier les articles du blog, qu'ils soient en attente de validation ou déjà publiés.

## Fonctionnalités

### ✅ Page d'édition d'articles
- **URL** : `/admin/blog/[id]`
- **Accès** : Administrateurs et modérateurs uniquement
- **Fonctionnalités** :
  - Formulaire complet d'édition
  - Éditeur TinyMCE pour le contenu
  - Gestion des statuts d'articles
  - Validation et sanitisation des données
  - Interface responsive et moderne

### ✅ Bouton "Modifier" dans l'administration
- **Localisation** : Page `/admin/blog`
- **Visibilité** : Tous les articles (en attente et publiés)
- **Couleur** : Bleu pour distinguer des autres actions

### ✅ Permissions sécurisées
- **Administrateurs** : Peuvent modifier tous les articles
- **Modérateurs** : Peuvent modifier tous les articles
- **Utilisateurs normaux** : Ne peuvent pas accéder à cette fonctionnalité

## Interface Utilisateur

### Page d'administration (`/admin/blog`)
```
┌─────────────────────────────────────────────────────────┐
│ Administration - Blog                    [Nouvel article] │
├─────────────────────────────────────────────────────────┤
│ [Tous] [En attente] [Publiés] [Brouillons]              │
├─────────────────────────────────────────────────────────┤
│ Article 1                    │ [Voir] [Modifier] [Publier] │
│ Article 2                    │ [Voir] [Modifier] [Rejeter] │
│ Article 3                    │ [Voir] [Modifier] [Supprimer]│
└─────────────────────────────────────────────────────────┘
```

### Page d'édition (`/admin/blog/[id]`)
```
┌─────────────────────────────────────────────────────────┐
│ Modifier l'article                        [Retour admin] │
├─────────────────────────────────────────────────────────┤
│ Informations de l'article:                               │
│ • Auteur: John Doe                                       │
│ • Créé le: 15/01/2024                                   │
│ • Publié le: 16/01/2024                                 │
│ • Slug: mon-article                                      │
├─────────────────────────────────────────────────────────┤
│ Titre de l'article *                                     │
│ [Mon article de blog]                                    │
│                                                          │
│ Extrait *                                                │
│ [Résumé de l'article...]                                 │
│                                                          │
│ Statut *                                                 │
│ [Brouillon ▼]                                            │
│                                                          │
│ Image de couverture (URL)                               │
│ [https://example.com/image.jpg]                         │
│                                                          │
│ Contenu de l'article *                                   │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [Éditeur TinyMCE avec barre d'outils complète]     │ │
│ │                                                     │ │
│ │                                                     │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ [Mettre à jour l'article] [Annuler]                     │
└─────────────────────────────────────────────────────────┘
```

## API Endpoints

### GET `/api/blog/articles/[id]`
Récupère un article spécifique pour l'édition.

**Permissions** :
- Article publié : Accès public
- Article non publié : Administrateurs/modérateurs uniquement

**Réponse** :
```json
{
  "id": "article-id",
  "title": "Titre de l'article",
  "slug": "titre-de-larticle",
  "excerpt": "Extrait de l'article",
  "content": "<p>Contenu HTML...</p>",
  "status": "PUBLISHED",
  "featuredImage": "https://example.com/image.jpg",
  "createdAt": "2024-01-15T10:00:00Z",
  "publishedAt": "2024-01-16T10:00:00Z",
  "author": {
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### PATCH `/api/blog/articles/[id]`
Met à jour un article existant.

**Permissions** :
- Administrateurs : Tous les articles
- Modérateurs : Tous les articles
- Utilisateurs : Seulement leurs propres articles

**Corps de la requête** :
```json
{
  "title": "Nouveau titre",
  "excerpt": "Nouvel extrait",
  "content": "<p>Nouveau contenu...</p>",
  "featuredImage": "https://example.com/new-image.jpg",
  "status": "PUBLISHED"
}
```

**Headers requis** :
- `Content-Type: application/json`
- `X-CSRF-Token: [token]`

## Validation des Données

### Schéma de validation (`updateArticle`)
```javascript
{
  title: {
    required: false,
    minLength: 3,
    maxLength: 255,
    pattern: /^[a-zA-ZÀ-ÿ0-9\s\-_.,!?()'"]+$/
  },
  excerpt: {
    required: false,
    minLength: 10,
    maxLength: 500
  },
  content: {
    required: false,
    minLength: 50
  },
  featuredImage: {
    required: false,
    pattern: /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i
  },
  status: {
    required: false,
    pattern: /^(DRAFT|PENDING|PUBLISHED|REJECTED)$/
  }
}
```

## Sécurité

### ✅ Protection CSRF
- Toutes les requêtes de modification nécessitent un token CSRF
- Token récupéré automatiquement via `/api/csrf`

### ✅ Sanitisation HTML
- Contenu HTML sanitifié avec DOMPurify
- Protection contre les attaques XSS
- Balises autorisées limitées

### ✅ Validation côté serveur
- Validation stricte des données
- Vérification des permissions
- Gestion d'erreurs sécurisée

### ✅ Gestion des sessions
- Vérification de l'authentification
- Contrôle des rôles utilisateur
- Expiration automatique des sessions

## Workflow d'utilisation

### 1. Accès à l'administration
```
Utilisateur connecté → /admin/blog
```

### 2. Sélection d'un article
```
Liste des articles → Clic sur "Modifier"
```

### 3. Édition de l'article
```
Formulaire d'édition → Modification des champs → Validation
```

### 4. Sauvegarde
```
Soumission → API PATCH → Redirection vers l'administration
```

## Gestion des erreurs

### Erreurs courantes
- **401 Unauthorized** : Utilisateur non connecté
- **403 Forbidden** : Permissions insuffisantes
- **404 Not Found** : Article inexistant
- **400 Bad Request** : Données invalides
- **500 Internal Server Error** : Erreur serveur

### Messages d'erreur
- Messages en français
- Détails des erreurs de validation
- Redirection automatique en cas d'erreur d'authentification

## Tests

### Script de test
```bash
node scripts/test-edit-article.js
```

### Tests inclus
- ✅ Récupération d'articles
- ✅ Mise à jour d'articles
- ✅ Vérification des permissions
- ✅ Test de l'interface d'administration
- ✅ Validation des données

## Maintenance

### Logs
- Toutes les modifications sont loggées
- Horodatage des changements
- Identification de l'utilisateur

### Sauvegarde
- Articles sauvegardés automatiquement
- Historique des modifications disponible
- Possibilité de restauration

## Évolutions futures

### Fonctionnalités prévues
- [ ] Historique des modifications
- [ ] Comparaison des versions
- [ ] Prévisualisation avant publication
- [ ] Gestion des images multiples
- [ ] Système de commentaires
- [ ] Notifications de modification

### Améliorations techniques
- [ ] Cache des articles
- [ ] Optimisation des performances
- [ ] Support des images WebP
- [ ] Éditeur markdown alternatif
- [ ] Mode hors ligne 