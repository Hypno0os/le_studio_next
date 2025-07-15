const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function backupDatabase() {
  try {
    console.log('🔄 Sauvegarde automatique de la base de données...');
    
    // Créer le dossier backups s'il n'existe pas
    const backupsDir = path.join(__dirname, '..', 'data', 'backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    // Générer un nom de fichier avec horodatage
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `backup-${timestamp}`;

    // Créer le dossier pour cette sauvegarde
    const backupDir = path.join(backupsDir, backupName);
    fs.mkdirSync(backupDir, { recursive: true });

    // Exporter toutes les tables
    const users = await prisma.user.findMany({
      include: {
        articles: {
          include: {
            categories: {
              include: {
                category: true
              }
            },
            images: true
          }
        },
        notifications: true,
        sessions: true
      }
    });

    const categories = await prisma.blogCategory.findMany({
      include: {
        articles: {
          include: {
            article: true
          }
        }
      }
    });

    // Créer l'objet de sauvegarde
    const backup = {
      backupAt: new Date().toISOString(),
      version: '1.0.0',
      tables: {
        users,
        categories
      }
    };

    // Sauvegarder en JSON
    const jsonPath = path.join(backupDir, 'backup.json');
    fs.writeFileSync(jsonPath, JSON.stringify(backup, null, 2));

    // Créer un fichier SQL
    const sqlPath = path.join(backupDir, 'backup.sql');
    let sqlContent = `-- Sauvegarde automatique de la base de données Studio Sport
-- Généré le: ${new Date().toISOString()}
-- Version: 1.0.0

-- Supprimer les données existantes
DELETE FROM blog_article_categories;
DELETE FROM blog_images;
DELETE FROM blog_articles;
DELETE FROM notifications;
DELETE FROM sessions;
DELETE FROM users;
DELETE FROM blog_categories;

-- Réinitialiser les séquences (si applicable)
-- DELETE FROM sqlite_sequence WHERE name IN ('users', 'blog_articles', 'blog_categories', 'blog_images', 'notifications', 'sessions');

`;

    // Insérer les catégories
    categories.forEach(category => {
      sqlContent += `INSERT INTO blog_categories (id, name, slug, description, color, createdAt) VALUES (
  '${category.id}',
  '${category.name.replace(/'/g, "''")}',
  '${category.slug}',
  ${category.description ? `'${category.description.replace(/'/g, "''")}'` : 'NULL'},
  ${category.color ? `'${category.color}'` : 'NULL'},
  '${category.createdAt.toISOString()}'
);\n\n`;
    });

    // Insérer les utilisateurs
    users.forEach(user => {
      sqlContent += `INSERT INTO users (id, firstName, lastName, email, password, role, avatar, memberSince, lastLogin, status, createdAt, updatedAt) VALUES (
  '${user.id}',
  '${user.firstName.replace(/'/g, "''")}',
  '${user.lastName.replace(/'/g, "''")}',
  '${user.email}',
  '${user.password}',
  '${user.role}',
  ${user.avatar ? `'${user.avatar}'` : 'NULL'},
  '${user.memberSince.toISOString()}',
  '${user.lastLogin.toISOString()}',
  '${user.status}',
  '${user.createdAt.toISOString()}',
  '${user.updatedAt.toISOString()}'
);\n\n`;
    });

    // Insérer les articles et relations
    users.forEach(user => {
      user.articles.forEach(article => {
        sqlContent += `INSERT INTO blog_articles (id, title, slug, excerpt, content, featuredImage, status, publishedAt, authorId, createdAt, updatedAt) VALUES (
  '${article.id}',
  '${article.title.replace(/'/g, "''")}',
  '${article.slug}',
  '${article.excerpt.replace(/'/g, "''")}',
  '${article.content.replace(/'/g, "''")}',
  ${article.featuredImage ? `'${article.featuredImage}'` : 'NULL'},
  '${article.status}',
  ${article.publishedAt ? `'${article.publishedAt.toISOString()}'` : 'NULL'},
  '${article.authorId}',
  '${article.createdAt.toISOString()}',
  '${article.updatedAt.toISOString()}'
);\n\n`;

        // Relations article-catégorie
        article.categories.forEach(articleCategory => {
          sqlContent += `INSERT INTO blog_article_categories (articleId, categoryId) VALUES (
  '${article.id}',
  '${articleCategory.categoryId}'
);\n\n`;
        });

        // Images
        article.images.forEach(image => {
          sqlContent += `INSERT INTO blog_images (id, articleId, originalName, fileName, filePath, mimeType, fileSize, width, height, altText, caption, order, createdAt) VALUES (
  '${image.id}',
  '${article.id}',
  '${image.originalName.replace(/'/g, "''")}',
  '${image.fileName}',
  '${image.filePath}',
  '${image.mimeType}',
  ${image.fileSize},
  ${image.width},
  ${image.height},
  ${image.altText ? `'${image.altText.replace(/'/g, "''")}'` : 'NULL'},
  ${image.caption ? `'${image.caption.replace(/'/g, "''")}'` : 'NULL'},
  ${image.order},
  '${image.createdAt.toISOString()}'
);\n\n`;
        });
      });

      // Notifications
      user.notifications.forEach(notification => {
        sqlContent += `INSERT INTO notifications (id, userId, type, title, message, data, isRead, createdAt) VALUES (
  '${notification.id}',
  '${user.id}',
  '${notification.type}',
  '${notification.title.replace(/'/g, "''")}',
  '${notification.message.replace(/'/g, "''")}',
  ${notification.data ? `'${notification.data.replace(/'/g, "''")}'` : 'NULL'},
  ${notification.isRead ? 1 : 0},
  '${notification.createdAt.toISOString()}'
);\n\n`;
      });

      // Sessions
      user.sessions.forEach(session => {
        sqlContent += `INSERT INTO sessions (id, userId, token, expiresAt, lastActivity, createdAt) VALUES (
  '${session.id}',
  '${user.id}',
  '${session.token}',
  '${session.expiresAt.toISOString()}',
  '${session.lastActivity.toISOString()}',
  '${session.createdAt.toISOString()}'
);\n\n`;
      });
    });

    fs.writeFileSync(sqlPath, sqlContent);

    // Créer un fichier de métadonnées
    const metadataPath = path.join(backupDir, 'metadata.json');
    const metadata = {
      backupName,
      backupAt: new Date().toISOString(),
      version: '1.0.0',
      stats: {
        users: users.length,
        articles: users.reduce((acc, user) => acc + user.articles.length, 0),
        categories: categories.length,
        notifications: users.reduce((acc, user) => acc + user.notifications.length, 0),
        sessions: users.reduce((acc, user) => acc + user.sessions.length, 0),
        images: users.reduce((acc, user) => acc + user.articles.reduce((acc2, article) => acc2 + article.images.length, 0), 0)
      },
      files: [
        'backup.json',
        'backup.sql',
        'metadata.json'
      ]
    };

    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    console.log(`✅ Sauvegarde créée: ${backupDir}`);
    console.log(`📊 Statistiques: ${metadata.stats.users} utilisateurs, ${metadata.stats.articles} articles, ${metadata.stats.categories} catégories`);

    // Nettoyer les anciennes sauvegardes (garder les 10 plus récentes)
    const backups = fs.readdirSync(backupsDir)
      .filter(dir => fs.statSync(path.join(backupsDir, dir)).isDirectory())
      .sort()
      .reverse();

    if (backups.length > 10) {
      const toDelete = backups.slice(10);
      toDelete.forEach(backup => {
        const backupPath = path.join(backupsDir, backup);
        fs.rmSync(backupPath, { recursive: true, force: true });
        console.log(`🗑️  Ancienne sauvegarde supprimée: ${backup}`);
      });
    }

    console.log('🎉 Sauvegarde terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde:', error);
  } finally {
    await prisma.$disconnect();
  }
}

backupDatabase(); 