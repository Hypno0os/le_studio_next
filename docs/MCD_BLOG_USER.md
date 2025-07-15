# Modèle Conceptuel de Données (MCD) - Blog et User

## Entités

### USER
- **id** (PK) : UUID
- **firstName** : VARCHAR(100)
- **lastName** : VARCHAR(100)
- **email** : VARCHAR(255) UNIQUE
- **password** : VARCHAR(255) HASHED
- **role** : ENUM('user', 'moderator', 'admin')
- **avatar** : VARCHAR(255) NULLABLE
- **memberSince** : TIMESTAMP
- **lastLogin** : TIMESTAMP
- **status** : ENUM('active', 'inactive', 'banned')
- **createdAt** : TIMESTAMP
- **updatedAt** : TIMESTAMP

### BLOG_ARTICLE
- **id** (PK) : UUID
- **title** : VARCHAR(255)
- **slug** : VARCHAR(255) UNIQUE
- **excerpt** : TEXT
- **content** : LONGTEXT
- **featuredImage** : VARCHAR(255) NULLABLE
- **status** : ENUM('draft', 'pending', 'published', 'rejected')
- **publishedAt** : TIMESTAMP NULLABLE
- **authorId** (FK) : UUID → USER.id
- **createdAt** : TIMESTAMP
- **updatedAt** : TIMESTAMP

### BLOG_IMAGE
- **id** (PK) : UUID
- **articleId** (FK) : UUID → BLOG_ARTICLE.id
- **originalName** : VARCHAR(255)
- **fileName** : VARCHAR(255)
- **filePath** : VARCHAR(500)
- **mimeType** : VARCHAR(100)
- **fileSize** : BIGINT
- **width** : INT
- **height** : INT
- **altText** : VARCHAR(255) NULLABLE
- **caption** : TEXT NULLABLE
- **order** : INT DEFAULT 0
- **createdAt** : TIMESTAMP

### BLOG_CATEGORY
- **id** (PK) : UUID
- **name** : VARCHAR(100)
- **slug** : VARCHAR(100) UNIQUE
- **description** : TEXT NULLABLE
- **color** : VARCHAR(7) NULLABLE
- **createdAt** : TIMESTAMP

### BLOG_ARTICLE_CATEGORY (Table de liaison)
- **articleId** (FK) : UUID → BLOG_ARTICLE.id
- **categoryId** (FK) : UUID → BLOG_CATEGORY.id
- **PRIMARY KEY** : (articleId, categoryId)

## Relations

1. **USER** (1) ←→ (N) **BLOG_ARTICLE**
   - Un utilisateur peut écrire plusieurs articles
   - Un article appartient à un seul utilisateur

2. **BLOG_ARTICLE** (1) ←→ (N) **BLOG_IMAGE**
   - Un article peut avoir plusieurs images
   - Une image appartient à un seul article

3. **BLOG_ARTICLE** (N) ←→ (N) **BLOG_CATEGORY**
   - Un article peut avoir plusieurs catégories
   - Une catégorie peut être associée à plusieurs articles
   - Relation via la table de liaison BLOG_ARTICLE_CATEGORY

## Contraintes

### Contraintes d'intégrité
- **USER.email** : UNIQUE, NOT NULL
- **BLOG_ARTICLE.slug** : UNIQUE, NOT NULL
- **BLOG_CATEGORY.slug** : UNIQUE, NOT NULL
- **BLOG_ARTICLE.authorId** : NOT NULL, FOREIGN KEY
- **BLOG_IMAGE.articleId** : NOT NULL, FOREIGN KEY

### Contraintes métier
- Seuls les utilisateurs avec role 'admin' ou 'moderator' peuvent créer/modifier/supprimer des articles
- Les articles avec status 'published' sont visibles publiquement
- Les images sont automatiquement redimensionnées en plusieurs formats
- Les slugs sont générés automatiquement à partir du titre

## Index recommandés

- **USER.email** : INDEX UNIQUE
- **BLOG_ARTICLE.slug** : INDEX UNIQUE
- **BLOG_ARTICLE.status** : INDEX
- **BLOG_ARTICLE.publishedAt** : INDEX
- **BLOG_ARTICLE.authorId** : INDEX
- **BLOG_CATEGORY.slug** : INDEX UNIQUE
- **BLOG_IMAGE.articleId** : INDEX
- **BLOG_IMAGE.order** : INDEX 