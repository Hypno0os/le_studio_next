const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function exportDatabase() {
  try {
    console.log('🔄 Export de la base de données...');
    
    // Créer le dossier data s'il n'existe pas
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

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

    // Créer l'objet de données complet
    const databaseExport = {
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      tables: {
        users,
        categories
      }
    };

    // Exporter en JSON
    const jsonPath = path.join(dataDir, 'database-export.json');
    fs.writeFileSync(jsonPath, JSON.stringify(databaseExport, null, 2));
    console.log(`✅ Données exportées en JSON: ${jsonPath}`);

    // Créer un fichier SQL avec les données
    const sqlPath = path.join(dataDir, 'database-export.sql');
    let sqlContent = `-- Export de la base de données Studio Sport
-- Généré le: ${new Date().toISOString()}
-- Version: 1.0.0

`;

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

    // Insérer les articles
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

        // Insérer les relations article-catégorie
        article.categories.forEach(articleCategory => {
          sqlContent += `INSERT INTO blog_article_categories (articleId, categoryId) VALUES (
  '${article.id}',
  '${articleCategory.categoryId}'
);\n\n`;
        });

        // Insérer les images
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

      // Insérer les notifications
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

      // Insérer les sessions
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
    console.log(`✅ Données exportées en SQL: ${sqlPath}`);

    // Créer un fichier README pour expliquer les exports
    const readmePath = path.join(dataDir, 'README.md');
    const readmeContent = `# Export de la base de données Studio Sport

Ce dossier contient les exports de la base de données du projet Studio Sport.

## Fichiers disponibles

- \`database-export.json\` : Export complet au format JSON avec toutes les relations
- \`database-export.sql\` : Script SQL pour recréer les données
- \`README.md\` : Ce fichier

## Structure des données

### Tables principales
- \`users\` : Utilisateurs du système
- \`blog_articles\` : Articles du blog
- \`blog_categories\` : Catégories d'articles
- \`blog_images\` : Images des articles
- \`notifications\` : Notifications utilisateur
- \`sessions\` : Sessions utilisateur

### Relations
- Un utilisateur peut avoir plusieurs articles
- Un article peut avoir plusieurs catégories
- Un article peut avoir plusieurs images
- Un utilisateur peut avoir plusieurs notifications et sessions

## Utilisation

### Import JSON
\`\`\`javascript
const data = require('./data/database-export.json');
\`\`\`

### Import SQL
Exécutez le fichier \`database-export.sql\` dans votre base de données SQLite.

## Dernière exportation
${new Date().toISOString()}
`;

    fs.writeFileSync(readmePath, readmeContent);
    console.log(`✅ README créé: ${readmePath}`);

    console.log('🎉 Export terminé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'export:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportDatabase(); 