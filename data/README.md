# Export de la base de données Studio Sport

Ce dossier contient les exports de la base de données du projet Studio Sport.

## Fichiers disponibles

- `database-export.json` : Export complet au format JSON avec toutes les relations
- `database-export.sql` : Script SQL pour recréer les données
- `README.md` : Ce fichier

## Structure des données

### Tables principales
- `users` : Utilisateurs du système
- `blog_articles` : Articles du blog
- `blog_categories` : Catégories d'articles
- `blog_images` : Images des articles
- `notifications` : Notifications utilisateur
- `sessions` : Sessions utilisateur

### Relations
- Un utilisateur peut avoir plusieurs articles
- Un article peut avoir plusieurs catégories
- Un article peut avoir plusieurs images
- Un utilisateur peut avoir plusieurs notifications et sessions

## Utilisation

### Import JSON
```javascript
const data = require('./data/database-export.json');
```

### Import SQL
Exécutez le fichier `database-export.sql` dans votre base de données SQLite.

## Dernière exportation
2025-07-15T04:46:46.880Z
