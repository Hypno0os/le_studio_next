# 🏋️ Studio Sport Biarritz - Site Web Officiel

[![Next.js](https://img.shields.io/badge/Next.js-15.3.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.11.1-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

Site web moderne et responsive pour le **Studio Sport Biarritz** - Salle de sport et coaching personnalisé sur la Côte Basque.

## 🎯 Fonctionnalités

### 👥 **Gestion des Utilisateurs**
- ✅ Inscription et connexion sécurisées
- ✅ Profils utilisateurs personnalisables
- ✅ Système de rôles (USER, MODERATOR, ADMIN)
- ✅ Gestion des avatars et informations personnelles
- ✅ Sessions sécurisées avec JWT

### 📝 **Blog et Actualités**
- ✅ Système de blog complet avec éditeur TinyMCE
- ✅ Gestion des catégories d'articles
- ✅ Upload et gestion d'images multiples
- ✅ Système de brouillons et publication
- ✅ SEO-friendly avec slugs automatiques
- ✅ Pagination et recherche

### 🖼️ **Gestion des Images**
- ✅ Upload sécurisé avec validation
- ✅ Redimensionnement automatique (Sharp)
- ✅ Génération de thumbnails
- ✅ Conversion WebP pour optimisation
- ✅ Stockage organisé (original, medium, thumbnails)

### 🔔 **Système de Notifications**
- ✅ Notifications en temps réel
- ✅ Types multiples (info, success, warning, error)
- ✅ Gestion des notifications non lues
- ✅ Notifications système et personnalisées

### 🛡️ **Sécurité**
- ✅ Authentification JWT sécurisée
- ✅ Mots de passe hashés (bcrypt)
- ✅ Protection CSRF
- ✅ Sanitisation HTML (DOMPurify)
- ✅ Validation des données
- ✅ Rate limiting

### 💾 **Sauvegarde et Export**
- ✅ Export automatique en JSON et SQL
- ✅ Sauvegardes horodatées
- ✅ Nettoyage automatique des anciennes sauvegardes
- ✅ Scripts npm pour automatisation
- ✅ Documentation complète

## 🛠️ Technologies Utilisées

### **Frontend**
- **Next.js 15** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utilitaire
- **React Icons** - Icônes modernes
- **TinyMCE** - Éditeur de texte riche

### **Backend**
- **Next.js API Routes** - API RESTful
- **Prisma ORM** - Gestion de base de données
- **SQLite** - Base de données (développement)
- **JWT** - Authentification par tokens
- **bcryptjs** - Chiffrement des mots de passe

### **Outils**
- **Sharp** - Traitement d'images
- **DOMPurify** - Sanitisation HTML
- **uuid** - Génération d'identifiants uniques

## 📁 Structure du Projet

```
le-studio-sport-next/
├── src/
│   ├── app/                    # App Router Next.js
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # Authentification
│   │   │   ├── blog/          # Gestion du blog
│   │   │   ├── admin/         # Interface admin
│   │   │   └── upload/        # Upload d'images
│   │   ├── blog/              # Pages du blog
│   │   ├── admin/             # Interface d'administration
│   │   └── globals.css        # Styles globaux
│   ├── components/            # Composants réutilisables
│   ├── hooks/                 # Hooks personnalisés
│   └── lib/                   # Utilitaires et configurations
├── prisma/
│   ├── schema.prisma          # Schéma de base de données
│   └── migrations/            # Migrations Prisma
├── scripts/                   # Scripts utilitaires
│   ├── export-database.js     # Export de données
│   └── backup-database.js     # Sauvegarde automatique
├── data/                      # Données exportées
│   ├── backups/               # Sauvegardes horodatées
│   └── README.md              # Documentation des exports
└── public/                    # Assets statiques
```

## 🚀 Installation et Démarrage

### **Prérequis**
- Node.js 18+ 
- npm ou yarn
- Git

### **Installation**

```bash
# Cloner le repository
git clone https://github.com/Hypno0os/le_studio_back.git
cd le-studio-sport-next

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos configurations

# Générer le client Prisma
npm run db:generate

# Appliquer les migrations
npm run db:migrate

# Lancer le serveur de développement
npm run dev
```

### **Variables d'Environnement**

```env
# Base de données
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="votre-secret-jwt-super-securise"

# Upload
NEXT_PUBLIC_MAX_FILE_SIZE="5242880"
NEXT_PUBLIC_ALLOWED_FILE_TYPES="image/jpeg,image/png,image/webp"

# Application
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

## 📊 Base de Données

### **Modèles Principaux**

```prisma
model User {
  id          String   @id @default(cuid())
  firstName   String
  lastName    String
  email       String   @unique
  password    String   // Hashé avec bcrypt
  role        Role     @default(USER)
  avatar      String?
  memberSince DateTime @default(now())
  lastLogin   DateTime @default(now())
  status      UserStatus @default(ACTIVE)
  
  // Relations
  articles       BlogArticle[]
  notifications  Notification[]
  sessions       Session[]
}

model BlogArticle {
  id            String        @id @default(cuid())
  title         String
  slug          String        @unique
  excerpt       String
  content       String
  featuredImage String?
  status        ArticleStatus @default(DRAFT)
  publishedAt   DateTime?
  authorId      String
  
  // Relations
  author        User          @relation(fields: [authorId], references: [id])
  images        BlogImage[]
  categories    BlogArticleCategory[]
}
```

### **Commandes Prisma**

```bash
# Générer le client Prisma
npm run db:generate

# Pousser le schéma vers la DB
npm run db:push

# Exécuter les migrations
npm run db:migrate

# Ouvrir Prisma Studio
npm run db:studio
```

## 🔧 Scripts Disponibles

```bash
# Développement
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run start        # Serveur de production
npm run lint         # Linting ESLint

# Base de données
npm run db:generate  # Générer client Prisma
npm run db:push      # Pousser schéma
npm run db:migrate   # Exécuter migrations
npm run db:studio    # Interface Prisma Studio

# Export et sauvegarde
npm run export-db    # Export simple
npm run backup-db    # Sauvegarde automatique
```

## 🛡️ Sécurité

### **Mesures Implémentées**
- ✅ **Authentification JWT** avec expiration
- ✅ **Mots de passe hashés** avec bcrypt (12 rounds)
- ✅ **Protection CSRF** sur toutes les routes
- ✅ **Sanitisation HTML** avec DOMPurify
- ✅ **Validation des données** côté serveur
- ✅ **Rate limiting** sur les API sensibles
- ✅ **Gestion sécurisée des sessions**

### **Bonnes Pratiques**
- Variables d'environnement pour les secrets
- Validation des types avec TypeScript
- Gestion d'erreurs sécurisée
- Logs d'audit pour les actions sensibles

## 📈 Performance

### **Optimisations**
- ✅ **Images optimisées** avec Sharp et WebP
- ✅ **Lazy loading** des images
- ✅ **Pagination** des résultats
- ✅ **Cache** des requêtes fréquentes
- ✅ **Compression** des assets

### **Monitoring**
- Logs de performance
- Métriques d'utilisation
- Monitoring des erreurs
- Statistiques de base de données

## 🔄 Sauvegarde et Export

### **Système Automatisé**
```bash
# Export simple
npm run export-db

# Sauvegarde avec horodatage
npm run backup-db
```

### **Fonctionnalités**
- ✅ Export en JSON et SQL
- ✅ Sauvegardes horodatées
- ✅ Nettoyage automatique (10 dernières)
- ✅ Statistiques détaillées
- ✅ Scripts npm intégrés

## 🚀 Déploiement

### **Environnements**
- **Développement** : SQLite + variables locales
- **Production** : MySQL/PostgreSQL + variables serveur

### **Plateformes Supportées**
- ✅ Vercel
- ✅ Netlify
- ✅ Railway
- ✅ Heroku
- ✅ Serveur VPS

## 👥 Contribution

### **Workflow Git**
1. Fork du repository
2. Création d'une branche feature
3. Développement et tests
4. Pull Request avec description détaillée
5. Review et merge

### **Standards de Code**
- TypeScript strict
- ESLint + Prettier
- Tests unitaires
- Documentation des fonctions

## 📞 Support

### **Contact**
- **Site web** : [Studio Sport Biarritz](https://www.studiosportbiarritz.fr)
- **Email** : contact@studiosportbiarritz.fr
- **Téléphone** : +33 5 XX XX XX XX

### **Documentation**
- [Guide d'utilisation](docs/user-guide.md)
- [API Documentation](docs/api.md)
- [Déploiement](docs/deployment.md)

## 📄 Licence

Ce projet est sous licence **ISC**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- **Next.js** pour le framework
- **Prisma** pour l'ORM
- **Tailwind CSS** pour le styling
- **Tous les contributeurs** du projet

---

**Développé avec ❤️ pour le Studio Sport Biarritz**

*Fait avec Next.js, TypeScript et Prisma* 