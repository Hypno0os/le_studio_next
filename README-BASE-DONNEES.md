# Base de Données Studio Sport Biarritz

## Fichiers inclus

**studio-sport-database.db** 
- Base de données SQLite complète
- Ouvrir avec : DB Browser for SQLite (gratuit) ou DBeaver

**studio-sport-data-export.json**
- Export JSON de toutes les données
- Format lisible par n'importe quel éditeur de texte

**studio-sport-database.sql**
- Script SQL pour recréer la base
- Compatible SQLite, MySQL, PostgreSQL

## Contenu de la base

**Tables principales :**
- User : 3 utilisateurs (USER, MODERATOR, ADMIN)
- BlogArticle : 15 articles avec contenu complet
- BlogCategory : 4 catégories (Nutrition, Entraînement, Bien-être, Actualités)
- BlogImage : Images associées aux articles
- Notification : Système de notifications
- Session : Sessions utilisateurs

**Données d'exemple :**
- Utilisateur admin : admin@studio.com / admin123
- Articles : Conseils nutrition, programmes d'entraînement, actualités
- Images : Photos des activités, coachs, équipements

## Utilisation

**Option 1 : Base SQLite**
1. Télécharger DB Browser for SQLite
2. Ouvrir studio-sport-database.db
3. Naviguer dans les tables

**Option 2 : Import SQL**
```sql
source studio-sport-database.sql;
```

**Option 3 : Lecture JSON**
- Ouvrir studio-sport-data-export.json avec un éditeur
- Données structurées et lisibles

## Statistiques

- 3 utilisateurs (1 admin, 1 modérateur, 1 utilisateur)
- 15 articles publiés avec contenu complet
- 4 catégories d'articles
- Images multiples par article
- Système de notifications fonctionnel
- Sessions utilisateurs sécurisées

## Sécurité

- Mots de passe hashés avec bcrypt
- JWT tokens pour l'authentification
- Protection CSRF implémentée
- Validation des données côté serveur

---

Développé pour le Studio Sport Biarritz
Base de données exportée le 15 juillet 2025 