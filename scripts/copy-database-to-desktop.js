const fs = require('fs');
const path = require('path');

async function copyDatabaseToDesktop() {
  try {
    console.log('🗄️  Copie de la base de données vers le bureau...');
    
    // Chemins source et destination
    const sourceDb = path.join(__dirname, '..', 'prisma', 'dev.db');
    const desktopPath = path.join(process.env.USERPROFILE || process.env.HOME, 'Desktop');
    const destDb = path.join(desktopPath, 'le_studio_database.db');
    
    // Vérifier si la base de données source existe
    if (!fs.existsSync(sourceDb)) {
      console.log('❌ Base de données source non trouvée:', sourceDb);
      return;
    }
    
    // Copier la base de données
    fs.copyFileSync(sourceDb, destDb);
    console.log('✅ Base de données copiée vers:', destDb);
    
    // Créer un fichier de configuration Prisma pour le bureau
    const prismaConfig = `// Configuration Prisma pour la base de données sur le bureau
// Ce fichier permet d'utiliser Prisma Studio avec la base de données copiée

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:${destDb.replace(/\\/g, '/')}"
}

model Session {
  id           String   @id
  userId       String
  token        String
  expiresAt    DateTime
  lastActivity DateTime @default(now())
  createdAt    DateTime @default(now())

  // Relations
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  type      String
  title     String
  message   String
  data      String?
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())

  // Relations
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("notifications")
}

model User {
  id          String   @id @default(cuid())
  firstName   String
  lastName    String
  email       String   @unique
  password    String
  role        Role     @default(USER)
  avatar      String?
  memberSince DateTime @default(now())
  lastLogin   DateTime @default(now())
  status      UserStatus @default(ACTIVE)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  articles       BlogArticle[]
  notifications  Notification[]
  sessions       Session[]

  @@map("users")
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
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  // Relations
  author        User          @relation(fields: [authorId], references: [id], onDelete: Cascade)
  images        BlogImage[]
  categories    BlogArticleCategory[]

  @@map("blog_articles")
}

model BlogImage {
  id           String   @id @default(cuid())
  articleId    String
  originalName String
  fileName     String
  filePath     String
  mimeType     String
  fileSize     BigInt
  width        Int
  height       Int
  altText      String?
  caption      String?
  order        Int      @default(0)
  createdAt    DateTime @default(now())

  // Relations
  article      BlogArticle @relation(fields: [articleId], references: [id], onDelete: Cascade)

  @@map("blog_images")
}

model BlogCategory {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  color       String?
  createdAt   DateTime @default(now())

  // Relations
  articles    BlogArticleCategory[]

  @@map("blog_categories")
}

model BlogArticleCategory {
  articleId  String
  categoryId String

  // Relations
  article    BlogArticle  @relation(fields: [articleId], references: [id], onDelete: Cascade)
  category   BlogCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@id([articleId, categoryId])
  @@map("blog_article_categories")
}

enum Role {
  USER
  MODERATOR
  ADMIN
}

enum UserStatus {
  ACTIVE
  INACTIVE
  BANNED
}

enum ArticleStatus {
  DRAFT
  PENDING
  PUBLISHED
  REJECTED
}
`;
    
    const configPath = path.join(desktopPath, 'prisma-schema-desktop.prisma');
    fs.writeFileSync(configPath, prismaConfig);
    console.log('✅ Fichier de configuration Prisma créé:', configPath);
    
    // Créer un script batch pour lancer Prisma Studio
    const batchScript = `@echo off
echo 🗄️  Lancement de Prisma Studio avec la base de données du Studio Sport...
echo.
echo Base de données: ${destDb}
echo.
echo Pour utiliser cette base de données:
echo 1. Ouvrez Prisma Studio: npx prisma studio --schema=prisma-schema-desktop.prisma
echo 2. Ou utilisez directement: npx prisma studio --schema=prisma-schema-desktop.prisma
echo.
pause
`;
    
    const batchPath = path.join(desktopPath, 'lancer-prisma-studio.bat');
    fs.writeFileSync(batchPath, batchScript);
    console.log('✅ Script batch créé:', batchPath);
    
    // Créer un fichier README
    const readme = `# Base de Données Studio Sport

## 📁 Fichiers créés sur le bureau:

1. **le_studio_database.db** - Base de données SQLite copiée du projet
2. **prisma-schema-desktop.prisma** - Configuration Prisma pour cette base de données
3. **lancer-prisma-studio.bat** - Script pour lancer Prisma Studio

## 🚀 Comment utiliser:

### Option 1: Script automatique
Double-cliquez sur \`lancer-prisma-studio.bat\`

### Option 2: Commande manuelle
Ouvrez PowerShell sur le bureau et tapez:
\`\`\`powershell
npx prisma studio --schema=prisma-schema-desktop.prisma
\`\`\`

## 📊 Contenu de la base de données:

- **Utilisateurs**: Admin, Modérateurs, Auteurs
- **Articles**: Articles de blog avec différents statuts
- **Catégories**: Catégories d'articles
- **Images**: Images associées aux articles
- **Sessions**: Sessions utilisateurs
- **Notifications**: Notifications système

## 🔐 Comptes de test:

- **Admin**: admin@lestudiosport.fr / admin123
- **Modérateur**: mod@lestudiosport.fr / admin123
- **Auteur**: author@lestudiosport.fr / admin123

## ⚠️  Important:

Cette base de données est une copie. Les modifications ne seront pas synchronisées avec le projet original.
Pour mettre à jour, relancez ce script.
`;
    
    const readmePath = path.join(desktopPath, 'README-Database.md');
    fs.writeFileSync(readmePath, readme);
    console.log('✅ Fichier README créé:', readmePath);
    
    console.log('\n🎉 Base de données configurée avec succès sur le bureau !');
    console.log('\n📋 Fichiers créés:');
    console.log(`   📄 ${destDb}`);
    console.log(`   📄 ${configPath}`);
    console.log(`   📄 ${batchPath}`);
    console.log(`   📄 ${readmePath}`);
    console.log('\n🚀 Pour lancer Prisma Studio:');
    console.log(`   Double-cliquez sur "lancer-prisma-studio.bat" ou`);
    console.log(`   Ouvrez PowerShell et tapez: npx prisma studio --schema=prisma-schema-desktop.prisma`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la copie:', error.message);
  }
}

copyDatabaseToDesktop(); 