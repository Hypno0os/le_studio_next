const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Début du seeding...')

  // Créer un utilisateur de test
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@lestudio.fr' },
    update: {},
    create: {
      firstName: 'Admin',
      lastName: 'Studio',
      email: 'admin@lestudio.fr',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE'
    }
  })

  console.log('✅ Utilisateur créé:', user.email)

  // Créer des catégories de blog
  const categories = await Promise.all([
    prisma.blogCategory.upsert({
      where: { slug: 'fitness' },
      update: {},
      create: {
        name: 'Fitness',
        slug: 'fitness',
        description: 'Conseils et actualités fitness',
        color: '#eab308'
      }
    }),
    prisma.blogCategory.upsert({
      where: { slug: 'nutrition' },
      update: {},
      create: {
        name: 'Nutrition',
        slug: 'nutrition',
        description: 'Conseils nutritionnels',
        color: '#10b981'
      }
    }),
    prisma.blogCategory.upsert({
      where: { slug: 'motivation' },
      update: {},
      create: {
        name: 'Motivation',
        slug: 'motivation',
        description: 'Conseils motivationnels',
        color: '#8b5cf6'
      }
    })
  ])

  console.log('✅ Catégories créées:', categories.map(c => c.name))

  // Créer un article de test
  const article = await prisma.blogArticle.upsert({
    where: { slug: 'bienvenue-au-studio' },
    update: {},
    create: {
      title: 'Bienvenue au Studio - Votre nouvelle aventure fitness commence ici',
      slug: 'bienvenue-au-studio',
      excerpt: 'Découvrez notre salle de sport premium à Biarritz et commencez votre transformation dès aujourd\'hui.',
      content: `
        <h2>Bienvenue au Studio !</h2>
        <p>Nous sommes ravis de vous accueillir dans notre salle de sport premium située au cœur de Biarritz, sur la magnifique Côte Basque.</p>
        
        <h3>Notre Philosophie</h3>
        <p>Au Studio, nous croyons que le fitness n'est pas seulement une question de performance physique, mais aussi de bien-être mental et d'équilibre de vie. Notre équipe de coachs passionnés est là pour vous accompagner dans l'atteinte de vos objectifs, quel que soit votre niveau.</p>
        
        <h3>Nos Services</h3>
        <ul>
          <li><strong>CrossFit :</strong> Entraînement fonctionnel de haute intensité</li>
          <li><strong>Cycling :</strong> Cardio-training en groupe avec musique motivante</li>
          <li><strong>Coaching Personnel :</strong> Programmes sur mesure adaptés à vos objectifs</li>
          <li><strong>Entraînement Fonctionnel :</strong> Mouvements naturels pour améliorer votre quotidien</li>
        </ul>
        
        <h3>Pourquoi Choisir Le Studio ?</h3>
        <p>Notre salle dispose d'équipements de dernière génération, d'un environnement convivial et d'une équipe de professionnels certifiés. Que vous soyez débutant ou sportif confirmé, nous avons le programme qu'il vous faut.</p>
        
        <p><strong>Prêt à commencer votre transformation ?</strong> Contactez-nous dès aujourd'hui pour réserver votre séance d'essai gratuite !</p>
      `,
      status: 'PUBLISHED',
      publishedAt: new Date(),
      authorId: user.id,
      featuredImage: '/assets/img/blog/actu1.png'
    }
  })

  console.log('✅ Article créé:', article.title)

  // Associer l'article aux catégories
  try {
    await prisma.blogArticleCategory.createMany({
      data: [
        { articleId: article.id, categoryId: categories[0].id },
        { articleId: article.id, categoryId: categories[2].id }
      ]
    })
    console.log('✅ Associations article-catégories créées')
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('ℹ️ Associations déjà existantes')
    } else {
      throw error
    }
  }

  console.log('🎉 Seeding terminé avec succès !')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 