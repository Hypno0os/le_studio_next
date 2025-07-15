// Ce script migre les données de MySQL vers SQLite via Prisma
// Placez ce fichier dans scripts/ et lancez-le avec : node scripts/migrate-mysql-to-sqlite.js

const mysql = require('mysql2/promise');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// À adapter selon votre config locale
const MYSQL_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'salle_de_sport',
  port: 3306,
};

async function migrate() {
  const connection = await mysql.createConnection(MYSQL_CONFIG);
  console.log('Connecté à MySQL');

  // 1. Users
  const [users] = await connection.execute('SELECT * FROM user');
  for (const user of users) {
    await prisma.user.upsert({
      where: { id_user: user.id_user },
      update: {},
      create: {
        id_user: user.id_user,
        name: user.name,
        surname_user: user.surname_user,
        email: user.email,
        password: user.password,
      },
    });
  }
  console.log(`Migré ${users.length} users`);

  // 2. Articles
  const [articles] = await connection.execute('SELECT * FROM article');
  for (const article of articles) {
    await prisma.article.upsert({
      where: { id_article: article.id_article },
      update: {},
      create: {
        id_article: article.id_article,
        titre: article.titre,
        contenu: article.contenu,
        date_publication: article.date_publication,
        statut: article.statut,
        id_user: article.id_user,
      },
    });
  }
  console.log(`Migré ${articles.length} articles`);

  // 3. ArticleImages
  const [images] = await connection.execute('SELECT * FROM articleimage');
  for (const img of images) {
    await prisma.articleImage.upsert({
      where: { id: img.id },
      update: {},
      create: {
        id: img.id,
        filename: img.filename,
        format: img.format,
        id_article: img.id_article,
      },
    });
  }
  console.log(`Migré ${images.length} images`);

  await connection.end();
  await prisma.$disconnect();
  console.log('Migration terminée !');
}

migrate().catch(e => {
  console.error(e);
  process.exit(1);
}); 